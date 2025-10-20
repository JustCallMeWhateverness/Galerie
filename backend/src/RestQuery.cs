namespace WebApp;

public static class RestQuery
{
    public static dynamic Parse(IQueryCollection query)
    {
        string where = query["where"];
        string orderby = query["orderby"];
        string limit = query["limit"];
        string offset = query["offset"];
        string sql = "";
        var parameters = Obj();

        if (where != null)
        {
            // Split by operators (but keep them) so that we get
            // an array like this:
            // ["firstName","=","Maria","AND","lastName","!=","Smith"]
            // ops1 = operators ok to write in query, thus you can write _AND_ if yo want to for clearity
            // ops2 = the operators we actually translate to...
            var ops1 = Arr("!=", ">=", "<=", "=", ">", "<", "_LIKE_", "_AND_", "_OR_", "LIKE", "AND", "OR");
            var ops2 = Arr("!=", ">=", "<=", "=", ">", "<", "LIKE", "AND", "OR", "LIKE", "AND", "OR");
            foreach (var op in ops1)
            {
                where = Arr(where.Split(op)).Join($"_-_{ops1.IndexOf(op)}_-_");
            }
            var parts = Arr(where.Split("_-_"))
                .Map((x, i) => i % 2 == 0 ? x : ops2[((string)x).ToInt()]);
            // Now we should have AND or OR on every 4:th place (n%4 = 3)
            // otherwise the syntax is incorrect!
            var i = 0;
            var faulty = parts
                .Some(x => i++ % 4 == 3 ? x != "AND" && x != "OR" : false);
            if (!faulty)
            {
                // We have keys on every n%4 = 0 place, collect those
                // and clean them so they only have safe characters
                var keys = parts
                    .Filter((x, i) => i % 4 == 0)
                    .Map(x => ((string)x).Regplace(@"[^A-Za-z0-9_\-,]", ""));
                // We have values on every n%4 = 2 place, collect those
                var values = parts.Filter((x, i) => i % 4 == 2);
                // And operators on every n%2 = 1 place, collect those
                var operators = parts.Filter((x, i) => i % 2 == 1);
                // Now build the sql for where and the parameter array
                var sqlWhere = "";
                while (values.Length > 0)
                {
                    var key = (string)keys.Shift();
                    var value = values.Shift().TryToNumber();
                    sqlWhere += $"{key} {operators.Shift()} ${key}";
                    sqlWhere += operators.Length == 0 ? "" : $" {operators.Shift()} ";
                    parameters[key] = value;
                }

                sql += " WHERE " + sqlWhere;
            }
        }

        // Sanitize orderby and change -field to field DESC
        if (orderby != null)
        {
            orderby = Arr(orderby.Regplace(@"[^A-Za-z0-9_\-,]", "").Split(","))
                .Map(x => ((string)x)
                    .Regplace(@"\+", "").Regplace(@"^\-(.*)", "$1 DESC")
                    .Regplace(@"\-", "")).Join(",");
            sql += " ORDER BY " + orderby;
        }

        // Check that limit is an integer, if so use it
        var hasLimit = false;
        if (limit != null && limit.Match(@"^\d{1,}$"))
        {
            sql += " LIMIT " + limit;
            hasLimit = true;
        }

        // If we have a limit and offset is an integer, use it
        if (hasLimit && offset != null && offset.Match(@"^\d{1,}$"))
        {
            sql += " OFFSET " + offset;
        }
        return Obj(new { sql, parameters });
    }
}