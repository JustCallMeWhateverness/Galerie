global using Dyndata;
global using static Dyndata.Factory;

namespace RestRoutes;

using OrchardCore.ContentManagement;
using OrchardCore.ContentManagement.Records;
using Microsoft.AspNetCore.Mvc;
using YesSql.Services;
using System.Text.Json;
using System.Text.RegularExpressions;

public static partial class GetRoutes
{
    public static void MapGetRoutes(this WebApplication app)
    {
        // Get single item by ID (with population)
        app.MapGet("api/expand/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get clean populated data
            var cleanObjects = await FetchCleanContent(contentType, session, populate: true);

            // Find the item with matching id
            var item = cleanObjects.FirstOrDefault(obj => obj.ContainsKey("id") && obj["id"]?.ToString() == id);

            if (item == null)
            {
                context.Response.StatusCode = 404;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("null");
                return Results.Empty;
            }

            return Results.Json(item);
        });

        // Get all items with population (with optional filters)
        app.MapGet("api/expand/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get clean populated data
            var cleanObjects = await FetchCleanContent(contentType, session, populate: true);

            // Apply query filters
            var filteredData = ApplyQueryFilters(context.Request.Query, cleanObjects);

            return Results.Json(filteredData);
        });

        // Get single item by ID (without population)
        app.MapGet("api/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get clean data without population
            var cleanObjects = await FetchCleanContent(contentType, session, populate: false);

            // Find the item with matching id
            var item = cleanObjects.FirstOrDefault(obj => obj.ContainsKey("id") && obj["id"]?.ToString() == id);

            if (item == null)
            {
                context.Response.StatusCode = 404;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("null");
                return Results.Empty;
            }

            return Results.Json(item);
        });

        // Get all items without population (with optional filters)
        app.MapGet("api/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get clean data without population
            var cleanObjects = await FetchCleanContent(contentType, session, populate: false);

            // Apply query filters
            var filteredData = ApplyQueryFilters(context.Request.Query, cleanObjects);

            return Results.Json(filteredData);
        });

        // Get single raw item by ID (no cleanup, no population)
        app.MapGet("api/raw/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get raw data
            var rawObjects = await FetchRawContent(contentType, session);

            // Find the item with matching ContentItemId
            var item = rawObjects.FirstOrDefault(obj =>
                obj.ContainsKey("ContentItemId") && obj["ContentItemId"]?.ToString() == id);

            if (item == null)
            {
                context.Response.StatusCode = 404;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("null");
                return Results.Empty;
            }

            return Results.Json(item);
        });

        // Get all raw items (no cleanup, no population, but with filters)
        app.MapGet("api/raw/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get raw data
            var rawObjects = await FetchRawContent(contentType, session);

            // Apply query filters (filtering works on raw data too)
            var filteredData = ApplyQueryFilters(context.Request.Query, rawObjects);

            return Results.Json(filteredData);
        });
    }
}
