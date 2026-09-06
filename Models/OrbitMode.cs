namespace LandsatProgram.Models;

public sealed record OrbitMode(
    string Id,
    string Label,
    string Title,
    string Description,
    string Caption,
    IReadOnlyList<LearningFact> Facts,
    IReadOnlyList<string> Visible,
    string? Lesson = null);
