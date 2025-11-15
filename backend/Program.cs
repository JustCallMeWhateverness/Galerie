using OrchardCore.Logging;
using RestRoutes;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseNLogHost();

builder.Services.AddOrchardCms();

// Register SSE services
builder.Services.AddSingleton<SseConnectionManager>();
builder.Services.AddHostedService<SseBackgroundService>();

var app = builder.Build();



if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// our mods
app.MapRestRoutes();

app.UseStaticFiles();

app.UseOrchardCore();

app.Run();