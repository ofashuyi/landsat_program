namespace LandsatProgram.Models;

public sealed record StudioYearRecord(
    int Year,
    string Note,
    double FootprintKm,
    IReadOnlyDictionary<string, double> Metrics,
    IReadOnlyDictionary<string, double> Indices);
