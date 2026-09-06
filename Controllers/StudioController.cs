using Microsoft.AspNetCore.Mvc;

namespace LandsatProgram.Controllers;

[Route("studio")]
public sealed class StudioController : Controller
{
    [HttpGet("")]
    public IActionResult Interactive()
    {
        return View("InteractiveStudio");
    }

    [HttpGet("orbit-lab")]
    public IActionResult OrbitLab()
    {
        return View("OrbitLab");
    }

    [HttpGet("resolution-lab")]
    public IActionResult ResolutionLab()
    {
        return View("ResolutionLab");
    }

    [HttpGet("band-lab")]
    public IActionResult BandLab()
    {
        return View("BandLab");
    }

    [HttpGet("remote-sensing-studio")]
    public IActionResult RemoteSensingStudio()
    {
        return View("RemoteSensingStudio");
    }
}
