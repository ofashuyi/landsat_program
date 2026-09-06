param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectDirectory
)

$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path -LiteralPath $ProjectDirectory).Path
$esbuild = Join-Path $projectRoot "tools\esbuild\esbuild.exe"

if (-not (Test-Path -LiteralPath $esbuild)) {
    Write-Warning "esbuild.exe not found at $esbuild; skipping asset minification."
    exit 0
}

$assets = @(
    @{ Source = Join-Path $projectRoot "css\app.css"; Output = Join-Path $projectRoot "css\app.min.css" },
    @{ Source = Join-Path $projectRoot "js\app.js"; Output = Join-Path $projectRoot "js\app.min.js" }
)

foreach ($asset in $assets) {
    if (-not (Test-Path -LiteralPath $asset.Source)) {
        Write-Warning "Skipping missing asset: $($asset.Source)"
        continue
    }

    & $esbuild $asset.Source --minify "--outfile=$($asset.Output)"
    if ($LASTEXITCODE -ne 0) {
        throw "esbuild failed to minify $($asset.Source)"
    }

    Write-Host "Minified $(Split-Path -Leaf $asset.Source) -> $(Split-Path -Leaf $asset.Output)"
}
