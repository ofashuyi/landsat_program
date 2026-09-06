using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace LandsatProgram.Controllers.Api;

[ApiController]
[Route("api/landsat-scenes")]
[EnableRateLimiting(RateLimitPolicies.LandsatStacSearch)]
public sealed class LandsatScenesController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<LandsatScenesController> _logger;

    public LandsatScenesController(
        IHttpClientFactory httpClientFactory,
        ILogger<LandsatScenesController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] JsonElement searchRequest, CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient("landsat-stac");
        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/search")
        {
            Content = new StringContent(searchRequest.GetRawText(), Encoding.UTF8, "application/json")
        };

        try
        {
            using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var contentType = response.Content.Headers.ContentType?.ToString() ?? "application/json";

            return new ContentResult
            {
                Content = content,
                ContentType = contentType,
                StatusCode = (int)response.StatusCode
            };
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            return new StatusCodeResult(StatusCodes.Status499ClientClosedRequest);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Landsat STAC search failed.");
            return Problem(
                title: "Landsat scene search failed",
                detail: "The server could not complete the Landsat STAC search request.",
                statusCode: StatusCodes.Status502BadGateway);
        }
    }
}
