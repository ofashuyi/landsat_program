namespace LandsatProgram.Models;

public sealed record ResolutionTimeline(
    string Title,
    int Length,
    IReadOnlyList<int> ActiveIndexes);
