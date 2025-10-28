namespace RestRoutes;

using System.Text.Json;

public static partial class GetRoutes
{
    private static Dictionary<string, object> CleanObject(Dictionary<string, JsonElement> obj, string contentType)
    {
        var clean = new Dictionary<string, object>();

        // Get basic fields
        if (obj.TryGetValue("ContentItemId", out var id))
            clean["id"] = id.GetString()!;

        if (obj.TryGetValue("DisplayText", out var title))
            clean["title"] = title.GetString()!;

        // Get the content type section (e.g., "Pet", "PetOwner")
        if (obj.TryGetValue(contentType, out var typeSection) && typeSection.ValueKind == JsonValueKind.Object)
        {
            var typeDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(typeSection.GetRawText());
            if (typeDict != null)
            {
                foreach (var kvp in typeDict)
                {
                    var (value, isIdReference) = ExtractFieldValueWithContext(kvp.Value);
                    if (value != null)
                    {
                        var fieldName = ToCamelCase(kvp.Key);

                        // If it's an ID reference from ContentItemIds, append "Id" to field name
                        if (isIdReference)
                        {
                            fieldName = fieldName + "Id";
                        }

                        clean[fieldName] = value;
                    }
                }
            }
        }

        return clean;
    }

    private static (object? value, bool isIdReference) ExtractFieldValueWithContext(JsonElement element)
    {
        // Handle Text fields: { "Text": "value" } → "value"
        if (element.ValueKind == JsonValueKind.Object)
        {
            var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
            if (dict != null)
            {
                // Check for Text field
                if (dict.ContainsKey("Text") && dict.Count == 1)
                {
                    var textElement = dict["Text"];
                    // Handle both string and array (in case of POST-created items)
                    if (textElement.ValueKind == JsonValueKind.String)
                    {
                        return (textElement.GetString(), false);
                    }
                    else if (textElement.ValueKind == JsonValueKind.Array)
                    {
                        // If it's an array, try to get the first element
                        var arr = textElement.EnumerateArray().ToList();
                        if (arr.Count > 0 && arr[0].ValueKind == JsonValueKind.String)
                        {
                            return (arr[0].GetString(), false);
                        }
                    }
                    return (null, false);
                }

                // Check for ContentItemIds array (non-populated relations)
                if (dict.ContainsKey("ContentItemIds"))
                {
                    var ids = dict["ContentItemIds"];
                    if (ids.ValueKind == JsonValueKind.Array)
                    {
                        var idsList = new List<string>();
                        foreach (var idElement in ids.EnumerateArray())
                        {
                            if (idElement.ValueKind == JsonValueKind.String)
                            {
                                var idStr = idElement.GetString();
                                if (idStr != null) idsList.Add(idStr);
                            }
                        }
                        // Single ID: return as string with isIdReference=true (appends "Id" to field name)
                        // Multiple IDs: return as array with isIdReference=false (keeps field name as-is)
                        if (idsList.Count == 1)
                        {
                            return (idsList[0], true);
                        }
                        else if (idsList.Count > 1)
                        {
                            return (idsList.ToArray(), false);
                        }
                        return (null, false); // Empty array
                    }
                }

                // Check for Items array (populated relations)
                if (dict.ContainsKey("Items"))
                {
                    var items = dict["Items"];
                    if (items.ValueKind == JsonValueKind.Array)
                    {
                        var itemsList = new List<object>();
                        foreach (var item in items.EnumerateArray())
                        {
                            if (item.ValueKind == JsonValueKind.Object)
                            {
                                var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                                if (itemDict != null)
                                {
                                    // Get the content type from the item
                                    string? itemType = null;
                                    if (itemDict.TryGetValue("ContentType", out var ct))
                                    {
                                        itemType = ct.GetString();
                                    }
                                    itemsList.Add(CleanObject(itemDict, itemType ?? ""));
                                }
                            }
                        }
                        // Return null (serializes to remove key) if 0 items, object if one item otherwise array
                        var result = itemsList.Count == 0 ? null : itemsList.Count == 1 ? itemsList[0] : itemsList;
                        return (result, false);
                    }
                }

                // Check for { "values": [...] } pattern (common in OrchardCore list fields)
                if (dict.Count == 1 && (dict.ContainsKey("values") || dict.ContainsKey("Values")))
                {
                    var valuesKey = dict.ContainsKey("values") ? "values" : "Values";
                    var values = dict[valuesKey];
                    if (values.ValueKind == JsonValueKind.Array)
                    {
                        var valuesList = new List<object>();
                        foreach (var val in values.EnumerateArray())
                        {
                            var extractedValue = ExtractFieldValue(val);
                            if (extractedValue != null)
                            {
                                valuesList.Add(extractedValue);
                            }
                        }
                        return (valuesList, false);
                    }
                }

                // Otherwise return the whole object cleaned
                var cleaned = new Dictionary<string, object>();
                foreach (var kvp in dict)
                {
                    var value = ExtractFieldValue(kvp.Value);
                    if (value != null)
                    {
                        cleaned[ToCamelCase(kvp.Key)] = value;
                    }
                }

                // Unwrap single-property objects (e.g., {"value": 42} → 42)
                if (cleaned.Count == 1)
                {
                    return (cleaned.Values.First(), false);
                }

                return (cleaned, false);
            }
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var list = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                var value = ExtractFieldValue(item);
                if (value != null)
                {
                    list.Add(value);
                }
            }
            return (list, false);
        }
        else if (element.ValueKind == JsonValueKind.String)
        {
            return (element.GetString(), false);
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return (element.GetDouble(), false);
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return (element.GetBoolean(), false);
        }

