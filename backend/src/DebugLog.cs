namespace WebApp;
public static class DebugLog
{
    private static readonly Obj memory = new();

    public static void Start()
    {
        Write();
    }

    // Get the id of a request/context
    private static string GetId(HttpContext context)
    {
        return context.Items
            .TryGetValue("id", out object value) ? value + "" : null;
    }

    // Register a request/context and basic info about it
    public static void Register(HttpContext context)
    {
        if (!Globals.debugOn) { return; }
        // Mark the request/context with a unique id
        var id = Guid.NewGuid().ToString();
        context.Items["id"] = id;
        // Add it to memory
        memory[id] = new
        {
            time = DateTime.Now.ToString("yyyy-MM-dd HH\\:mm\\:ss"),
            timestamp = Now,
            timeTakenMs = 0,
            route = context.Request.Method + " " + context.Request.Path.Value
        };
    }

    // Allow other classes/middleware to add more info
    public static void Add(HttpContext context, object info)
    {
        if (!Globals.debugOn) { return; }
        var id = GetId(context);
        if (id == null || memory[id] == null) { return; }
        memory[id] = Obj(new { ___ = memory[id], ___2 = info });
    }

    // Write to console and clear from memory, when the response
    // is flagged as done (or after 5000 ms so that memory always clears)
    public static async void Write()
    {
        if (!Globals.debugOn) { return; }
        while (true)
        {
            memory.GetKeys().ForEach(key =>
            {
                var item = memory[key];
                if (
                    item.RESPONSE_DONE != null ||
                    item.timestamp + 5000 < Now
                )
                {
                    if (item.RESPONSE_DONE != null)
                    {
                        item.timeTakenMs =
                            item.RESPONSE_DONE - item.timestamp;
                        item.Delete("RESPONSE_DONE");
                    }
                    else
                    {
                        item.Delete("timeTaken");
                    }
                    Log(item);
                    memory.Delete(key);
                }
            });
            await Task.Delay(500);
        }
    }
}