using LandsatProgram.Models;

namespace LandsatProgram.Services;

public interface IApplicationCatalogService
{
    Task<ApplicationCatalog> GetCatalogAsync(CancellationToken cancellationToken = default);
}
