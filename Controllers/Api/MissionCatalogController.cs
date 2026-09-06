using LandsatProgram.Services;
using Microsoft.AspNetCore.Mvc;

namespace LandsatProgram.Controllers.Api;

[ApiController]
[Route("api/mission-catalog")]
public sealed class MissionCatalogController : ControllerBase
{
    private readonly IMissionCatalogService _missionCatalogService;

    public MissionCatalogController(IMissionCatalogService missionCatalogService)
    {
        _missionCatalogService = missionCatalogService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var catalog = await _missionCatalogService.GetCatalogAsync(cancellationToken);
        return Ok(catalog);
    }
}
