namespace RestRoutes;

using OrchardCore.ContentManagement;
using Microsoft.AspNetCore.Mvc;

public static class DeleteRoutes
{
    public static void MapDeleteRoutes(this WebApplication app)
    {
        app.MapDelete("api/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] IContentManager contentManager,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            try
            {
                // Check permissions
                var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "DELETE", context, session);
                if (permissionCheck != null) return permissionCheck;

                // Get the existing content item
                var contentItem = await contentManager.GetAsync(id, VersionOptions.Published);

                if (contentItem == null || contentItem.ContentType != contentType)
                {
                    return Results.Json(new { error = "Content item not found" }, statusCode: 404);
                }

                // Remove the content item
                await contentManager.RemoveAsync(contentItem);
                await session.SaveChangesAsync();

                return Results.Json(new {
                    success = true,
                    id = id
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
}
