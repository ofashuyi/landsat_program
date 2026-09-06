using System.Text.Json;
using LandsatProgram.Models;

namespace LandsatProgram.Services;

public sealed class JsonApplicationCatalogService : IApplicationCatalogService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IWebHostEnvironment _environment;
    private ApplicationCatalog? _cachedCatalog;

    public JsonApplicationCatalogService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<ApplicationCatalog> GetCatalogAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedCatalog is not null)
        {
            return _cachedCatalog;
        }

        var path = Path.Combine(_environment.ContentRootPath, "Data", "application-catalog.json");
        await using var stream = File.OpenRead(path);
        var catalog = await JsonSerializer.DeserializeAsync<ApplicationCatalog>(stream, JsonOptions, cancellationToken);

        _cachedCatalog = catalog ?? new ApplicationCatalog(
            Array.Empty<ImpactStory>(),
            Array.Empty<ComplementaryMission>());

        return _cachedCatalog;
    }
}
