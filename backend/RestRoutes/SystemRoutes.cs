namespace RestRoutes;

using Microsoft.AspNetCore.Mvc;
using OrchardCore.ContentManagement.Metadata;
using OrchardCore.Documents;
using OrchardCore.Roles.Models;
using YesSql;

public static class SystemRoutes
{
    private static bool IsAdministrator(HttpContext context)
    {
        return context.User.Identity?.IsAuthenticated == true &&
               context.User.IsInRole("Administrator");
    }

    public static void MapSystemRoutes(this WebApplication app)
    {
        // Get all content types (Administrator always allowed, others need RestPermissions)
        app.MapGet("api/system/content-types", async (
            HttpContext context,
            [FromServices] ISession session,
            [FromServices] IContentDefinitionManager contentDefinitionManager) =>
        {
            if (!IsAdministrator(context))
            {
                var permissionCheck = await PermissionsACL.CheckPermissions("system", "GET", context, session);
                if (permissionCheck != null) return permissionCheck;
            }

            var contentTypes = (await contentDefinitionManager.ListTypeDefinitionsAsync())
                .Select(type => type.Name)
                .OrderBy(n => n)
                .ToList();

            return Results.Json(contentTypes);
        });

        // Get all roles from RolesDocument (Administrator always allowed, others need RestPermissions)
        app.MapGet("api/system/roles", async (
            HttpContext context,
            [FromServices] ISession session,
            [FromServices] IDocumentManager<RolesDocument> documentManager) =>
        {
            if (!IsAdministrator(context))
            {
                var permissionCheck = await PermissionsACL.CheckPermissions("system", "GET", context, session);
                if (permissionCheck != null) return permissionCheck;
            }

            var rolesDocument = await documentManager.GetOrCreateMutableAsync();

            var roleNames = rolesDocument.Roles
                .Select(r => r.RoleName)
                .Where(n => !string.IsNullOrEmpty(n))
                .OrderBy(n => n)
                .ToList();

            return Results.Json(roleNames);
        });

        // Serve admin script (Administrator always allowed, others need RestPermissions)
        app.MapGet("api/system/admin-script.js", async (
            HttpContext context,
            [FromServices] ISession session) =>
        {
            if (!IsAdministrator(context))
            {
                var permissionCheck = await PermissionsACL.CheckPermissions("system", "GET", context, session);
                if (permissionCheck != null) return Results.Content("console.error('Access denied');", "application/javascript");
            }

            var scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "RestRoutes", "admin-script.js");
            var script = await File.ReadAllTextAsync(scriptPath);
            return Results.Content(script, "application/javascript");
        });
    }
}
