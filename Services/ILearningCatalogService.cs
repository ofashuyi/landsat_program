using LandsatProgram.Models;

namespace LandsatProgram.Services;

public interface ILearningCatalogService
{
    Task<LearningCatalog> GetCatalogAsync(CancellationToken cancellationToken = default);
}
