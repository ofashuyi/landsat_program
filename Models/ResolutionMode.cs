namespace LandsatProgram.Models;

public sealed record ResolutionMode(
    string Id,
    string Label,
    string Title,
    string Description,
    IReadOnlyList<LearningFact> Facts,
    string VisualType,
    int? PixelCount,
    int? CoarseEvery,
    IReadOnlyList<LearningCard>? Cards,
    IReadOnlyList<ResolutionBand>? Bands,
    IReadOnlyList<ResolutionTimeline>? Timelines,
    IReadOnlyList<ResolutionTone>? Tones,
    string? Story);
