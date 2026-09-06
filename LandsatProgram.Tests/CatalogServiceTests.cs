using LandsatProgram.Services;

namespace LandsatProgram.Tests;

public sealed class CatalogServiceTests
{
    private readonly TestWebHostEnvironment _environment = new();

    [Fact]
    public async Task MissionCatalog_LoadsMissionsWithAbsoluteImagePaths()
    {
        // Regression test: mission images were once stored as bare relative paths
        // ("img/landsat1.jpg"), which resolve incorrectly on nested routes like
        // /briefing/missions (the browser requests /briefing/img/landsat1.jpg -> 404).
        var service = new JsonMissionCatalogService(_environment);

        var catalog = await service.GetCatalogAsync();

        Assert.NotEmpty(catalog.Missions);
        Assert.All(catalog.Missions, mission =>
        {
            Assert.False(string.IsNullOrWhiteSpace(mission.Id));
            Assert.StartsWith("/", mission.Image);
        });
        Assert.NotEmpty(catalog.Filters);
    }

    [Fact]
    public async Task MissionCatalog_CachesResultAcrossCalls()
    {
        var service = new JsonMissionCatalogService(_environment);

        var first = await service.GetCatalogAsync();
        var second = await service.GetCatalogAsync();

        Assert.Same(first, second);
    }

    [Fact]
    public async Task StudioCatalog_LoadsHotspotsAndModeDetails()
    {
        var service = new JsonStudioCatalogService(_environment);

        var catalog = await service.GetCatalogAsync();

        Assert.NotEmpty(catalog.Hotspots);
        Assert.NotEmpty(catalog.ModeDetails);
        Assert.NotEmpty(catalog.Options.Basemaps);
        Assert.NotEmpty(catalog.Options.Satellites);
        Assert.NotEmpty(catalog.Options.ViewModes);
        Assert.All(catalog.Hotspots, hotspot =>
        {
            Assert.Equal(2, hotspot.Center.Count);
            Assert.NotEmpty(hotspot.Years);
        });
    }

    [Fact]
    public async Task ApplicationCatalog_LoadsImpactStoriesAndComplementaryMissions()
    {
        var service = new JsonApplicationCatalogService(_environment);

        var catalog = await service.GetCatalogAsync();

        Assert.NotEmpty(catalog.ImpactStories);
        Assert.NotEmpty(catalog.ComplementaryMissions);
    }

    [Fact]
    public async Task BandCatalog_LoadsPresets()
    {
        var service = new JsonBandCatalogService(_environment);

        var catalog = await service.GetCatalogAsync();

        Assert.NotEmpty(catalog.Presets);
    }

    [Fact]
    public async Task DataGuide_LoadsGuidesAndRecommendations()
    {
        var service = new JsonDataGuideService(_environment);

        var catalog = await service.GetCatalogAsync();

        Assert.NotEmpty(catalog.Guides);
        Assert.NotEmpty(catalog.Recommendations);
    }

    [Fact]
    public async Task LearningCatalog_LoadsOrbitAndResolutionModes()
    {
        var service = new JsonLearningCatalogService(_environment);

        var catalog = await service.GetCatalogAsync();

        Assert.NotEmpty(catalog.OrbitModes);
        Assert.NotEmpty(catalog.ResolutionModes);
    }
}
