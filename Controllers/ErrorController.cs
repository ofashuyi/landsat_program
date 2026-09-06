using LandsatProgram.Models;
using Microsoft.AspNetCore.Mvc;

namespace LandsatProgram.Controllers;

[Route("error")]
public sealed class ErrorController : Controller
{
    [HttpGet("")]
    [HttpGet("{statusCode:int}")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Index(int? statusCode)
    {
        var resolvedStatusCode = statusCode ?? StatusCodes.Status500InternalServerError;

        var (title, message) = resolvedStatusCode switch
        {
            StatusCodes.Status404NotFound => (
                "Page not found",
                "We couldn't find the page you were looking for. It may have moved, or the link might be out of date."),
            StatusCodes.Status403Forbidden => (
                "Access denied",
                "You don't have permission to view this page."),
            _ => (
                "Something went wrong",
                "An unexpected error occurred while loading this page. Please try again in a moment.")
        };

        Response.StatusCode = resolvedStatusCode;

        ViewData["Title"] = $"{title} | Landsat Program Explorer";
        ViewData["BodyClass"] = "page-error";

        var model = new ErrorViewModel(resolvedStatusCode, title, message, HttpContext.TraceIdentifier);

        return View("Error", model);
    }
}
