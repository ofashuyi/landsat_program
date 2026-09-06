using System.Net;
using System.Text;
using System.Text.Json;
using LandsatProgram.Controllers.Api;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;

namespace LandsatProgram.Tests;

public sealed class LandsatScenesControllerTests
{
    [Fact]
    public async Task Search_ForwardsRequestBodyAndReturnsUpstreamResponse()
    {
        HttpRequestMessage? capturedRequest = null;
        string? capturedBody = null;
        var handler = new StubHttpMessageHandler(async request =>
        {
            capturedRequest = request;
            capturedBody = await request.Content!.ReadAsStringAsync();
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("""{"type":"FeatureCollection","features":[]}""", Encoding.UTF8, "application/json")
            };
        });
        var controller = CreateController(handler);
        var searchRequest = JsonSerializer.Deserialize<JsonElement>("""{"collections":["landsat-c2-l2"],"limit":12}""");

        var result = await controller.Search(searchRequest, CancellationToken.None);

        var content = Assert.IsType<ContentResult>(result);
        Assert.Equal(200, content.StatusCode);
        Assert.Equal("application/json; charset=utf-8", content.ContentType);
        Assert.Contains("FeatureCollection", content.Content);
        Assert.Equal(HttpMethod.Post, capturedRequest!.Method);
        Assert.Equal("https://stac.example.test/v1/search", capturedRequest.RequestUri!.OriginalString);
        Assert.Contains("landsat-c2-l2", capturedBody);
    }

    [Fact]
    public async Task Search_PropagatesUpstreamErrorStatusCode()
    {
        var handler = new StubHttpMessageHandler(_ => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.TooManyRequests)
            {
                Content = new StringContent("""{"error":"rate limited"}""", Encoding.UTF8, "application/json")
            }));
        var controller = CreateController(handler);
        var searchRequest = JsonSerializer.Deserialize<JsonElement>("{}");

        var result = await controller.Search(searchRequest, CancellationToken.None);

        var content = Assert.IsType<ContentResult>(result);
        Assert.Equal(429, content.StatusCode);
    }

    [Fact]
    public async Task Search_ReturnsBadGateway_WhenUpstreamRequestThrows()
    {
        var handler = new StubHttpMessageHandler(_ => throw new HttpRequestException("upstream unreachable"));
        var controller = CreateController(handler);
        var searchRequest = JsonSerializer.Deserialize<JsonElement>("{}");

        var result = await controller.Search(searchRequest, CancellationToken.None);

        var problem = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status502BadGateway, problem.StatusCode);
    }

    private static LandsatScenesController CreateController(HttpMessageHandler handler)
    {
        var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://stac.example.test/") };
        var factory = new StubHttpClientFactory(httpClient);
        return new LandsatScenesController(factory, NullLogger<LandsatScenesController>.Instance);
    }

    private sealed class StubHttpMessageHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> respond) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            => respond(request);
    }

    private sealed class StubHttpClientFactory(HttpClient client) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => client;
    }
}
