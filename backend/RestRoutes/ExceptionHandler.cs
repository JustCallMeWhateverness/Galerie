namespace RestRoutes;

public static class ExceptionHandler
{
    public static void UseRestRoutesExceptionHandler(this WebApplication app)
    {
        app.Use(async (context, next) =>
        {
            try
            {
                await next(context);
            }
            catch (Microsoft.AspNetCore.Http.BadHttpRequestException)
            {
                context.Response.StatusCode = 400;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { error = "Cannot read request body" });
            }
        });
    }
}
