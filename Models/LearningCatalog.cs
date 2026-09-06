namespace LandsatProgram.Models;

public sealed record LearningCatalog(
    IReadOnlyList<OrbitMode> OrbitModes,
    IReadOnlyList<ResolutionMode> ResolutionModes);
