namespace LandsatProgram.Models;

public sealed record BandPreset(
    string Id,
    string Name,
    string Combo,
    string Why,
    string GoodFor,
    string Caution,
    BandPresetColors Colors,
    string? Lesson = null,
    string? Practice = null);
