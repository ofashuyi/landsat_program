using LandsatProgram.Services;
using Microsoft.AspNetCore.Mvc;

namespace LandsatProgram.Controllers.Api;

[ApiController]
[Route("api/band-catalog")]
public sealed class BandCatalogController : ControllerBase
{
    private readonly IBandCatalogService _bandCatalogService;

    public BandCatalogController(IBandCatalogService bandCatalogService)
    {
        _bandCatalogService = bandCatalogService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var catalog = await _bandCatalogService.GetCatalogAsync(cancellationToken);
        return Ok(catalog);
    }
}
