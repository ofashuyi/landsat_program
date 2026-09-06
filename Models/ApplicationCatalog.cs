namespace LandsatProgram.Models;

public sealed record ApplicationCatalog(
    IReadOnlyList<ImpactStory> ImpactStories,
    IReadOnlyList<ComplementaryMission> ComplementaryMissions);
