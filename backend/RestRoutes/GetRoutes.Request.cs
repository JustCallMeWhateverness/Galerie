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

        // Clean up the bullshit
        var cleanObjects = plainObjects.Select(obj => CleanObject(obj, contentType)).ToList();
        return cleanObjects;
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
