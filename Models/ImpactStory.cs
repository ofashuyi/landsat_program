namespace LandsatProgram.Models;

public sealed record ImpactStory(
    string Id,
    string Label,
    string Title,
    string Summary,
    IReadOnlyList<ImpactMetric> Metrics,
    string Story);
