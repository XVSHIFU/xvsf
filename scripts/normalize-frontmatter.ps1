[CmdletBinding(SupportsShouldProcess = $true)]
param()

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
    if ($WhatIfPreference) {
        npm run frontmatter:check
    } else {
        npm run frontmatter:write
    }
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
