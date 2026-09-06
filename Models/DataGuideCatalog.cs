namespace LandsatProgram.Models;

public sealed record DataGuideCatalog(
    IReadOnlyDictionary<string, IReadOnlyList<WorkflowOption>> Guides,
    IReadOnlyDictionary<string, WorkflowRecommendation> Recommendations);
