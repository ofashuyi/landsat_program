using LandsatProgram.Services;
using Microsoft.AspNetCore.Mvc;

namespace LandsatProgram.Controllers;

[Route("studio")]
public sealed class StudioController : Controller
{
    private readonly ILearningCatalogService _learningCatalogService;
    private readonly IBandCatalogService _bandCatalogService;

    public StudioController(
        ILearningCatalogService learningCatalogService,
        IBandCatalogService bandCatalogService)
    {
        _learningCatalogService = learningCatalogService;
        _bandCatalogService = bandCatalogService;
    }

    [HttpGet("")]
    public IActionResult Interactive()
    {
        return View("InteractiveStudio");
    }

    [HttpGet("orbit-lab")]
    public async Task<IActionResult> OrbitLab(CancellationToken cancellationToken)
    {
        var catalog = await _learningCatalogService.GetCatalogAsync(cancellationToken);
        return View("OrbitLab", catalog);
    }

    [HttpGet("resolution-lab")]
    public async Task<IActionResult> ResolutionLab(CancellationToken cancellationToken)
    {
        var catalog = await _learningCatalogService.GetCatalogAsync(cancellationToken);
        return View("ResolutionLab", catalog);
    }

    [HttpGet("band-lab")]
    public async Task<IActionResult> BandLab(CancellationToken cancellationToken)
    {
        var catalog = await _bandCatalogService.GetCatalogAsync(cancellationToken);
        return View("BandLab", catalog);
    }

    [HttpGet("remote-sensing-studio")]
    public IActionResult RemoteSensingStudio()
    {
        return View("RemoteSensingStudio");
    }
}
