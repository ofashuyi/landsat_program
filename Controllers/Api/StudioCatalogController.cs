using LandsatProgram.Services;
using Microsoft.AspNetCore.Mvc;

namespace LandsatProgram.Controllers.Api;

[ApiController]
[Route("api/studio-catalog")]
public sealed class StudioCatalogController : ControllerBase
{
    private readonly IStudioCatalogService _studioCatalogService;

    public StudioCatalogController(IStudioCatalogService studioCatalogService)
    {
        _studioCatalogService = studioCatalogService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var catalog = await _studioCatalogService.GetCatalogAsync(cancellationToken);
        return Ok(catalog);
    }
}
