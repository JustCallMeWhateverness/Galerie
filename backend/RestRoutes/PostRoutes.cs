namespace RestRoutes;

using OrchardCore.ContentManagement;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Newtonsoft.Json.Linq;

public static class PostRoutes
{
    private static readonly HashSet<string> RESERVED_FIELDS = new(StringComparer.OrdinalIgnoreCase)
    {
        "id",
        "contentItemId",
        "title",
        "displayText",
        "owner",
        "author",
        "createdUtc",
        "modifiedUtc",
        "publishedUtc",
        "contentType",
        "published",
        "latest"
    };

    public static void MapPostRoutes(this WebApplication app)
    {
        app.MapPost("api/{contentType}", async (
            string contentType,
            [FromBody] Dictionary<string, object>? body,
            [FromServices] IContentManager contentManager,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            try
            {
                // Check permissions
                var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "POST", context, session);
                if (permissionCheck != null) return permissionCheck;

                // Check if body is null or empty
                if (body == null || body.Count == 0)
                {
                    return Results.Json(new {
                        error = "Cannot read request body"
                    }, statusCode: 400);
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

                var contentItem = await contentManager.NewAsync(contentType);

                // Extract and handle special fields explicitly
                contentItem.DisplayText = body.ContainsKey("title")
                    ? body["title"].ToString()
                    : "Untitled";

                contentItem.Owner = context.User?.Identity?.Name ?? "anonymous";
                contentItem.Author = contentItem.Owner;

                // Build content directly into the content item
                foreach (var kvp in body)
                {
                    // Skip all reserved fields
                    if (RESERVED_FIELDS.Contains(kvp.Key))
                        continue;

                    var pascalKey = ToPascalCase(kvp.Key);
                    var value = kvp.Value;

                    // Handle fields ending with "Id" - these are content item references
                    if (kvp.Key.EndsWith("Id", StringComparison.OrdinalIgnoreCase) &&
                        kvp.Key.Length > 2)
                    {
                        // Transform "ownerId" → "Owner" with ContentItemIds
                        var fieldName = pascalKey.Substring(0, pascalKey.Length - 2); // Remove "Id"
                        var idValue = value is JsonElement jsonEl && jsonEl.ValueKind == JsonValueKind.String
                            ? jsonEl.GetString()
                            : value.ToString();

                        // Assign as a List<string> to avoid wrapping
                        if (idValue != null)
                        {
                            contentItem.Content[contentType][fieldName]["ContentItemIds"] = new List<string> { idValue };
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
                            var obj = new JObject();
                            foreach (var prop in jsonElement.EnumerateObject())
                            {
                                obj[ToPascalCase(prop.Name)] = ConvertJsonElementToPascal(prop.Value);
                            }
                            contentItem.Content[contentType][pascalKey] = obj;
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Array)
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
                        contentItem.Content[contentType][pascalKey] = new JObject {
                            ["Value"] = JToken.FromObject(value)
                        };
                    }
                }

                await contentManager.CreateAsync(contentItem, VersionOptions.Published);
                await session.SaveChangesAsync();

                return Results.Json(new {
                    id = contentItem.ContentItemId,
                    title = contentItem.DisplayText
                }, statusCode: 201);
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

    private static JToken ConvertJsonElement(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return new JObject { ["Text"] = element.GetString() };
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return new JObject { ["Value"] = element.GetDouble() };
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return new JObject { ["Value"] = element.GetBoolean() };
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            // Wrap arrays in {"values": [...]} pattern for Orchard Core list fields
            var arrayValues = new JArray();
            foreach (var item in element.EnumerateArray())
            {
                // Convert each item to appropriate JToken
                if (item.ValueKind == JsonValueKind.String)
                    arrayValues.Add(item.GetString());
                else if (item.ValueKind == JsonValueKind.Number)
                    arrayValues.Add(item.GetDouble());
                else if (item.ValueKind == JsonValueKind.True || item.ValueKind == JsonValueKind.False)
                    arrayValues.Add(item.GetBoolean());
                else
                    arrayValues.Add(JToken.Parse(item.GetRawText()));
            }
            return new JObject { ["values"] = arrayValues };
        }

        // For complex types, just wrap as-is
        return new JObject { ["Text"] = element.ToString() };
    }

    private static JToken ConvertJsonElementToPascal(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return JToken.FromObject(element.GetString()!);
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return JToken.FromObject(element.GetDouble());
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return JToken.FromObject(element.GetBoolean());
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var arr = new JArray();
            foreach (var item in element.EnumerateArray())
            {
                arr.Add(ConvertJsonElementToPascal(item));
            }
            return arr;
        }
        else if (element.ValueKind == JsonValueKind.Object)
        {
            var obj = new JObject();
            foreach (var prop in element.EnumerateObject())
            {
                obj[ToPascalCase(prop.Name)] = ConvertJsonElementToPascal(prop.Value);
            }
            return obj;
        }

        return JToken.Parse(element.GetRawText());
    }
}
