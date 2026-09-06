using System.Text.Json;
using LandsatProgram.Models;

namespace LandsatProgram.Services;

public sealed class JsonBandCatalogService : IBandCatalogService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IWebHostEnvironment _environment;
    private BandCatalog? _cachedCatalog;

    public JsonBandCatalogService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<BandCatalog> GetCatalogAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedCatalog is not null)
        {
            return _cachedCatalog;
        }

        var path = Path.Combine(_environment.ContentRootPath, "Data", "band-catalog.json");
        await using var stream = File.OpenRead(path);
        var catalog = await JsonSerializer.DeserializeAsync<BandCatalog>(stream, JsonOptions, cancellationToken);

        _cachedCatalog = catalog ?? new BandCatalog(Array.Empty<BandPreset>());
        return _cachedCatalog;
    }
}
