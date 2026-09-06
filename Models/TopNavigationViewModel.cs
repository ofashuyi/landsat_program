namespace LandsatProgram.Models;

public sealed record TopNavigationViewModel(
    string BrandHref,
    string BrandSubtitle,
    IReadOnlyList<NavigationLink> Links);
