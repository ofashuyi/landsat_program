namespace LandsatProgram.Models;

public sealed record StudioModeDetail(
    string Title,
    string Copy,
    string IndexTitle,
    string IndexContext,
    string Metric,
    string Color,
    IReadOnlyList<SpectralSample> Spectral);
