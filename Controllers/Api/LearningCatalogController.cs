using LandsatProgram.Services;
using Microsoft.AspNetCore.Mvc;

namespace LandsatProgram.Controllers.Api;

[ApiController]
[Route("api/learning-catalog")]
public sealed class LearningCatalogController : ControllerBase
{
    private readonly ILearningCatalogService _learningCatalogService;

    public LearningCatalogController(ILearningCatalogService learningCatalogService)
    {
        _learningCatalogService = learningCatalogService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var catalog = await _learningCatalogService.GetCatalogAsync(cancellationToken);
        return Ok(catalog);
    }
}
