using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

namespace LandsatProgram.Tests;

/// <summary>
/// Minimal IWebHostEnvironment pointing ContentRootPath at the real repo root, so catalog
/// services under test read the actual checked-in Data/*.json files.
/// </summary>
public sealed class TestWebHostEnvironment : IWebHostEnvironment
{
    public TestWebHostEnvironment()
    {
        ContentRootPath = RepositoryRoot.Find();
    }

    public string EnvironmentName { get; set; } = "Development";
    public string ApplicationName { get; set; } = "LandsatProgram.Tests";
    public string ContentRootPath { get; set; }
    public string WebRootPath { get; set; } = string.Empty;
    public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
}

internal static class RepositoryRoot
{
    public static string Find()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "LandsatProgram.csproj")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName
            ?? throw new InvalidOperationException("Could not locate the repository root containing LandsatProgram.csproj.");
    }
}
