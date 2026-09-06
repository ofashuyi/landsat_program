namespace LandsatProgram.Models;

public sealed record StudioOptions(
    IReadOnlyList<StudioOption> Basemaps,
    IReadOnlyList<StudioOption> Satellites,
    IReadOnlyList<StudioOption> ViewModes);
