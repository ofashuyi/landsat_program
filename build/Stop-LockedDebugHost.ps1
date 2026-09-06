param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectDirectory,

    [string]$Configuration = "Debug",

    [string]$TargetFramework = "net10.0"
)

$ErrorActionPreference = "SilentlyContinue"

try {
    $projectRoot = (Resolve-Path -LiteralPath $ProjectDirectory).Path
}
catch {
    exit 0
}

if ([string]::IsNullOrWhiteSpace($TargetFramework)) {
    $TargetFramework = "net10.0"
}

$outputRoot = Join-Path $projectRoot "bin\$Configuration\$TargetFramework"
$appExe = Join-Path $outputRoot "LandsatProgram.exe"

function Test-SamePath {
    param(
        [string]$Left,
        [string]$Right
    )

    if ([string]::IsNullOrWhiteSpace($Left) -or [string]::IsNullOrWhiteSpace($Right)) {
        return $false
    }

    return [string]::Equals(
        [System.IO.Path]::GetFullPath($Left).TrimEnd('\'),
        [System.IO.Path]::GetFullPath($Right).TrimEnd('\'),
        [System.StringComparison]::OrdinalIgnoreCase)
}

$processIds = New-Object 'System.Collections.Generic.HashSet[int]'

Get-Process LandsatProgram -ErrorAction SilentlyContinue | Where-Object {
    Test-SamePath $_.Path $appExe
} | ForEach-Object {
    [void]$processIds.Add([int]$_.Id)
}

$launchSettingsPath = Join-Path $projectRoot "Properties\launchSettings.json"
if (Test-Path -LiteralPath $launchSettingsPath) {
    $launchSettings = Get-Content -LiteralPath $launchSettingsPath -Raw | ConvertFrom-Json
    $profiles = $launchSettings.profiles.PSObject.Properties.Value

    foreach ($profile in $profiles) {
        if ([string]::IsNullOrWhiteSpace($profile.applicationUrl)) {
            continue
        }

        foreach ($url in ($profile.applicationUrl -split ';')) {
            $uri = $null
            if ([System.Uri]::TryCreate($url, [System.UriKind]::Absolute, [ref]$uri) -and $uri.Port -gt 0) {
                Get-NetTCPConnection -LocalPort $uri.Port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
                    if ($_.OwningProcess -gt 0) {
                        [void]$processIds.Add([int]$_.OwningProcess)
                    }
                }
            }
        }
    }
}

foreach ($processId in $processIds) {
    Stop-Process -Id $processId -Force
    Write-Host "Stopped stale LandsatProgram host process $processId before build."
}

exit 0
