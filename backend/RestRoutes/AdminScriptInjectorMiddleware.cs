namespace RestRoutes;

using System.Text;

public class AdminScriptInjectorMiddleware
{
    private readonly RequestDelegate _next;

    public AdminScriptInjectorMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Check if this is an admin route
        if (context.Request.Path.StartsWithSegments("/admin"))
        {
            // Capture the original response body stream
            var originalBodyStream = context.Response.Body;

            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            await _next(context);

            // Only inject script into HTML responses
            if (context.Response.ContentType?.Contains("text/html") == true)
            {
                responseBody.Seek(0, SeekOrigin.Begin);
                var body = await new StreamReader(responseBody).ReadToEndAsync();

                // Inject script before closing </body> tag
                if (body.Contains("</body>"))
                {
                    body = body.Replace("</body>",
                        "<script type=\"module\" src=\"/api/system/admin-script.js\"></script></body>");
                }

                var bytes = Encoding.UTF8.GetBytes(body);
                context.Response.ContentLength = bytes.Length;

                await originalBodyStream.WriteAsync(bytes, 0, bytes.Length);
            }
            else
            {
                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBodyStream);
            }

            context.Response.Body = originalBodyStream;
        }
        else
        {
            await _next(context);
        }
    }
}
