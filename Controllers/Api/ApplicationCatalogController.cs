using LandsatProgram.Services;
using Microsoft.AspNetCore.Mvc;

namespace LandsatProgram.Controllers.Api;

[ApiController]
[Route("api/application-catalog")]
public sealed class ApplicationCatalogController : ControllerBase
{
    private readonly IApplicationCatalogService _applicationCatalogService;

    public ApplicationCatalogController(IApplicationCatalogService applicationCatalogService)
    {
        _applicationCatalogService = applicationCatalogService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var catalog = await _applicationCatalogService.GetCatalogAsync(cancellationToken);
        return Ok(catalog);
    }
}
