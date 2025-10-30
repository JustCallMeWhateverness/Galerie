namespace RestRoutes;

using OrchardCore.ContentManagement;
using OrchardCore.ContentManagement.Records;
using YesSql.Services;
using System.Text.Json;

public static partial class GetRoutes
{
    // Extract existing logic into reusable method
    public static async Task<List<Dictionary<string, object>>> FetchCleanContent(
        string contentType,
        YesSql.ISession session,
        bool populate = true)
    {
        var contentItems = await session
            .Query()
            .For<ContentItem>()
            .With<ContentItemIndex>(x => x.ContentType == contentType && x.Published)
            .ListAsync();

        var jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
        };
        var jsonString = JsonSerializer.Serialize(contentItems, jsonOptions);
        var plainObjects = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(jsonString);
        if (plainObjects == null) return new List<Dictionary<string, object>>();

        // Only populate if requested
        if (populate)
        {
            var allReferencedIds = new HashSet<string>();
            foreach (var obj in plainObjects)
            {
                CollectContentItemIds(obj, allReferencedIds);
            }

            if (allReferencedIds.Count > 0)
            {
                var referencedItems = await session
                    .Query()
                    .For<ContentItem>()
                    .With<ContentItemIndex>(x => x.ContentItemId.IsIn(allReferencedIds))
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

                    foreach (var obj in plainObjects)
                    {
                        PopulateContentItemIds(obj, itemsDictionary);
                    }
                }
            }
        }

        // Collect all UserIds for enrichment
        Dictionary<string, JsonElement>? usersDictionary = null;
        if (populate)
        {
            var allUserIds = new HashSet<string>();
            foreach (var obj in plainObjects)
            {
                CollectUserIds(obj, allUserIds);
            }

            if (allUserIds.Count > 0)
            {
                // Query UserIndex to get user data
                var users = await session
                    .Query()
                    .For<OrchardCore.Users.Models.User>()
                    .With<OrchardCore.Users.Indexes.UserIndex>(x => x.UserId.IsIn(allUserIds))
                    .ListAsync();

                if (users.Any())
                {
                    var usersJsonString = JsonSerializer.Serialize(users, jsonOptions);
                    var plainUsers = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(usersJsonString);
                    if (plainUsers != null)
                    {
                        usersDictionary = new Dictionary<string, JsonElement>();
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
                    }
                }
            }
        }

        // Clean up the bullshit
        var cleanObjects = plainObjects.Select(obj => CleanObject(obj, contentType, usersDictionary)).ToList();

        // Second population pass: cleanup may have introduced new ID fields (e.g., from BagPart items)
        if (populate && cleanObjects.Count > 0)
        {
            // Convert cleanObjects to JsonElement for processing
            var cleanJsonString = JsonSerializer.Serialize(cleanObjects);
            var cleanPlainObjects = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(cleanJsonString);

            if (cleanPlainObjects != null)
            {
                // Collect any new IDs that appeared during cleanup
                var newReferencedIds = new HashSet<string>();
                foreach (var obj in cleanPlainObjects)
                {
                    CollectContentItemIds(obj, newReferencedIds);
                }

                if (newReferencedIds.Count > 0)
                {
                    // Fetch the newly referenced items
                    var newReferencedItems = await session
                        .Query()
                        .For<ContentItem>()
                        .With<ContentItemIndex>(x => x.ContentItemId.IsIn(newReferencedIds))
                        .ListAsync();

                    var newRefJsonString = JsonSerializer.Serialize(newReferencedItems, jsonOptions);
                    var plainNewRefItems = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(newRefJsonString);

                    if (plainNewRefItems != null)
                    {
                        // Create dictionary with cleaned items
                        var newItemsDictionary = new Dictionary<string, Dictionary<string, object>>();
                        foreach (var item in plainNewRefItems)
                        {
                            if (item.TryGetValue("ContentItemId", out var idElement) &&
                                item.TryGetValue("ContentType", out var typeElement))
                            {
                                var id = idElement.GetString();
                                var type = typeElement.GetString();
                                if (id != null && type != null)
                                {
                                    // Clean the item before adding to dictionary
                                    newItemsDictionary[id] = CleanObject(item, type, usersDictionary);
                                }
                            }
                        }

                        // Populate the IDs in cleaned data with cleaned items
                        cleanObjects = PopulateWithCleanedItems(cleanPlainObjects, newItemsDictionary);
                    }
                }
            }
        }

        return cleanObjects;
    }

    // Helper to populate ID fields with already-cleaned items
    private static List<Dictionary<string, object>> PopulateWithCleanedItems(
        List<Dictionary<string, JsonElement>> objects,
        Dictionary<string, Dictionary<string, object>> cleanedItemsDictionary)
    {
        var result = new List<Dictionary<string, object>>();

        foreach (var obj in objects)
        {
            var populated = PopulateObjectWithCleanedItems(obj, cleanedItemsDictionary);
            result.Add(populated);
        }

        return result;
    }

    private static Dictionary<string, object> PopulateObjectWithCleanedItems(
        Dictionary<string, JsonElement> obj,
        Dictionary<string, Dictionary<string, object>> cleanedItemsDictionary)
    {
        var result = new Dictionary<string, object>();

        foreach (var kvp in obj)
        {
            var key = kvp.Key;
            var value = kvp.Value;

            // Handle singular ID fields (e.g., "ingredientId" -> "ingredient"), but skip "id" itself
            if (key != "id" && key.EndsWith("Id") && value.ValueKind == JsonValueKind.String)
            {
                var idStr = value.GetString();
                if (idStr != null && cleanedItemsDictionary.TryGetValue(idStr, out var cleanedItem))
                {
                    // Replace "ingredientId" with "ingredient" containing cleaned data
                    var newKey = key.Substring(0, key.Length - 2);
                    result[newKey] = cleanedItem;
                    continue;
                }
                // If not found in dictionary, keep the original ID field
                result[key] = JsonElementToObject(value);
                continue;
            }

            // Recursively handle nested objects
            if (value.ValueKind == JsonValueKind.Object)
            {
                var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(value.GetRawText());
                if (nested != null)
                {
                    result[key] = PopulateObjectWithCleanedItems(nested, cleanedItemsDictionary);
                }
                else
                {
                    result[key] = JsonElementToObject(value);
                }
                continue;
            }

            // Recursively handle arrays
            if (value.ValueKind == JsonValueKind.Array)
            {
                var array = new List<object>();
                foreach (var item in value.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                        if (nested != null)
                        {
                            array.Add(PopulateObjectWithCleanedItems(nested, cleanedItemsDictionary));
                        }
                    }
                    else
                    {
                        array.Add(JsonElementToObject(item));
                    }
                }
                result[key] = array;
                continue;
            }

            // Handle primitive values (including "id")
            result[key] = JsonElementToObject(value);
        }

        return result;
    }

    // Fetch raw content without cleanup (for debugging/edge cases)
    public static async Task<List<Dictionary<string, object>>> FetchRawContent(
        string contentType,
        YesSql.ISession session)
    {
        var contentItems = await session
            .Query()
            .For<ContentItem>()
            .With<ContentItemIndex>(x => x.ContentType == contentType && x.Published)
            .ListAsync();

        var jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
        };
        var jsonString = JsonSerializer.Serialize(contentItems, jsonOptions);

        // Deserialize to JsonElement first, then convert to object
        var jsonDoc = JsonDocument.Parse(jsonString);
        var rawObjects = new List<Dictionary<string, object>>();

        foreach (var element in jsonDoc.RootElement.EnumerateArray())
        {
            rawObjects.Add(JsonElementToDictionary(element));
        }

        return rawObjects;
    }

    private static Dictionary<string, object> JsonElementToDictionary(JsonElement element)
    {
        var dict = new Dictionary<string, object>();

        foreach (var property in element.EnumerateObject())
        {
            dict[property.Name] = JsonElementToObject(property.Value);
        }

        return dict;
    }

    private static object JsonElementToObject(JsonElement element)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                return JsonElementToDictionary(element);
            case JsonValueKind.Array:
                var list = new List<object>();
                foreach (var item in element.EnumerateArray())
                {
                    list.Add(JsonElementToObject(item));
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
}
