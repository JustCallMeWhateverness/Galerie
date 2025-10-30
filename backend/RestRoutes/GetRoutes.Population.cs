namespace RestRoutes;

using System.Text.Json;

public static partial class GetRoutes
{
    private static void CollectContentItemIds(Dictionary<string, JsonElement> obj, HashSet<string> ids)
    {
        foreach (var kvp in obj)
        {
            if (kvp.Key == "ContentItemIds" && kvp.Value.ValueKind == JsonValueKind.Array)
            {
                foreach (var id in kvp.Value.EnumerateArray())
                {
                    if (id.ValueKind == JsonValueKind.String)
                    {
                        var idStr = id.GetString();
                        if (idStr != null) ids.Add(idStr);
                    }
                }
            }
            // Also collect from singular ID fields (e.g., "ingredientId"), but skip "id" and "ContentItemId"
            else if (kvp.Key != "id" && kvp.Key != "ContentItemId" && kvp.Key.EndsWith("Id") && kvp.Value.ValueKind == JsonValueKind.String)
            {
                var idStr = kvp.Value.GetString();
                if (idStr != null) ids.Add(idStr);
            }
            else if (kvp.Value.ValueKind == JsonValueKind.Object)
            {
                var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
                if (nested != null) CollectContentItemIds(nested, ids);
            }
            else if (kvp.Value.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in kvp.Value.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                        if (nested != null) CollectContentItemIds(nested, ids);
                    }
                }
            }
        }
    }

    private static void CollectUserIds(Dictionary<string, JsonElement> obj, HashSet<string> userIds)
    {
        foreach (var kvp in obj)
        {
            if (kvp.Key == "UserIds" && kvp.Value.ValueKind == JsonValueKind.Array)
            {
                foreach (var id in kvp.Value.EnumerateArray())
                {
                    if (id.ValueKind == JsonValueKind.String)
                    {
                        var idStr = id.GetString();
                        if (idStr != null) userIds.Add(idStr);
                    }
                }
            }
            else if (kvp.Value.ValueKind == JsonValueKind.Object)
            {
                var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
                if (nested != null) CollectUserIds(nested, userIds);
            }
            else if (kvp.Value.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in kvp.Value.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                        if (nested != null) CollectUserIds(nested, userIds);
                    }
                }
            }
        }
    }

    private static void PopulateContentItemIds(
        Dictionary<string, JsonElement> obj,
        Dictionary<string, Dictionary<string, JsonElement>> itemsDictionary)
    {
        var keysToProcess = obj.Keys.ToList();

        foreach (var key in keysToProcess)
        {
            // Skip if key was removed during recursive processing
            if (!obj.TryGetValue(key, out var value)) continue;

            if (key == "ContentItemIds" && value.ValueKind == JsonValueKind.Array)
            {
                var items = new List<Dictionary<string, JsonElement>>();
                foreach (var id in value.EnumerateArray())
                {
                    if (id.ValueKind == JsonValueKind.String)
                    {
                        var idStr = id.GetString();
                        if (idStr != null && itemsDictionary.TryGetValue(idStr, out var item))
                        {
                            items.Add(item);
                        }
                    }
                }

                obj["Items"] = JsonSerializer.SerializeToElement(items);
                obj.Remove("ContentItemIds");
            }
            // Handle singular ID fields (e.g., "ingredientId" -> "ingredient"), but skip "id" and "ContentItemId"
            else if (key != "id" && key != "ContentItemId" && key.EndsWith("Id") && value.ValueKind == JsonValueKind.String)
            {
                var idStr = value.GetString();
                if (idStr != null && itemsDictionary.TryGetValue(idStr, out var item))
                {
                    // Remove "Id" suffix from key name
                    var newKey = key.Substring(0, key.Length - 2);
                    obj[newKey] = JsonSerializer.SerializeToElement(item);
                    obj.Remove(key);
                }
            }
            else if (value.ValueKind == JsonValueKind.Object)
            {
                var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(value.GetRawText());
                if (nested != null)
                {
                    PopulateContentItemIds(nested, itemsDictionary);
                    obj[key] = JsonSerializer.SerializeToElement(nested);
                }
            }
            else if (value.ValueKind == JsonValueKind.Array)
            {
                var populatedArray = new List<object>();
                foreach (var item in value.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                        if (nested != null)
                        {
                            PopulateContentItemIds(nested, itemsDictionary);
                            populatedArray.Add(nested);
                        }
                    }
                    else
                    {
                        // Non-object items (strings, numbers, etc.) - keep as-is
                        populatedArray.Add(JsonSerializer.Deserialize<object>(item.GetRawText())!);
                    }
                }
                obj[key] = JsonSerializer.SerializeToElement(populatedArray);
            }
        }
    }
}
