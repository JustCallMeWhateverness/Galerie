namespace RestRoutes;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OrchardCore.Users;
using OrchardCore.Users.Models;
using OrchardCore.Users.Services;
using System.Text.Json.Nodes;
using System.Security.Claims;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        // Register new user
        app.MapPost("/api/auth/register", async (
            [FromBody] RegisterRequest request,
            [FromServices] IUserService userService,
            [FromServices] UserManager<IUser> userManager) =>
        {
            if (string.IsNullOrEmpty(request.Username) ||
                string.IsNullOrEmpty(request.Password))
            {
                return Results.BadRequest(new { error = "Username and password required" });
            }

            var errors = new Dictionary<string, string>();
            var user = await userService.CreateUserAsync(
                new User
                {
                    UserName = request.Username,
                    Email = request.Email,
                    EmailConfirmed = true,
                    PhoneNumber = request.Phone,

                    Properties = new JsonObject
                    {
                        ["FirstName"] = request.FirstName ?? "",
                        ["LastName"] = request.LastName ?? ""
                    }
                },
                request.Password,
                (key, message) => errors[key] = message
            );

            if (user == null)
            {
                return Results.BadRequest(new
                {
                    error = "Registration failed",
                    details = errors
                });
            }

            // Assign Customer role (must exist in Orchard)
            await userManager.AddToRoleAsync(user, "Customer");

            return Results.Ok(new
            {
                username = user.UserName,
                email = request.Email,
                firstName = request.FirstName,
                lastName = request.LastName,
                phone = request.Phone,
                role = "Customer",
                message = "User created successfully"
            });
        })
        .AllowAnonymous()
        .DisableAntiforgery();

        // POST /api/auth/login - Login with username OR email
        app.MapPost("/api/auth/login", async (
            [FromBody] LoginRequest request,
            [FromServices] SignInManager<IUser> signInManager,
            [FromServices] UserManager<IUser> userManager,
            HttpContext context) =>
        {
            if (string.IsNullOrEmpty(request.UsernameOrEmail) ||
                string.IsNullOrEmpty(request.Password))
            {
                return Results.BadRequest(new { error = "Username/email and password required" });
            }

            // Try to find user by username first, then by email
            var user = await userManager.FindByNameAsync(request.UsernameOrEmail);
            if (user == null)
            {
                user = await userManager.FindByEmailAsync(request.UsernameOrEmail);
            }

            if (user == null)
            {
                return Results.Unauthorized();
            }

            var result = await signInManager.PasswordSignInAsync(
                user,
                request.Password,
                isPersistent: true,
                lockoutOnFailure: false
            );

            if (!result.Succeeded)
            {
                return Results.Unauthorized();
            }

            var u = user as User;
            return Results.Ok(new
            {
                username = user.UserName,
                email = u?.Email,
                phoneNumber = u?.PhoneNumber,
                firstName = u?.Properties?["FirstName"]?.ToString(),
                lastName = u?.Properties?["LastName"]?.ToString(),
                roles = context.User.FindAll(ClaimTypes.Role)
                    .Select(c => c.Value)
                    .ToList()
            });
        })
        .AllowAnonymous()
        .DisableAntiforgery();

        // GET /api/auth/login - Get current user
        app.MapGet("/api/auth/login", async (
            HttpContext context,
            [FromServices] UserManager<IUser> userManager) =>
        {
            var user = await userManager.GetUserAsync(context.User);

            if (user == null)
            {
                return Results.Unauthorized();
            }

            var u = user as User;

            return Results.Ok(new
            {
                username = user.UserName,
                email = u?.Email,
                phoneNumber = u?.PhoneNumber,
                firstName = u?.Properties?["FirstName"]?.ToString(),
                lastName = u?.Properties?["LastName"]?.ToString(),
                roles = context.User.FindAll(ClaimTypes.Role)
                    .Select(c => c.Value)
                    .ToList()
            });
        });

        // DELETE /api/auth/login - Logout
        app.MapDelete("/api/auth/login", async (
            [FromServices] SignInManager<IUser> signInManager) =>
        {
            await signInManager.SignOutAsync();
            return Results.Ok(new { message = "Logged out successfully" });
        })
        .AllowAnonymous()
        .DisableAntiforgery();
    }
}

public record RegisterRequest(
    string Username,
    string Email,
    string Password,
    string? FirstName,
    string? LastName,
    string? Phone
);

public record LoginRequest(string UsernameOrEmail, string Password);