namespace LandsatProgram.Models;

public sealed record StudioCatalog(
    IReadOnlyList<StudioHotspot> Hotspots,
    StudioOptions Options,
    IReadOnlyDictionary<string, StudioModeDetail> ModeDetails);
