using LandsatProgram.Models;

namespace LandsatProgram.Services;

public interface IDataGuideService
{
    Task<DataGuideCatalog> GetCatalogAsync(CancellationToken cancellationToken = default);
}
