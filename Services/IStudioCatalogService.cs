using LandsatProgram.Models;

namespace LandsatProgram.Services;

public interface IStudioCatalogService
{
    Task<StudioCatalog> GetCatalogAsync(CancellationToken cancellationToken = default);
}
