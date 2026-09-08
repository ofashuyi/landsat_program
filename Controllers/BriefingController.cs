using LandsatProgram.Services;
using Microsoft.AspNetCore.Mvc;

namespace LandsatProgram.Controllers;

[Route("briefing")]
public sealed class BriefingController : Controller
{
    private readonly IMissionCatalogService _missionCatalogService;
    private readonly IDataGuideService _dataGuideService;
    private readonly IApplicationCatalogService _applicationCatalogService;

    public BriefingController(
        IMissionCatalogService missionCatalogService,
        IDataGuideService dataGuideService,
        IApplicationCatalogService applicationCatalogService)
    {
        _missionCatalogService = missionCatalogService;
        _dataGuideService = dataGuideService;
        _applicationCatalogService = applicationCatalogService;
    }

    [HttpGet("")]
    public IActionResult Program()
    {
        return View("ProgramBriefing");
    }

    [HttpGet("overview")]
    public IActionResult Overview()
    {
        return View("Overview");
    }

    [HttpGet("foundations")]
    public IActionResult Foundations()
    {
        return View("Foundations");
    }

    [HttpGet("missions")]
    public async Task<IActionResult> Missions(CancellationToken cancellationToken)
    {
        var catalog = await _missionCatalogService.GetCatalogAsync(cancellationToken);
        return View("Missions", catalog);
    }

    [HttpGet("applications")]
    public async Task<IActionResult> Applications(CancellationToken cancellationToken)
    {
        var catalog = await _applicationCatalogService.GetCatalogAsync(cancellationToken);
        return View("Applications", catalog);
    }

    [HttpGet("products")]
    public async Task<IActionResult> Products(CancellationToken cancellationToken)
    {
        var catalog = await _dataGuideService.GetCatalogAsync(cancellationToken);
        return View("DataGuide", catalog);
    }

    [HttpGet("data-guide")]
    public IActionResult DataGuide()
    {
        return RedirectToAction(nameof(Products));
    }

    [HttpGet("future")]
    public IActionResult Future()
    {
        return View("Future");
    }

    [HttpGet("resources")]
    public IActionResult Resources()
    {
        return View("Resources");
    }
}
