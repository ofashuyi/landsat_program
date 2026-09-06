using System.Net;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace LandsatProgram.Tests;

/// <summary>
/// Exercises the real HTTP pipeline (not just the controller in isolation) because the bug this
/// guards against only exists at the pipeline level: UseStatusCodePagesWithReExecute re-executes
/// any empty-bodied 4xx/5xx response against /error/{code} using the *original* HTTP method. A
/// rate-limit rejection with no body on a POST request used to get replayed as POST /error/429,
/// which the GET-only ErrorController rejected with its own 405 - silently swallowing the real 429.
/// A controller-only unit test cannot see this, since it never runs through routing or
/// UseStatusCodePagesWithReExecute.
/// </summary>
public sealed class RateLimitingIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public RateLimitingIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            // UseSetting writes to the highest-precedence in-memory configuration source, so it
            // reliably overrides appsettings.json - a plain ConfigureAppConfiguration source gets
            // layered before the app's own appsettings.json under the minimal hosting model and is
            // silently ignored.
            builder.UseSetting("LandsatStac:RateLimit:PermitLimit", "2");
            builder.UseSetting("LandsatStac:RateLimit:WindowSeconds", "60");
            builder.ConfigureServices(services =>
            {
                services.AddHttpClient("landsat-stac")
                    .ConfigurePrimaryHttpMessageHandler(() => new StubHttpMessageHandler(_ =>
                        Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                        {
                            Content = new StringContent("""{"type":"FeatureCollection","features":[]}""", Encoding.UTF8, "application/json")
                        })));
            });
        });
    }

    [Fact]
    public async Task ExceedingTheLimit_Returns429WithABody_NotA405FromTheErrorPageReExecute()
    {
        var client = _factory.CreateClient();

        var first = await client.PostAsync("/api/landsat-scenes/search", RequestBody());
        var second = await client.PostAsync("/api/landsat-scenes/search", RequestBody());
        var third = await client.PostAsync("/api/landsat-scenes/search", RequestBody());

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);

        Assert.Equal(HttpStatusCode.TooManyRequests, third.StatusCode);
        Assert.NotEqual("GET", third.Content.Headers.Allow.FirstOrDefault());
        var thirdBody = await third.Content.ReadAsStringAsync();
        Assert.Contains("rate_limited", thirdBody);
    }

    private static StringContent RequestBody() =>
        new("""{"collections":["landsat-c2-l2"],"limit":1}""", Encoding.UTF8, "application/json");

    private sealed class StubHttpMessageHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> respond) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            => respond(request);
    }
}
