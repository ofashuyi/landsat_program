using System.Text.Json;
using LandsatProgram.Models;

namespace LandsatProgram.Services;

public sealed class JsonDataGuideService : IDataGuideService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IWebHostEnvironment _environment;
    private DataGuideCatalog? _cachedCatalog;

    public JsonDataGuideService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<DataGuideCatalog> GetCatalogAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedCatalog is not null)
        {
            return _cachedCatalog;
        }

        var path = Path.Combine(_environment.ContentRootPath, "Data", "data-guide.json");
        await using var stream = File.OpenRead(path);
        var catalog = await JsonSerializer.DeserializeAsync<DataGuideCatalog>(stream, JsonOptions, cancellationToken);

        _cachedCatalog = catalog ?? new DataGuideCatalog(
            new Dictionary<string, IReadOnlyList<WorkflowOption>>(),
            new Dictionary<string, WorkflowRecommendation>());

        return _cachedCatalog;
    }
}
