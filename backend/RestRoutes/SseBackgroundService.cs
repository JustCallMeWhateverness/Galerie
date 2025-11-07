namespace RestRoutes;

using Microsoft.Extensions.Hosting;
using OrchardCore.ContentManagement;
using OrchardCore.ContentManagement.Records;
using YesSql;
using YesSql.Services;
using System.Text.Json;

public class SseBackgroundService : BackgroundService
{
    // Polling interval in milliseconds (how often to check for new items)
    private const int POLLING_INTERVAL_MS = 3000;

    private readonly SseConnectionManager _connectionManager;
    private readonly IServiceProvider _serviceProvider;
    private DateTime _lastCheckTime;

    public SseBackgroundService(
        SseConnectionManager connectionManager,
        IServiceProvider serviceProvider)
    {
        _connectionManager = connectionManager;
        _serviceProvider = serviceProvider;
        _lastCheckTime = DateTime.UtcNow;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckForNewItems();
                _connectionManager.CleanupDisconnected();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SSE Background Service Error: {ex.Message}");
            }

            // Wait before next check
            await Task.Delay(POLLING_INTERVAL_MS, stoppingToken);
        }
    }

    private async Task CheckForNewItems()
    {
        var currentCheckTime = DateTime.UtcNow;
        var contentTypes = _connectionManager.GetAllContentTypes().ToList();

        if (!contentTypes.Any())
        {
            return; // No active connections
        }

        // Get shell host and all running shell contexts
        var shellHost = _serviceProvider.GetRequiredService<OrchardCore.Environment.Shell.IShellHost>();
        var shellContexts = shellHost.ListShellContexts();

        // Use the first (default) shell context
        var shellContext = shellContexts.FirstOrDefault();
        if (shellContext == null) return;

        var shellScope = await shellHost.GetScopeAsync(shellContext.Settings);

        await using (shellScope)
        {
            var session = shellScope.ServiceProvider.GetRequiredService<ISession>();

            foreach (var contentType in contentTypes)
            {
                try
                {
                    // Query for items created since last check
                    var newItems = await session
                        .Query()
                        .For<ContentItem>()
                        .With<ContentItemIndex>(x =>
                            x.ContentType == contentType &&
                            x.Published &&
                            x.CreatedUtc > _lastCheckTime)
                        .ListAsync();

                    if (newItems.Any())
                    {
                        // Serialize and deserialize to get plain objects
                        var jsonOptions = new JsonSerializerOptions
                        {
                            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
                        };
                        var jsonString = JsonSerializer.Serialize(newItems, jsonOptions);
                        var plainObjects = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(jsonString);

                        if (plainObjects != null)
                        {
                            // Populate each new item
                            var populatedItems = new List<Dictionary<string, object>>();

                            foreach (var plainObj in plainObjects)
                            {
                                // Collect reference IDs for this item
                                var referencedIds = new HashSet<string>();
                                GetRoutes.CollectContentItemIds(plainObj, referencedIds);

                                var itemDict = new Dictionary<string, object>();
                                foreach (var kvp in plainObj)
                                {
                                    itemDict[kvp.Key] = ConvertJsonElement(kvp.Value);
                                }

                                // Populate references if any
                                if (referencedIds.Count > 0)
                                {
                                    var referencedItems = await session
                                        .Query()
                                        .For<ContentItem>()
                                        .With<ContentItemIndex>(x => x.ContentItemId.IsIn(referencedIds))
                                        .ListAsync();

                                    var refJsonString = JsonSerializer.Serialize(referencedItems, jsonOptions);
                                    var plainRefItems = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(refJsonString);

                                    if (plainRefItems != null)
                                    {
                                        var itemsDictionary = new Dictionary<string, Dictionary<string, JsonElement>>();
                                        foreach (var item in plainRefItems)
                                        {
                                            if (item.TryGetValue("ContentItemId", out var idElement))
                                            {
                                                var id = idElement.GetString();
                                                if (id != null) itemsDictionary[id] = item;
                                            }
                                        }

                                        // Convert to plain object for population
                                        var plainObjForPop = new Dictionary<string, JsonElement>();
                                        foreach (var kvp in itemDict)
                                        {
                                            plainObjForPop[kvp.Key] = JsonSerializer.SerializeToElement(kvp.Value);
                                        }

                                        GetRoutes.PopulateContentItemIds(plainObjForPop, itemsDictionary);

                                        // Convert back
                                        itemDict = new Dictionary<string, object>();
                                        foreach (var kvp in plainObjForPop)
                                        {
                                            itemDict[kvp.Key] = ConvertJsonElement(kvp.Value);
                                        }
                                    }
                                }

                                // Collect user IDs and enrich
                                var userIds = new HashSet<string>();
                                var itemForUserCheck = new Dictionary<string, JsonElement>();
                                foreach (var kvp in itemDict)
                                {
                                    itemForUserCheck[kvp.Key] = JsonSerializer.SerializeToElement(kvp.Value);
                                }
                                GetRoutes.CollectUserIds(itemForUserCheck, userIds);

                                if (userIds.Count > 0)
                                {
                                    var users = await session
                                        .Query()
                                        .For<OrchardCore.Users.Models.User>()
                                        .With<OrchardCore.Users.Indexes.UserIndex>(x => x.UserId.IsIn(userIds))
                                        .ListAsync();

                                    if (users.Any())
                                    {
                                        var usersJsonString = JsonSerializer.Serialize(users, jsonOptions);
                                        var plainUsers = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(usersJsonString);
                                        if (plainUsers != null)
                                        {
                                            var usersDictionary = new Dictionary<string, JsonElement>();
                                            foreach (var user in plainUsers)
                                            {
                                                if (user.TryGetValue("UserId", out var userIdElement))
                                                {
                                                    var userId = userIdElement.GetString();
                                                    if (userId != null)
                                                    {
                                                        usersDictionary[userId] = JsonSerializer.SerializeToElement(user);
                                                    }
                                                }
                                            }

                                            // Re-serialize for cleanup with users
                                            itemForUserCheck = new Dictionary<string, JsonElement>();
                                            foreach (var kvp in itemDict)
                                            {
                                                itemForUserCheck[kvp.Key] = JsonSerializer.SerializeToElement(kvp.Value);
                                            }

                                            itemDict = GetRoutes.CleanObject(itemForUserCheck, contentType, usersDictionary);
                                        }
                                    }
                                }
                                else
                                {
                                    // No users, just cleanup
                                    itemDict = GetRoutes.CleanObject(itemForUserCheck, contentType, null);
                                }

                                populatedItems.Add(itemDict);
                            }

                            // Broadcast to each connection with matching filters
                            await BroadcastToConnections(contentType, populatedItems);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error checking {contentType}: {ex.Message}");
                }
            }
        } // Close the shell scope

        _lastCheckTime = currentCheckTime;
    }

    private async Task BroadcastToConnections(string contentType, List<Dictionary<string, object>> items)
    {
        var connections = _connectionManager.GetConnections(contentType).ToList();

        foreach (var connection in connections)
        {
            if (!connection.IsConnected || connection.CancellationToken.IsCancellationRequested)
            {
                continue;
            }

            try
            {
                // Apply filters to items
                var filteredItems = ApplyConnectionFilters(connection, items);

                if (filteredItems.Any())
                {
                    // Send each new item separately
                    foreach (var item in filteredItems)
                    {
                        await SseEndpoints.SendSseEvent(connection.Writer, "new", item);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error broadcasting to connection: {ex.Message}");
                connection.IsConnected = false;
            }
        }
    }

    private List<Dictionary<string, object>> ApplyConnectionFilters(SseConnection connection, List<Dictionary<string, object>> items)
    {
        string? where = connection.QueryFilters["where"];

        if (string.IsNullOrEmpty(where))
        {
            return items;
        }

        // Apply WHERE filters using Dyndata
        var arrItems = new List<Obj>();
        foreach (var item in items)
        {
            arrItems.Add(ConvertToObj(item));
        }
        var arr = Arr(arrItems.ToArray());

        // Reuse filtering logic from SseEndpoints
        arr = ApplyWhereFilters(arr, where);

        // Convert back
        var result = new List<Dictionary<string, object>>();
        foreach (Obj item in arr)
        {
            result.Add(ConvertFromObj(item));
        }
        return result;
    }

    // Helper methods (duplicated from SseEndpoints for now)
    private static object ConvertJsonElement(JsonElement element)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                var dict = new Dictionary<string, object>();
                foreach (var prop in element.EnumerateObject())
                {
                    dict[prop.Name] = ConvertJsonElement(prop.Value);
                }
                return dict;
            case JsonValueKind.Array:
                var list = new List<object>();
                foreach (var item in element.EnumerateArray())
                {
                    list.Add(ConvertJsonElement(item));
                }
                return list;
            case JsonValueKind.String:
                return element.GetString() ?? "";
            case JsonValueKind.Number:
                return element.GetDouble();
            case JsonValueKind.True:
            case JsonValueKind.False:
                return element.GetBoolean();
            case JsonValueKind.Null:
                return null!;
            default:
                return element.ToString();
        }
    }

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