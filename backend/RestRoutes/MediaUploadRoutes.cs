namespace RestRoutes;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OrchardCore.Users;
using OrchardCore.Users.Models;
using System.Security.Claims;

public static class MediaUploadRoutes
{
    // Configuration flags
    private static readonly HashSet<string> ALLOWED_ROLES = new(StringComparer.OrdinalIgnoreCase)
    {
        "Administrator",
        "Customer"
    };

    private static readonly bool USE_USER_SUBFOLDERS = true;

    private static readonly int MAX_FILE_SIZE_MB = 10; // Maximum file size in megabytes

    public static void MapMediaUploadRoutes(this WebApplication app)
    {
        app.MapPost("/api/media-upload", async (
            HttpContext context,
            IFormFile? file,
            [FromServices] UserManager<IUser> userManager) =>
        {
            // Check authentication
            var user = await userManager.GetUserAsync(context.User);
            if (user == null)
            {
                return Results.Json(new { error = "Authentication required" }, statusCode: 401);
            }

            // Check role permissions
            var userRoles = context.User.FindAll(ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList();

            var hasPermission = userRoles.Any(role => ALLOWED_ROLES.Contains(role));
            if (!hasPermission)
            {
                return Results.Json(new
                {
                    error = "User does not have permission to upload files",
                    allowedRoles = ALLOWED_ROLES.OrderBy(r => r).ToList()
                }, statusCode: 403);
            }

            // Check if file was provided
            if (file == null || file.Length == 0)
            {
                return Results.Json(new { error = "No file provided" }, statusCode: 400);
            }

            // Validate file size
            var maxFileSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
            if (file.Length > maxFileSizeBytes)
            {
                return Results.Json(new
                {
                    error = "File too large",
                    maxSizeMB = MAX_FILE_SIZE_MB
                }, statusCode: 400);
            }

            try
            {
                // Build the media path
                var baseMediaPath = Path.Combine("App_Data", "Sites", "Default", "Media");

                string mediaPath;
                string relativeUrl;

                if (USE_USER_SUBFOLDERS)
                {
                    var orchardUser = user as User;
                    var userId = orchardUser?.UserId ?? "unknown";
                    mediaPath = Path.Combine(baseMediaPath, "_Users", userId);
                    relativeUrl = $"/media/_Users/{userId}";
                }
                else
                {
                    mediaPath = baseMediaPath;
                    relativeUrl = "/media";
                }

                // Create directory if it doesn't exist
                Directory.CreateDirectory(mediaPath);

                // Generate unique filename with original extension
                var extension = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(mediaPath, fileName);

                // Save the file
                using (var stream = File.Create(filePath))
                {
                    await file.CopyToAsync(stream);
                }

                // Return success with file URL
                return Results.Json(new
                {
                    success = true,
                    fileName = fileName,
                    originalFileName = file.FileName,
                    url = $"{relativeUrl}/{fileName}",
                    size = file.Length
                }, statusCode: 201);
            }
            catch (Exception ex)
            {
                return Results.Json(new
                {
                    error = "Failed to upload file",
                    message = ex.Message
                }, statusCode: 500);
            }
        })
        .DisableAntiforgery();
    }
}
