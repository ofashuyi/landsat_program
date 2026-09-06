using System.Threading.RateLimiting;
using LandsatProgram.Services;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<IMissionCatalogService, JsonMissionCatalogService>();
builder.Services.AddSingleton<IDataGuideService, JsonDataGuideService>();
builder.Services.AddSingleton<IApplicationCatalogService, JsonApplicationCatalogService>();
builder.Services.AddSingleton<IBandCatalogService, JsonBandCatalogService>();
builder.Services.AddSingleton<IStudioCatalogService, JsonStudioCatalogService>();
builder.Services.AddSingleton<ILearningCatalogService, JsonLearningCatalogService>();
var landsatStacBaseUrl = builder.Configuration["LandsatStac:BaseUrl"]
    ?? throw new InvalidOperationException("Configuration value 'LandsatStac:BaseUrl' is required.");
var landsatStacTimeoutSeconds = builder.Configuration.GetValue<double?>("LandsatStac:TimeoutSeconds") ?? 20;

builder.Services.AddHttpClient("landsat-stac", client =>
{
    client.BaseAddress = new Uri(landsatStacBaseUrl);
    client.Timeout = TimeSpan.FromSeconds(landsatStacTimeoutSeconds);
});

var landsatStacPermitLimit = builder.Configuration.GetValue<int?>("LandsatStac:RateLimit:PermitLimit") ?? 30;
var landsatStacWindowSeconds = builder.Configuration.GetValue<double?>("LandsatStac:RateLimit:WindowSeconds") ?? 60;

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    // UseStatusCodePagesWithReExecute re-executes empty-bodied 4xx/5xx responses against
    // /error/{code} using the *same* HTTP method as the original request. Without a body
    // here, a rejected POST would be replayed as POST /error/429, which ErrorController
    // (GET-only) then rejects with its own 405 - masking the real 429 entirely. Writing a
    // body avoids that re-execution and gives API clients a useful response besides.
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsync(
            """{"error":"rate_limited","message":"Too many Landsat scene search requests. Please wait a moment and try again."}""",
            cancellationToken);
    };
    options.AddPolicy(RateLimitPolicies.LandsatStacSearch, context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = landsatStacPermitLimit,
                Window = TimeSpan.FromSeconds(landsatStacWindowSeconds),
                QueueLimit = 0
            }));
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}
else
{
    app.UseDeveloperExceptionPage();
}

app.UseStatusCodePagesWithReExecute("/error/{0}");

var hasHttpsPort =
    !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_HTTPS_PORT")) ||
    !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_HTTPS_PORTS"));

if (hasHttpsPort)
{
    app.UseHttpsRedirection();
}
// Keep the current asset folders working during the MVC migration. Routing them through
// WebRootFileProvider (rather than separate UseStaticFiles mounts) lets asp-append-version
// tag helpers find and cache-bust these files too.
var namespacedFolders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
foreach (var folder in new[] { "assets", "css", "dist", "fonts", "img", "js", "vendor" })
{
    var path = Path.Combine(app.Environment.ContentRootPath, folder);
    if (Directory.Exists(path))
    {
        namespacedFolders[folder] = path;
    }
}

app.Environment.WebRootFileProvider = new NamespacedFileProvider(app.Environment.WebRootFileProvider, namespacedFolders);

app.UseStaticFiles();

app.UseRouting();

app.UseRateLimiter();

app.MapGet("/", () => Results.Redirect("/briefing", permanent: false));
app.MapGet("/index.html", () => Results.Redirect("/briefing", permanent: false));
app.MapGet("/studio.html", () => Results.Redirect("/studio", permanent: false));
app.MapGet("/overview", () => Results.Redirect("/briefing/overview", permanent: false));
app.MapGet("/foundations", () => Results.Redirect("/briefing/foundations", permanent: false));
app.MapGet("/missions", () => Results.Redirect("/briefing/missions", permanent: false));
app.MapGet("/applications", () => Results.Redirect("/briefing/applications", permanent: false));
app.MapGet("/products", () => Results.Redirect("/briefing/products", permanent: false));
app.MapGet("/future", () => Results.Redirect("/briefing/future", permanent: false));

app.MapControllers();

app.MapControllerRoute(
    name: "briefing",
    pattern: "briefing",
    defaults: new { controller = "Briefing", action = "Program" });

app.MapControllerRoute(
    name: "studio",
    pattern: "studio",
    defaults: new { controller = "Studio", action = "Interactive" });

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Briefing}/{action=Program}/{id?}");

app.Run();

/// <summary>Marker type that lets WebApplicationFactory&lt;Program&gt; reference this top-level-statement app in tests.</summary>
public partial class Program { }

/// <summary>
/// Shared rate limiter policy names, referenced by both the pipeline configuration above
/// and the [EnableRateLimiting] attribute on the controllers that opt into a policy.
/// </summary>
internal static class RateLimitPolicies
{
    public const string LandsatStacSearch = "landsat-stac-search";
}

/// <summary>
/// Delegates the first path segment (e.g. "css/app.css") to a dedicated <see cref="PhysicalFileProvider"/>
/// for that namespace, falling back to the wrapped provider for everything else. This lets legacy top-level
/// asset folders (css, js, img, ...) live outside wwwroot while still participating in ASP.NET Core's
/// file-version (cache-busting) tag helpers, which only consult <c>IWebHostEnvironment.WebRootFileProvider</c>.
/// </summary>
sealed class NamespacedFileProvider : IFileProvider
{
    private readonly IFileProvider _fallback;
    private readonly Dictionary<string, PhysicalFileProvider> _namespaces;

    public NamespacedFileProvider(IFileProvider fallback, IReadOnlyDictionary<string, string> namespaces)
    {
        _fallback = fallback;
        _namespaces = namespaces.ToDictionary(
            kv => kv.Key,
            kv => new PhysicalFileProvider(kv.Value),
            StringComparer.OrdinalIgnoreCase);
    }

    private (IFileProvider Provider, string Subpath) Resolve(string subpath)
    {
        var trimmed = subpath.TrimStart('/', '\\');
        var separatorIndex = trimmed.IndexOfAny(['/', '\\']);
        var firstSegment = separatorIndex >= 0 ? trimmed[..separatorIndex] : trimmed;

        if (_namespaces.TryGetValue(firstSegment, out var provider))
        {
            var rest = separatorIndex >= 0 ? trimmed[(separatorIndex + 1)..] : string.Empty;
            return (provider, rest);
        }

        return (_fallback, subpath);
    }

    public IFileInfo GetFileInfo(string subpath)
    {
        var (provider, rest) = Resolve(subpath);
        return provider.GetFileInfo(rest);
    }

    public IDirectoryContents GetDirectoryContents(string subpath)
    {
        var (provider, rest) = Resolve(subpath);
        return provider.GetDirectoryContents(rest);
    }

    public Microsoft.Extensions.Primitives.IChangeToken Watch(string filter) => _fallback.Watch(filter);
}
