namespace LandsatProgram.Models;

public sealed record MissionCatalog(
    IReadOnlyList<Mission> Missions,
    IReadOnlyList<MissionFilter> Filters);
