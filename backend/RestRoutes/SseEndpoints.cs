namespace RestRoutes;

using Microsoft.AspNetCore.Mvc;
using YesSql.Services;
using System.Text.Json;

public static class SseEndpoints
{
    // Heartbeat interval in milliseconds (keeps SSE connections alive)
    private const int HEARTBEAT_INTERVAL_MS = 20000;

    public static void MapSseEndpoints(this WebApplication app)
    {
        app.MapGet("/api/sse/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            [FromServices] SseConnectionManager connectionManager,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Set SSE headers
            context.Response.Headers["Content-Type"] = "text/event-stream";
            context.Response.Headers["Cache-Control"] = "no-cache";
            context.Response.Headers["Connection"] = "keep-alive";
            context.Response.Headers["X-Accel-Buffering"] = "no"; // Disable nginx buffering

            var writer = new StreamWriter(context.Response.Body);
            // Don't use AutoFlush - we'll manually flush async

            try
            {
                // Get initial data with filters (but no orderby/limit/offset for SSE)
                var cleanObjects = await GetRoutes.FetchCleanContent(contentType, session, populate: true);

                // Apply WHERE filters only (extract just the WHERE part)
                var filteredData = ApplyWhereFiltersOnly(context.Request.Query, cleanObjects);

                // Send initial data
                await SendSseEvent(writer, "initial", filteredData);

                // Register connection with filters
                var connection = new SseConnection(
                    writer,
                    contentType,
                    context.Request.Query,
                    context.RequestAborted
                );
                connectionManager.AddConnection(contentType, connection);

                // Keep connection alive until client disconnects
                while (!context.RequestAborted.IsCancellationRequested)
                {
                    // Send periodic heartbeat to keep connection alive
                    await writer.WriteAsync(": heartbeat\n\n");
                    await writer.FlushAsync();
                    await Task.Delay(HEARTBEAT_INTERVAL_MS);
                }
            }
            catch (Exception ex)
            {
                // Connection closed or error
                Console.WriteLine($"SSE connection closed: {ex.Message}");
            }
            finally
            {
                await writer.DisposeAsync();
            }

            return Results.Empty;
        });
    }

    public static async Task SendSseEvent(StreamWriter writer, string eventType, object data)
    {
        try
        {
            var json = JsonSerializer.Serialize(data);
            await writer.WriteAsync($"event: {eventType}\n");
            await writer.WriteAsync($"data: {json}\n\n");
            await writer.FlushAsync();
        }
        catch (Exception)
        {
            // Connection closed, ignore
        }
    }

    // Apply WHERE filters only (no orderby, limit, offset)
    private static List<Dictionary<string, object>> ApplyWhereFiltersOnly(
        IQueryCollection query,
        List<Dictionary<string, object>> data)
    {
        string? where = query["where"];

        if (string.IsNullOrEmpty(where))
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

        // Apply WHERE filters (reuse GetRoutes logic)
        arr = ApplyWhereFilters(arr, where);

        // Convert back to List<Dictionary>
        return ConvertFromArr(arr);
    }

    // Copy filtering logic from GetRoutes.QueryFilters.cs
    private static Obj ConvertToObj(Dictionary<string, object> dict)
    {
        var obj = Obj();
        foreach (var kvp in dict)
        {
            if (kvp.Value is Dictionary<string, object> nestedDict)
            {
                obj[kvp.Key] = ConvertToObj(nestedDict);
            }
            else if (kvp.Value is System.Collections.IEnumerable enumerable && kvp.Value is not string)
            {
                // Handle any enumerable (List<object>, List<string>, arrays, etc.) but not strings
                var arr = Arr();
                foreach (var item in enumerable)
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
                dict[key] = ConvertFromObj(nestedObj);
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

        if (faulty) return data;

        var keys = Arr();
        var values = Arr();
        var operators = Arr();

        for (var j = 0; j < mappedParts.Length; j++)
        {
            if (j % 4 == 0)
            {
                // Trim whitespace before cleaning
                var trimmed = ((string)mappedParts[j]).Trim();
                keys.Push(System.Text.RegularExpressions.Regex.Replace(trimmed, @"[^A-Za-z0-9_\-,\.]", ""));
            }
            else if (j % 4 == 2)
            {
                // Trim whitespace from values
                values.Push(((string)mappedParts[j]).Trim());
            }
            else if (j % 2 == 1 && j % 4 != 3)
            {
                operators.Push(mappedParts[j]);
            }
        }

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

            var valueStr = value?.ToString() ?? "";

            // Handle arrays - check if any element matches
            if (itemValue is Arr arr)
            {
                foreach (var element in arr)
                {
                    var elementStr = element?.ToString() ?? "";

                    bool matches = op switch
                    {
                        "=" => elementStr == valueStr,
                        "!=" => elementStr != valueStr,
                        ">" => CompareNumeric(elementStr, valueStr) > 0,
                        "<" => CompareNumeric(elementStr, valueStr) < 0,
                        ">=" => CompareNumeric(elementStr, valueStr) >= 0,
                        "<=" => CompareNumeric(elementStr, valueStr) <= 0,
                        "LIKE" => elementStr.ToLower().Contains(valueStr.ToLower()),
                        _ => false
                    };

                    if (matches) return true; // Any element matches
                }
                return false; // No elements matched
            }

            // Handle single values
            var itemStr = itemValue.ToString();

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
}