namespace LandsatProgram.Models;

public sealed record WorkflowRecommendation(
    string Product,
    string Confidence,
    string Why,
    string BestFor,
    string Tradeoff,
    string NextStep);
