using LandsatProgram.Models;

namespace LandsatProgram.Services;

public interface IMissionCatalogService
{
    Task<MissionCatalog> GetCatalogAsync(CancellationToken cancellationToken = default);
}