        return (null, false);
    }

    private static object? ExtractFieldValue(JsonElement element)
    {
        // Handle Text fields: { "Text": "value" } → "value"
        if (element.ValueKind == JsonValueKind.Object)
        {
            var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
            if (dict != null)
            {
                // Check for Text field
                if (dict.ContainsKey("Text") && dict.Count == 1)
                {
                    return dict["Text"].GetString();
                }

                // Check for ContentItemIds array (non-populated relations)
                if (dict.ContainsKey("ContentItemIds"))
                {
                    var ids = dict["ContentItemIds"];
                    if (ids.ValueKind == JsonValueKind.Array)
                    {
                        var idsList = new List<string>();
                        foreach (var idElement in ids.EnumerateArray())
                        {
                            if (idElement.ValueKind == JsonValueKind.String)
                            {
                                var idStr = idElement.GetString();
                                if (idStr != null) idsList.Add(idStr);
                            }
                        }
                        // Return single ID string if exactly one item, array for multiple items
                        if (idsList.Count == 1)
                        {
                            return idsList[0];
                        }
                        else if (idsList.Count > 1)
                        {
                            return idsList.ToArray();
                        }
                        return null; // Empty array
                    }
                }

                // Check for Items array (populated relations)
                if (dict.ContainsKey("Items"))
                {
                    var items = dict["Items"];
                    if (items.ValueKind == JsonValueKind.Array)
                    {
                        var itemsList = new List<object>();
                        foreach (var item in items.EnumerateArray())
                        {
                            if (item.ValueKind == JsonValueKind.Object)
                            {
                                var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                                if (itemDict != null)
                                {
                                    // Get the content type from the item
                                    string? itemType = null;
                                    if (itemDict.TryGetValue("ContentType", out var ct))
                                    {
                                        itemType = ct.GetString();
                                    }
                                    itemsList.Add(CleanObject(itemDict, itemType ?? ""));
                                }
                            }
                        }
                        // Return null (serializes to remove key) if 0 items, object if one item otherwise array
                        return itemsList.Count == 0 ? null : itemsList.Count == 1 ? itemsList[0] : itemsList;
                    }
                }

                // Otherwise return the whole object cleaned
                var cleaned = new Dictionary<string, object>();
                foreach (var kvp in dict)
                {
                    var value = ExtractFieldValue(kvp.Value);
                    if (value != null)
                    {
                        cleaned[ToCamelCase(kvp.Key)] = value;
                    }
                }

                // Unwrap single-property objects (e.g., {"value": 42} → 42)
                if (cleaned.Count == 1)
                {
                    return cleaned.Values.First();
                }

                return cleaned;
            }
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var list = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                var value = ExtractFieldValue(item);
                if (value != null)
                {
                    list.Add(value);
                }
            }
            return list;
        }
        else if (element.ValueKind == JsonValueKind.String)
        {
            return element.GetString();
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return element.GetDouble();
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return element.GetBoolean();
        }

        return null;
    }

    private static string ToCamelCase(string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsLower(str[0]))
            return str;
        return char.ToLower(str[0]) + str.Substring(1);
    }
}
