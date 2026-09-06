using System.Text.Json;
using LandsatProgram.Models;

namespace LandsatProgram.Services;

public sealed class JsonMissionCatalogService : IMissionCatalogService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IWebHostEnvironment _environment;
    private MissionCatalog? _cachedCatalog;

    public JsonMissionCatalogService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<MissionCatalog> GetCatalogAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedCatalog is not null)
        {
            return _cachedCatalog;
        }

        var path = Path.Combine(_environment.ContentRootPath, "Data", "mission-catalog.json");
        await using var stream = File.OpenRead(path);
        var catalog = await JsonSerializer.DeserializeAsync<MissionCatalog>(stream, JsonOptions, cancellationToken);

        _cachedCatalog = catalog ?? new MissionCatalog(Array.Empty<Mission>(), Array.Empty<MissionFilter>());
        return _cachedCatalog;
    }
}
