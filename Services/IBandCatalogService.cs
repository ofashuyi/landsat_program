using LandsatProgram.Models;

namespace LandsatProgram.Services;

public interface IBandCatalogService
{
    Task<BandCatalog> GetCatalogAsync(CancellationToken cancellationToken = default);
}
