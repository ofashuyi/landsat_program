using LandsatProgram.Services;
using Microsoft.AspNetCore.Mvc;

namespace LandsatProgram.Controllers.Api;

[ApiController]
[Route("api/data-guide")]
public sealed class DataGuideController : ControllerBase
{
    private readonly IDataGuideService _dataGuideService;

    public DataGuideController(IDataGuideService dataGuideService)
    {
        _dataGuideService = dataGuideService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var catalog = await _dataGuideService.GetCatalogAsync(cancellationToken);
        return Ok(catalog);
    }
}
