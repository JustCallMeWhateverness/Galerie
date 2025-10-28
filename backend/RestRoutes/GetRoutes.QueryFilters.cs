namespace RestRoutes;

using System.Text.RegularExpressions;

public static partial class GetRoutes
{
    private static List<Dictionary<string, object>> ApplyQueryFilters(
        IQueryCollection query,
        List<Dictionary<string, object>> data)
    {
        string? where = query["where"];
        string? orderby = query["orderby"];
        string? limit = query["limit"];
        string? offset = query["offset"];

        // If no query params, return data as-is
        if (string.IsNullOrEmpty(where) &&
            string.IsNullOrEmpty(orderby) &&
            string.IsNullOrEmpty(limit) &&
            string.IsNullOrEmpty(offset))
        {
            return data;
        }

        // Convert to Dyndata Arr
        var arrItems = new List<Obj>();
        foreach (var d in data)
        {
            arrItems.Add(ConvertToObj(d));
        }
        var arr = Arr(arrItems.ToArray());

        // Apply WHERE filters
        if (!string.IsNullOrEmpty(where))
        {
            arr = ApplyWhereFilters(arr, where);
        }

        // Apply ORDER BY
        if (!string.IsNullOrEmpty(orderby))
        {
            arr = ApplyOrderBy(arr, orderby);
        }

        // Apply LIMIT and OFFSET
        int? limitInt = !string.IsNullOrEmpty(limit) && Regex.IsMatch(limit, @"^\d{1,}$")
            ? int.Parse(limit) : null;
        int? offsetInt = !string.IsNullOrEmpty(offset) && Regex.IsMatch(offset, @"^\d{1,}$")
            ? int.Parse(offset) : null;

        if (offsetInt.HasValue && limitInt.HasValue)
        {
            arr = Arr(arr.Slice(offsetInt.Value, offsetInt.Value + limitInt.Value));
        }
        else if (limitInt.HasValue)
        {
            arr = Arr(arr.Slice(0, limitInt.Value));
        }

        // Convert back to List<Dictionary>
        return ConvertFromArr(arr);
    }

    private static Obj ConvertToObj(Dictionary<string, object> dict)
    {
        var obj = Obj();
        foreach (var kvp in dict)
        {
            if (kvp.Value is Dictionary<string, object> nestedDict)
            {
                obj[kvp.Key] = ConvertToObj(nestedDict);  // Recursive for nested objects
            }
            else if (kvp.Value is List<object> list)
            {
                // Handle arrays (if any)
                var arr = Arr();
                foreach (var item in list)
                {
                    if (item is Dictionary<string, object> itemDict)
                    {
                        arr.Push(ConvertToObj(itemDict));
                    }
                    else
                    {
                        arr.Push(item);
                    }
                }
                obj[kvp.Key] = arr;
            }
            else
            {
                obj[kvp.Key] = kvp.Value;
            }
        }
        return obj;
    }

    private static List<Dictionary<string, object>> ConvertFromArr(Arr arr)
    {
        var result = new List<Dictionary<string, object>>();
        foreach (Obj item in arr)
        {
            result.Add(ConvertFromObj(item));
        }
        return result;
    }

    private static Dictionary<string, object> ConvertFromObj(Obj obj)
    {
        var dict = new Dictionary<string, object>();
        foreach (var key in obj.GetKeys())
        {
            var value = obj[key];
            if (value is Obj nestedObj)
            {
                dict[key] = ConvertFromObj(nestedObj);  // Recursive!
            }
            else if (value is Arr nestedArr)
            {
                var list = new List<object>();
                foreach (var item in nestedArr)
                {
                    if (item is Obj itemObj)
                    {
                        list.Add(ConvertFromObj(itemObj));
                    }
                    else
                    {
                        list.Add(item);
                    }
                }
                dict[key] = list;
            }
            else
            {
                dict[key] = value;
            }
        }
        return dict;
    }

