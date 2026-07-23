[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateNotNullOrEmpty()]
    [string[]]$PublishPath,

    [switch]$RunMaintenance
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Stop-Publish([string]$Message) {
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    exit 1
}

function Invoke-Checked([string]$Description, [scriptblock]$Command) {
    Write-Host $Description -ForegroundColor Cyan
    & $Command
    if ($LASTEXITCODE -ne 0) {
        Stop-Publish "$Description failed with exit code $LASTEXITCODE."
    }
}

git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) { Stop-Publish 'This script must run inside a Git worktree.' }

$branch = (git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $branch -ne 'main') {
    Stop-Publish "Publishing is allowed only from the main branch (current: '$branch')."
}

$hugoVersion = (hugo version | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $hugoVersion -notmatch '\bv0\.162\.0\b') {
    Stop-Publish "Hugo Extended v0.162.0 is required. Found: $hugoVersion"
}
if ($hugoVersion -notmatch 'extended') {
    Stop-Publish "Hugo Extended is required. Found: $hugoVersion"
}

$repoRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$selectedPaths = foreach ($path in $PublishPath) {
    if (-not (Test-Path -LiteralPath $path)) {
        Stop-Publish "Publish path does not exist: $path"
    }
    $absolute = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $path).Path)
    $relative = [System.IO.Path]::GetRelativePath($repoRoot, $absolute).Replace('\', '/').TrimEnd('/')
    if ($relative -eq '.' -or $relative.StartsWith('../') -or [System.IO.Path]::IsPathRooted($relative)) {
        Stop-Publish "Publish paths must be explicit files or subdirectories inside the repository: $path"
    }
    $relative
}
$selectedPaths = @($selectedPaths | Sort-Object -Unique)

if ($RunMaintenance -and -not ($selectedPaths | Where-Object { $_ -eq 'content' -or $_.StartsWith('content/') })) {
    Stop-Publish '-RunMaintenance requires content/ (or a path under it) in -PublishPath.'
}

$stagedAtStart = @(git -c core.quotePath=false diff --cached --name-only)
if ($LASTEXITCODE -ne 0) { Stop-Publish 'Unable to inspect the Git index.' }
if ($stagedAtStart.Count -gt 0) {
    Stop-Publish "The Git index already contains staged changes. Commit or unstage them before publishing.`n$($stagedAtStart -join "`n")"
}

function Get-DirtyFiles {
    $tracked = @(
        git -c core.quotePath=false diff --name-only
        git -c core.quotePath=false diff --name-only --cached
        git -c core.quotePath=false ls-files --others --exclude-standard
    ) | Where-Object { $_ } | ForEach-Object { $_.Replace('\', '/') }
    return @($tracked | Sort-Object -Unique)
}

function Test-Selected([string]$File) {
    foreach ($selected in $selectedPaths) {
        if ($File -eq $selected -or $File.StartsWith($selected + '/')) { return $true }
    }
    return $false
}

function Assert-NoOutOfScopeChanges {
    $outside = @(Get-DirtyFiles | Where-Object { -not (Test-Selected $_) })
    if ($outside.Count -gt 0) {
        Stop-Publish "Changes outside -PublishPath were found. They will not be staged; publishing is stopped to avoid a partial or accidental commit:`n$($outside -join "`n")"
    }
}

Assert-NoOutOfScopeChanges

Write-Host '[INFO] Explicit publish scope:' -ForegroundColor Yellow
$selectedPaths | ForEach-Object { Write-Host "  $_" }

if ($RunMaintenance) {
    if ($WhatIfPreference) {
        Write-Host '[WHATIF] Would run remove_font_tags.py and update_image_dimensions.py.' -ForegroundColor Yellow
    } else {
        Invoke-Checked 'Removing <font> tags from posts...' { python .\scripts\remove_font_tags.py }
        Invoke-Checked 'Updating image dimensions...' { python .\scripts\update_image_dimensions.py }
        Assert-NoOutOfScopeChanges
    }
}

if ($WhatIfPreference) {
    Invoke-Checked 'Validating Hugo build in memory...' { hugo --renderToMemory }
    Write-Host '[WHATIF] Would stage only the explicit publish scope shown above.' -ForegroundColor Yellow
    Write-Host '[WHATIF] No files were staged and no commit, pull, or push was executed.' -ForegroundColor Yellow
    exit 0
}

Write-Host 'Building Hugo site...' -ForegroundColor Cyan
Invoke-Checked 'Building Hugo site...' { hugo --cleanDestinationDir }

git add -- $selectedPaths
if ($LASTEXITCODE -ne 0) { Stop-Publish 'Unable to stage the explicit publish paths.' }

$staged = @(git -c core.quotePath=false diff --cached --name-only)
if ($staged.Count -eq 0) {
    Write-Host '[INFO] No selected changes to commit.'
    exit 0
}
$unexpected = @($staged | Where-Object { -not (Test-Selected $_) })
if ($unexpected.Count -gt 0) {
    Stop-Publish "Unexpected staged files detected:`n$($unexpected -join "`n")"
}

Write-Host '[INFO] Files ready to publish:' -ForegroundColor Yellow
git diff --cached --name-status
git diff --cached --stat

$confirmation = Read-Host 'Type PUBLISH to commit, rebase, and push these files'
if ($confirmation -cne 'PUBLISH') {
    Write-Host '[INFO] Publishing cancelled. Selected files remain staged for inspection.' -ForegroundColor Yellow
    exit 0
}

$message = Read-Host 'Commit message (default: update)'
if ([string]::IsNullOrWhiteSpace($message)) { $message = 'update' }

Invoke-Checked 'Creating commit...' { git commit -m $message }
Invoke-Checked 'Rebasing onto origin/main...' { git pull origin main --rebase }
Invoke-Checked 'Pushing main...' { git push origin main }

Write-Host '[OK] Published.' -ForegroundColor Green
