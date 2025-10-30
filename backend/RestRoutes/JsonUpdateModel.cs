namespace RestRoutes;

using Microsoft.AspNetCore.Mvc.ModelBinding;
using OrchardCore.DisplayManagement.ModelBinding;
using System.Text.Json;

/// <summary>
/// Custom IUpdateModel implementation that reads from JSON dictionary
/// instead of form data, allowing us to use Orchard's field driver pipeline
/// with REST JSON input.
/// </summary>
public class JsonUpdateModel : IUpdateModel
{
    private readonly Dictionary<string, object> _jsonData;
    private readonly string _contentType;
    private readonly ModelStateDictionary _modelState;

    public JsonUpdateModel(Dictionary<string, object> jsonData, string contentType)
    {
        _jsonData = jsonData;
        _contentType = contentType;
        _modelState = new ModelStateDictionary();
    }

    public ModelStateDictionary ModelState => _modelState;

    public Task<bool> TryUpdateModelAsync<TModel>(TModel model) where TModel : class
    {
        return TryUpdateModelAsync(model, typeof(TModel), "");
    }

    public Task<bool> TryUpdateModelAsync<TModel>(TModel model, string prefix) where TModel : class
    {
        return TryUpdateModelAsync(model, typeof(TModel), prefix);
    }

    public Task<bool> TryUpdateModelAsync<TModel>(
        TModel model,
        string prefix,
        params System.Linq.Expressions.Expression<Func<TModel, object>>[] includeExpressions) where TModel : class
    {
        // For simplicity, ignore includeExpressions and update all properties
        return TryUpdateModelAsync(model, typeof(TModel), prefix);
    }

    public Task<bool> TryUpdateModelAsync<TModel>(
        TModel model,
        Type modelType,
        string prefix) where TModel : class
    {
        // Convert our JSON data to the format field drivers expect
        // Field drivers look for keys like "Pet.Image.Paths"

        var success = true;

        foreach (var kvp in _jsonData)
        {
            var key = kvp.Key;
            var value = kvp.Value;

            // Build the expected form field name: ContentType.FieldName
            var formFieldName = $"{_contentType}.{ToPascalCase(key)}";

            // Handle different value types
            if (value is JsonElement jsonElement)
            {
                SetModelValue(model, formFieldName, jsonElement);
            }
            else
            {
                SetModelValue(model, formFieldName, value);
            }
        }

        return Task.FromResult(success);
    }

    public bool TryValidateModel(object model)
    {
        // Basic validation - always return true for now
        return true;
    }

    public bool TryValidateModel(object model, string prefix)
    {
        // Basic validation - always return true for now
        return true;
    }

    private void SetModelValue<TModel>(TModel model, string fieldName, object value)
    {
        // For complex objects, we need to serialize them as JSON strings
        // because that's what Orchard's field drivers expect (e.g., MediaField expects Paths as JSON string)

        if (value is JsonElement jsonElement)
        {
            if (jsonElement.ValueKind == JsonValueKind.Object ||
                jsonElement.ValueKind == JsonValueKind.Array)
            {
                // Serialize complex structures as JSON strings
                var jsonString = JsonSerializer.Serialize(jsonElement);
                SetPropertyValue(model, fieldName, jsonString);
            }
            else
            {
                // Simple values
                SetPropertyValue(model, fieldName, JsonElementToObject(jsonElement));
            }
        }
        else
        {
            SetPropertyValue(model, fieldName, value);
        }
    }

    private void SetPropertyValue<TModel>(TModel model, string propertyPath, object? value)
    {
        // Use reflection to set nested properties
        // propertyPath might be like "Pet.Image.Paths"

        var parts = propertyPath.Split('.');
        object? current = model;

        for (int i = 0; i < parts.Length - 1; i++)
        {
            var prop = current?.GetType().GetProperty(parts[i]);
            if (prop == null)
            {
                // Property doesn't exist, skip
                return;
            }

            var propValue = prop.GetValue(current);
            if (propValue == null)
            {
                // Try to create an instance
                propValue = Activator.CreateInstance(prop.PropertyType);
                prop.SetValue(current, propValue);
            }
            current = propValue;
        }

        // Set the final property
        if (current != null)
        {
            var finalProp = current.GetType().GetProperty(parts[^1]);
            if (finalProp != null && finalProp.CanWrite)
            {
                try
                {
                    finalProp.SetValue(current, value);
                }
                catch
                {
                    // Property set failed, add model error
                    _modelState.AddModelError(propertyPath, $"Could not set value for {propertyPath}");
                }
            }
        }
    }

    private object? JsonElementToObject(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Number => element.TryGetInt32(out var i) ? i : element.GetDouble(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Null => null,
            _ => element.GetRawText()
        };
    }

    private string ToPascalCase(string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsUpper(str[0]))
            return str;
        return char.ToUpper(str[0]) + str.Substring(1);
    }
}
