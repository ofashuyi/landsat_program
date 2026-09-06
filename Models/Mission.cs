namespace LandsatProgram.Models;

public sealed record Mission(
    string Id,
    string Name,
    string LaunchDate,
    int Year,
    string Status,
    string StatusLabel,
    string Era,
    string Sensors,
    string Revisit,
    string Resolution,
    string Image,
    string Short,
    string Summary,
    string Highlight,
    IReadOnlyList<string> Keywords);
