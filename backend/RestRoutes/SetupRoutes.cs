namespace RestRoutes;

public static class SetupRoutes
{
    public static void MapRestRoutes(this WebApplication app)
    {
        app.UseRestRoutesExceptionHandler();

        // Inject script into admin pages
        app.UseMiddleware<AdminScriptInjectorMiddleware>();

        app.MapAuthEndpoints();
        app.MapSystemRoutes();
        app.MapGetRoutes();
        app.MapPostRoutes();
        app.MapPutRoutes();
        app.MapDeleteRoutes();
    }
}
