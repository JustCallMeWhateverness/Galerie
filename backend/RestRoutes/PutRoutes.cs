namespace RestRoutes;

using OrchardCore.ContentManagement;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

public static class PutRoutes
{
    private static readonly HashSet<string> RESERVED_FIELDS = new(StringComparer.OrdinalIgnoreCase)
    {
        "id",
        "contentItemId",
        "title",
        "displayText",
        "createdUtc",
        "modifiedUtc",
        "publishedUtc",
        "contentType",
        "published",
        "latest"
    };

    public static void MapPutRoutes(this WebApplication app)
    {
        app.MapPut("api/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromBody] Dictionary<string, object>? body,
            [FromServices] IContentManager contentManager,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            try
            {
                // Check permissions
                var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "PUT", context, session);
                if (permissionCheck != null) return permissionCheck;

                // Check if body is null or empty
                if (body == null || body.Count == 0)
                {
                    return Results.Json(new {
                        error = "Cannot read request body"
                    }, statusCode: 400);
                }

                // Get the existing content item
                var contentItem = await contentManager.GetAsync(id, VersionOptions.Published);

                if (contentItem == null || contentItem.ContentType != contentType)
                {
                    return Results.Json(new { error = "Content item not found" }, statusCode: 404);
                }

                // Validate fields
                var validFields = await FieldValidator.GetValidFieldsAsync(contentType, contentManager, session);
                var (isValid, invalidFields) = FieldValidator.ValidateFields(body, validFields, RESERVED_FIELDS);

                if (!isValid)
                {
                    return Results.Json(new {
                        error = "Invalid fields provided",
                        invalidFields = invalidFields,
                        validFields = validFields.OrderBy(f => f).ToList()
                    }, statusCode: 400);
                }

                // Update title if provided
                if (body.ContainsKey("title"))
                {
                    contentItem.DisplayText = body["title"].ToString() ?? contentItem.DisplayText;
                }

                // Update fields - only the ones provided in the body
                foreach (var kvp in body)
                {
                    // Skip all reserved fields
                    if (RESERVED_FIELDS.Contains(kvp.Key))
                        continue;

                    var pascalKey = ToPascalCase(kvp.Key);
                    var value = kvp.Value;

                    // Handle "items" field - this should become BagPart
                    if (kvp.Key == "items" && value is JsonElement itemsElement && itemsElement.ValueKind == JsonValueKind.Array)
                    {
                        var bagItems = new List<object>();
                        foreach (var item in itemsElement.EnumerateArray())
                        {
                            if (item.ValueKind == JsonValueKind.Object)
                            {
                                // Get contentType first
                                string? itemType = null;
                                if (item.TryGetProperty("contentType", out var ctProp) && ctProp.ValueKind == JsonValueKind.String)
                                {
                                    itemType = ctProp.GetString();
                                }

                                if (!string.IsNullOrEmpty(itemType))
                                {
                                    var bagItem = CreateBagPartItem(item, itemType);
                                    bagItems.Add(bagItem);
                                }
                            }
                        }

                        if (bagItems.Count > 0)
                        {
                            contentItem.Content["BagPart"] = new Dictionary<string, object>
                            {
                                ["ContentItems"] = bagItems
                            };
                        }
                        continue;
                    }

                    // Handle fields ending with "Id" - these are content item references
                    if (kvp.Key.EndsWith("Id", StringComparison.OrdinalIgnoreCase) &&
                        kvp.Key.Length > 2)
                    {
                        // Transform "ownerId" → "Owner" with ContentItemIds
                        var fieldName = pascalKey.Substring(0, pascalKey.Length - 2); // Remove "Id"

                        // Handle both single IDs (string) and multiple IDs (array)
                        if (value is JsonElement jsonEl)
                        {
                            if (jsonEl.ValueKind == JsonValueKind.String)
                            {
                                var idValue = jsonEl.GetString();
                                if (idValue != null)
                                {
                                    contentItem.Content[contentType][fieldName]["ContentItemIds"] = new List<string> { idValue };
                                }
                            }
                            else if (jsonEl.ValueKind == JsonValueKind.Array)
                            {
                                var idList = new List<string>();
                                foreach (var item in jsonEl.EnumerateArray())
                                {
                                    if (item.ValueKind == JsonValueKind.String)
                                    {
                                        var idValue = item.GetString();
                                        if (idValue != null) idList.Add(idValue);
                                    }
                                }
                                if (idList.Count > 0)
                                {
                                    contentItem.Content[contentType][fieldName]["ContentItemIds"] = idList;
                                }
                            }
                        }
                        else if (value is string strValue)
                        {
                            contentItem.Content[contentType][fieldName]["ContentItemIds"] = new List<string> { strValue };
                        }
                    }
                    else if (value is JsonElement jsonElement)
                    {
                        // Extract the actual string value, not a wrapped JObject
                        if (jsonElement.ValueKind == JsonValueKind.String)
                        {
                            contentItem.Content[contentType][pascalKey]["Text"] = jsonElement.GetString();
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Number)
                        {
                            contentItem.Content[contentType][pascalKey]["Value"] = jsonElement.GetDouble();
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.True || jsonElement.ValueKind == JsonValueKind.False)
                        {
                            contentItem.Content[contentType][pascalKey]["Value"] = jsonElement.GetBoolean();
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Object)
                        {
                            // Handle objects - convert keys to PascalCase
                            var obj = new Dictionary<string, object>();
                            foreach (var prop in jsonElement.EnumerateObject())
                            {
                                obj[ToPascalCase(prop.Name)] = ConvertJsonElementToPascal(prop.Value);
                            }
                            contentItem.Content[contentType][pascalKey] = obj;
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Array)
                        {
                            // Check if this is a UserPickerField (array of objects with "id" and "username")
                            var firstElement = jsonElement.EnumerateArray().FirstOrDefault();
                            if (firstElement.ValueKind == JsonValueKind.Object &&
                                firstElement.TryGetProperty("id", out _) &&
                                firstElement.TryGetProperty("username", out _))
                            {
                                // Unzip the user objects into UserIds and UserNames arrays
                                var userIds = new List<string>();
                                var userNames = new List<string>();

                                foreach (var userObj in jsonElement.EnumerateArray())
                                {
                                    if (userObj.ValueKind == JsonValueKind.Object)
                                    {
                                        if (userObj.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.String)
                                        {
                                            var userId = idProp.GetString();
                                            if (userId != null) userIds.Add(userId);
                                        }

                                        if (userObj.TryGetProperty("username", out var usernameProp) && usernameProp.ValueKind == JsonValueKind.String)
                                        {
                                            var username = usernameProp.GetString();
                                            if (username != null) userNames.Add(username);
                                        }
                                    }
                                }

                                contentItem.Content[contentType][pascalKey]["UserIds"] = userIds;
                                contentItem.Content[contentType][pascalKey]["UserNames"] = userNames;
                            }
                            else
                            {
                                // Handle arrays - could be ContentItemIds or Values
                                var arrayData = new List<string>();
                                foreach (var item in jsonElement.EnumerateArray())
                                {
                                    if (item.ValueKind == JsonValueKind.String)
                                    {
                                        var str = item.GetString();
                                        if (str != null) arrayData.Add(str);
                                    }
                                }

                                // Detect if array contains ContentItemIds (26-char alphanumeric strings)
                                var isContentItemIds = arrayData.Count > 0 &&
                                    arrayData.All(id => id.Length > 20 && id.All(c => char.IsLetterOrDigit(c)));

                                if (isContentItemIds)
                                {
                                    contentItem.Content[contentType][pascalKey]["ContentItemIds"] = arrayData;
                                }
                                else
                                {
                                    contentItem.Content[contentType][pascalKey]["Values"] = arrayData;
                                }
                            }
                        }
                        else
                        {
                            contentItem.Content[contentType][pascalKey] = ConvertJsonElement(jsonElement);
                        }
                    }
                    else if (value is string strValue)
                    {
                        contentItem.Content[contentType][pascalKey]["Text"] = strValue;
                    }
                    else if (value is int or long or double or float or decimal)
                    {
                        contentItem.Content[contentType][pascalKey] = new Dictionary<string, object> {
                            ["Value"] = value
                        };
                    }
                }

                await contentManager.UpdateAsync(contentItem);
                await contentManager.PublishAsync(contentItem);
                await session.SaveChangesAsync();

                return Results.Json(new {
                    id = contentItem.ContentItemId,
                    title = contentItem.DisplayText
                }, statusCode: 200);
            }
            catch (Exception ex)
            {
                return Results.Json(new {
                    error = ex.Message
                }, statusCode: 500);
            }
        });
    }

    private static string ToPascalCase(string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsUpper(str[0]))
            return str;
        return char.ToUpper(str[0]) + str.Substring(1);
    }

    private static Dictionary<string, object> ConvertJsonElement(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return new Dictionary<string, object> { ["Text"] = element.GetString()! };
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return new Dictionary<string, object> { ["Value"] = element.GetDouble() };
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return new Dictionary<string, object> { ["Value"] = element.GetBoolean() };
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            // Wrap arrays in {"values": [...]} pattern for Orchard Core list fields
            var arrayValues = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                // Convert each item to appropriate type
                if (item.ValueKind == JsonValueKind.String)
                    arrayValues.Add(item.GetString()!);
                else if (item.ValueKind == JsonValueKind.Number)
                    arrayValues.Add(item.GetDouble());
                else if (item.ValueKind == JsonValueKind.True || item.ValueKind == JsonValueKind.False)
                    arrayValues.Add(item.GetBoolean());
                else
                    arrayValues.Add(JsonSerializer.Deserialize<object>(item.GetRawText())!);
            }
            return new Dictionary<string, object> { ["values"] = arrayValues };
        }

        // For complex types, just wrap as-is
        return new Dictionary<string, object> { ["Text"] = element.ToString() };
    }

    private static object ConvertJsonElementToPascal(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return element.GetString()!;
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return element.GetDouble();
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return element.GetBoolean();
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var arr = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                arr.Add(ConvertJsonElementToPascal(item));
            }
            return arr;
        }
        else if (element.ValueKind == JsonValueKind.Object)
        {
            var obj = new Dictionary<string, object>();
            foreach (var prop in element.EnumerateObject())
            {
                obj[ToPascalCase(prop.Name)] = ConvertJsonElementToPascal(prop.Value);
            }
            return obj;
        }

        return JsonSerializer.Deserialize<object>(element.GetRawText())!;
    }

    private static Dictionary<string, object> CreateBagPartItem(JsonElement itemElement, string contentType)
    {
        var bagItem = new Dictionary<string, object>
        {
            ["ContentType"] = contentType,
            [contentType] = new Dictionary<string, object>()
        };

        var typeSection = (Dictionary<string, object>)bagItem[contentType];

        foreach (var prop in itemElement.EnumerateObject())
        {
            // Skip reserved fields and contentType itself
            if (prop.Name == "contentType" || prop.Name == "id" || prop.Name == "title")
                continue;

            var pascalKey = ToPascalCase(prop.Name);
            var value = prop.Value;

            // Handle fields ending with "Id" - these are content item references
            if (prop.Name.EndsWith("Id", StringComparison.OrdinalIgnoreCase) && prop.Name.Length > 2)
            {
                var fieldName = pascalKey.Substring(0, pascalKey.Length - 2);
                if (value.ValueKind == JsonValueKind.String)
                {
                    var idValue = value.GetString();
                    if (idValue != null)
                    {
                        typeSection[fieldName] = new Dictionary<string, object>
                        {
                            ["ContentItemIds"] = new List<string> { idValue }
                        };
                    }
                }
            }
            else if (value.ValueKind == JsonValueKind.String)
            {
                typeSection[pascalKey] = new Dictionary<string, object> { ["Text"] = value.GetString()! };
            }
            else if (value.ValueKind == JsonValueKind.Number)
            {
                typeSection[pascalKey] = new Dictionary<string, object> { ["Value"] = value.GetDouble() };
            }
            else if (value.ValueKind == JsonValueKind.True || value.ValueKind == JsonValueKind.False)
            {
                typeSection[pascalKey] = new Dictionary<string, object> { ["Value"] = value.GetBoolean() };
            }
            else if (value.ValueKind == JsonValueKind.Array)
            {
                var arrayData = new List<string>();
                foreach (var item in value.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String)
                    {
                        var str = item.GetString();
                        if (str != null) arrayData.Add(str);
                    }
                }
                typeSection[pascalKey] = new Dictionary<string, object> { ["Values"] = arrayData };
            }
            else if (value.ValueKind == JsonValueKind.Object)
            {
                var obj = new Dictionary<string, object>();
                foreach (var nestedProp in value.EnumerateObject())
                {
                    obj[ToPascalCase(nestedProp.Name)] = ConvertJsonElementToPascal(nestedProp.Value);
                }
                typeSection[pascalKey] = obj;
            }
        }

        return bagItem;
    }
}
