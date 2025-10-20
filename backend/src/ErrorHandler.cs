// Error Handler for "raw" runtime errors
// that aren't handled anywhere else
namespace WebApp;
public static class ErrorHandler
{
    public static void Start()
    {
        App.UseExceptionHandler(exceptionApp =>
        {
            exceptionApp.Run(async context =>
            {
                var feature = context.Features.Get<IExceptionHandlerPathFeature>();
                DebugLog.Add(context, new { error = feature.Error.Message });
                var error = new { error = feature.Error.Message };
                context.Response.Headers.Append("Server", (string)Globals.serverName);
                await context.Response.WriteAsJsonAsync(error);
            });
        });
    }
}