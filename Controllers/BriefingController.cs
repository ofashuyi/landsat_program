using Microsoft.AspNetCore.Mvc;

namespace LandsatProgram.Controllers;

[Route("briefing")]
public sealed class BriefingController : Controller
{
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
    public IActionResult Missions()
    {
        return View("Missions");
    }

    [HttpGet("applications")]
    public IActionResult Applications()
    {
        return View("Applications");
    }

    [HttpGet("products")]
    public IActionResult Products()
    {
        return View("DataGuide");
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