    private static Arr ApplyWhereFilters(Arr data, string where)
    {
        // Split by operators (but keep them)
        var ops1 = Arr("!=", ">=", "<=", "=", ">", "<", "_LIKE_", "_AND_", "LIKE", "AND");
        var ops2 = Arr("!=", ">=", "<=", "=", ">", "<", "LIKE", "AND", "LIKE", "AND");

        foreach (var op in ops1)
        {
            var splitParts = where.Split((string)op);
            where = string.Join($"_-_{ops1.IndexOf(op)}_-_", splitParts);
        }

        var parts = Arr(where.Split("_-_"));
        var mappedParts = Arr();
        var idx = 0;
        foreach (var x in parts)
        {
            if (idx % 2 == 0)
            {
                mappedParts.Push(x);
            }
            else
            {
                mappedParts.Push(ops2[int.Parse((string)x)]);
            }
            idx++;
        }

        // Validate structure (AND every 4th position)
        var i = 0;
        var faulty = false;
        foreach (var x in mappedParts)
        {
            if (i++ % 4 == 3 && (string)x != "AND")
            {
                faulty = true;
                break;
            }
        }

        if (faulty)
        {
            return data; // Invalid syntax, return unfiltered
        }

        // Extract keys, values, operators
        var keys = Arr();
        var values = Arr();
        var operators = Arr();

        for (var j = 0; j < mappedParts.Length; j++)
        {
            if (j % 4 == 0)
            {
                keys.Push(Regex.Replace((string)mappedParts[j], @"[^A-Za-z0-9_\-,\.]", ""));
            }
            else if (j % 4 == 2)
            {
                values.Push(mappedParts[j]);
            }
            else if (j % 2 == 1 && j % 4 != 3)
            {
                operators.Push(mappedParts[j]);
            }
        }

        // Apply each filter sequentially
        var result = data;
        for (var idx2 = 0; idx2 < keys.Length; idx2++)
        {
            var key = (string)keys[idx2];
            var op = (string)operators[idx2];
            var value = values[idx2];

            result = ApplySingleFilter(result, key, op, value);
        }

        return result;
    }

    private static Arr ApplySingleFilter(Arr data, string key, string op, dynamic value)
    {
        var keyParts = key.Split('.');

        return data.Filter(item =>
        {
            var itemValue = GetNestedValue(item, keyParts);

            if (itemValue == null) return false;

            var itemStr = itemValue.ToString();
            var valueStr = value?.ToString() ?? "";

            return op switch
            {
                "=" => itemStr == valueStr,
                "!=" => itemStr != valueStr,
                ">" => CompareNumeric(itemStr, valueStr) > 0,
                "<" => CompareNumeric(itemStr, valueStr) < 0,
                ">=" => CompareNumeric(itemStr, valueStr) >= 0,
                "<=" => CompareNumeric(itemStr, valueStr) <= 0,
                "LIKE" => itemStr.ToLower().Contains(valueStr.ToLower()),
                _ => false
            };
        });
    }

    private static dynamic? GetNestedValue(dynamic obj, string[] keyParts)
    {
        dynamic current = obj;

        foreach (var part in keyParts)
        {
            if (current is Obj dynObj && dynObj.HasKey(part))
            {
                current = dynObj[part];
            }
            else
            {
                return null;
            }
        }

        return current;
    }

    private static int CompareNumeric(string a, string b)
    {
        if (double.TryParse(a, out var aNum) && double.TryParse(b, out var bNum))
        {
            return aNum.CompareTo(bNum);
        }
        return string.Compare(a, b, StringComparison.Ordinal);
    }

    private static Arr ApplyOrderBy(Arr data, string orderby)
    {
        // Clean orderby string
        orderby = Regex.Replace(orderby, @"[^A-Za-z0-9_\-,\.]", "");
        var orderFields = orderby.Split(",");

        // Convert to list for LINQ sorting
        var list = new List<Obj>();
        foreach (Obj item in data)
        {
            list.Add(item);
        }

        IOrderedEnumerable<Obj>? ordered = null;

        foreach (var field in orderFields)
        {
            var trimmed = field.Trim();
            var cleaned = Regex.Replace(trimmed, @"\+", "");
            var isDesc = cleaned.StartsWith("-");
            var fieldName = isDesc ? cleaned.Substring(1) : cleaned;
            var keyParts = fieldName.Split('.');

            if (ordered == null)
            {
                // First sort
                ordered = isDesc
                    ? list.OrderByDescending(item => GetNestedValue(item, keyParts)?.ToString() ?? "")
                    : list.OrderBy(item => GetNestedValue(item, keyParts)?.ToString() ?? "");
            }
            else
            {
                // ThenBy for multiple sorts
                ordered = isDesc
                    ? ordered.ThenByDescending(item => GetNestedValue(item, keyParts)?.ToString() ?? "")
                    : ordered.ThenBy(item => GetNestedValue(item, keyParts)?.ToString() ?? "");
            }
        }

        var finalList = ordered != null ? ordered.ToList() : list;
        return Arr(finalList.ToArray());
    }
}
