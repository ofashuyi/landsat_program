using System.Text.Json;
using LandsatProgram.Models;

namespace LandsatProgram.Services;

public sealed class JsonLearningCatalogService : ILearningCatalogService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IWebHostEnvironment _environment;
    private LearningCatalog? _cachedCatalog;

    public JsonLearningCatalogService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<LearningCatalog> GetCatalogAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedCatalog is not null)
        {
            return _cachedCatalog;
        }

        var path = Path.Combine(_environment.ContentRootPath, "Data", "learning-catalog.json");
        await using var stream = File.OpenRead(path);
        var catalog = await JsonSerializer.DeserializeAsync<LearningCatalog>(stream, JsonOptions, cancellationToken);

        _cachedCatalog = catalog ?? new LearningCatalog(Array.Empty<OrbitMode>(), Array.Empty<ResolutionMode>());
        return _cachedCatalog;
    }
}
