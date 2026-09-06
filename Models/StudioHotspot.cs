namespace LandsatProgram.Models;

public sealed record StudioHotspot(
    string Id,
    string Name,
    string Short,
    IReadOnlyList<double> Center,
    int Zoom,
    IReadOnlyList<StudioYearRecord> Years);
