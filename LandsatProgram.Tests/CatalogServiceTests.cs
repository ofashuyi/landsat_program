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
    public async Task BandCatalog_PresetsIncludeLessonAndPractice()
    {
        // Regression test: band-catalog.json has always carried "lesson" and "practice"
        // text for every preset, and js/app.js has always rendered them if present, but
        // BandPreset did not declare those properties, so System.Text.Json silently
        // dropped them and the client-side "Lesson"/"Practice" cards never appeared.
        var service = new JsonBandCatalogService(_environment);

        var catalog = await service.GetCatalogAsync();

        Assert.All(catalog.Presets, preset =>
        {
            Assert.False(string.IsNullOrWhiteSpace(preset.Lesson));
            Assert.False(string.IsNullOrWhiteSpace(preset.Practice));
        });
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
    public async Task DataGuide_RecommendationsIncludeTeachingTip()
    {
        // Regression test: same silently-dropped-field bug as the band catalog, but for
        // WorkflowRecommendation.TeachingTip.
        var service = new JsonDataGuideService(_environment);

        var catalog = await service.GetCatalogAsync();

        Assert.All(catalog.Recommendations.Values, recommendation =>
            Assert.False(string.IsNullOrWhiteSpace(recommendation.TeachingTip)));
    }

    [Fact]
    public async Task LearningCatalog_LoadsOrbitAndResolutionModes()
    {
        var service = new JsonLearningCatalogService(_environment);

        var catalog = await service.GetCatalogAsync();

        Assert.NotEmpty(catalog.OrbitModes);
        Assert.NotEmpty(catalog.ResolutionModes);
    }

    [Fact]
    public async Task LearningCatalog_OrbitModesIncludeLessonAndResolutionModesIncludeTeacherNote()
    {
        // Regression test: same silently-dropped-field bug as the band catalog, but for
        // OrbitMode.Lesson and ResolutionMode.TeacherNote.
        var service = new JsonLearningCatalogService(_environment);

        var catalog = await service.GetCatalogAsync();

        Assert.All(catalog.OrbitModes, mode => Assert.False(string.IsNullOrWhiteSpace(mode.Lesson)));
        Assert.All(catalog.ResolutionModes, mode => Assert.False(string.IsNullOrWhiteSpace(mode.TeacherNote)));
    }

    [Fact]
    public async Task ApplicationCatalog_ImpactStoriesIncludeQuestionWorkflowAndLimitation()
    {
        // Regression test: same silently-dropped-field bug as the band catalog, but for
        // ImpactStory.Question, ImpactStory.Workflow, and ImpactStory.Limitation.
        var service = new JsonApplicationCatalogService(_environment);

        var catalog = await service.GetCatalogAsync();

        Assert.All(catalog.ImpactStories, story =>
        {
            Assert.False(string.IsNullOrWhiteSpace(story.Question));
            Assert.False(string.IsNullOrWhiteSpace(story.Workflow));
            Assert.False(string.IsNullOrWhiteSpace(story.Limitation));
        });
    }
}
