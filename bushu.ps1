[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
    [Parameter(Position = 0)]
    [ValidateNotNullOrEmpty()]
    [string[]]$PublishPath = @(
        '.github',
        '.gitignore',
        '.gitmodules',
        '.htmlvalidate.json',
        '.lycheeignore',
        '.pages.yml',
        'FRONTMATTER_TEMPLATE.md',
        'README.md',
        'archetypes',
        'assets',
        'bushu.ps1',
        'config',
        'content',
        'data',
        'deploy',
        'i18n',
        'layouts',
        'package-lock.json',
        'package.json',
        'schemas',
        'scripts',
        'static',
        'themes'
    ),

    [switch]$RunMaintenance
)

$ErrorActionPreference = 'Stop'
$utf8Encoding = New-Object System.Text.UTF8Encoding -ArgumentList $false
[Console]::OutputEncoding = $utf8Encoding
$OutputEncoding = $utf8Encoding
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

function Clear-PublishStage([string[]]$Paths) {
    git restore --staged -- $Paths
    if ($LASTEXITCODE -ne 0) {
        Write-Warning 'Unable to restore the Git index automatically. The working tree was not changed.'
        return $false
    }
    Write-Host '[INFO] Git index restored; working tree changes were kept.' -ForegroundColor Yellow
    return $true
}

function Wait-PullRequestChecks(
    [string]$PrUrl,
    [int]$DiscoveryTimeoutSeconds = 180,
    [int]$PollIntervalSeconds = 5
) {
    Write-Host 'Waiting for the validate check to be registered...' -ForegroundColor Cyan
    $deadline = [DateTime]::UtcNow.AddSeconds($DiscoveryTimeoutSeconds)
    $validateRegistered = $false

    while ([DateTime]::UtcNow -lt $deadline) {
        $checkJson = & gh pr checks $PrUrl --json name,workflow,bucket 2>$null
        $checkExitCode = $LASTEXITCODE
        if (($checkExitCode -eq 0 -or $checkExitCode -eq 8) -and $checkJson) {
            $checks = @((($checkJson | Out-String) | ConvertFrom-Json))
            $validateRegistered = @(
                $checks | Where-Object {
                    $_.name -eq 'validate' -and $_.workflow -eq 'Validate and deploy Hugo site'
                }
            ).Count -gt 0
            if ($validateRegistered) { break }
        }
        Start-Sleep -Seconds $PollIntervalSeconds
    }

    if (-not $validateRegistered) {
        Stop-Publish "The validate check was not registered within $DiscoveryTimeoutSeconds seconds. The pull request remains open: $PrUrl"
    }

    Invoke-Checked 'Waiting for pull request checks...' { gh pr checks $PrUrl --watch --interval 10 --fail-fast }
}

git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) { Stop-Publish 'This script must run inside a Git worktree.' }

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Stop-Publish 'GitHub CLI (gh) is required to publish through a pull request.'
}
gh auth status --hostname github.com *> $null
if ($LASTEXITCODE -ne 0) {
    Stop-Publish 'GitHub CLI is not authenticated. Run: gh auth login'
}

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
$repoPrefix = $repoRoot.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
$selectedPaths = foreach ($path in $PublishPath) {
    if (-not (Test-Path -LiteralPath $path)) {
        Stop-Publish "Publish path does not exist: $path"
    }
    $absolute = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $path).Path)
    if (-not $absolute.StartsWith($repoPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        Stop-Publish "Publish paths must be explicit files or subdirectories inside the repository: $path"
    }
    $relative = $absolute.Substring($repoPrefix.Length).Replace('\', '/').TrimEnd('/')
    if ([string]::IsNullOrWhiteSpace($relative)) {
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
    Write-Host '[WHATIF] Would publish through a temporary publish/* branch and pull request.' -ForegroundColor Yellow
    Write-Host '[WHATIF] No files were staged and no branch, commit, push, pull request, or merge was created.' -ForegroundColor Yellow
    exit 0
}

Invoke-Checked 'Building Hugo site...' { hugo --cleanDestinationDir }

$stagedByScript = $false
$publishBranch = $null
$pullRequestMerged = $false
try {
    git add -- $selectedPaths
    if ($LASTEXITCODE -ne 0) { Stop-Publish 'Unable to stage the explicit publish paths.' }
    $stagedByScript = $true

    $staged = @(git -c core.quotePath=false diff --cached --name-only)
    if ($LASTEXITCODE -ne 0) { Stop-Publish 'Unable to inspect the staged files.' }
    $hasStagedChanges = $staged.Count -gt 0

    $localAhead = ((git rev-list --count origin/main..HEAD) | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or $localAhead -notmatch '^\d+$') {
        Stop-Publish 'Unable to determine whether main has unpublished local commits.'
    }
    $localAhead = [int]$localAhead

    if (-not $hasStagedChanges -and $localAhead -eq 0) {
        $stagedByScript = $false
        Write-Host '[INFO] No selected changes or unpublished local commits.'
        exit 0
    }

    if ($hasStagedChanges) {
        $unexpected = @($staged | Where-Object { -not (Test-Selected $_) })
        if ($unexpected.Count -gt 0) {
            Stop-Publish ('Unexpected staged files detected:' + [Environment]::NewLine + ($unexpected -join [Environment]::NewLine))
        }

        Write-Host '[INFO] Files ready to publish:' -ForegroundColor Yellow
        git --no-pager -c core.quotePath=false diff --cached --name-status
        if ($LASTEXITCODE -ne 0) { Stop-Publish 'Unable to display the staged file list.' }
        git --no-pager -c core.quotePath=false diff --cached --stat
        if ($LASTEXITCODE -ne 0) { Stop-Publish 'Unable to display the staged diff summary.' }
    }

    if ($localAhead -gt 0) {
        Write-Host "[INFO] Including $localAhead unpublished local main commit(s):" -ForegroundColor Yellow
        git --no-pager log --oneline origin/main..HEAD
        if ($LASTEXITCODE -ne 0) { Stop-Publish 'Unable to display unpublished local commits.' }
    }

    $confirmation = Read-Host 'Type PUBLISH to commit, create and merge a pull request, and sync main'
    if ($confirmation -cne 'PUBLISH') {
        Write-Host '[INFO] Publishing cancelled. Restoring the Git index...' -ForegroundColor Yellow
        exit 0
    }

    $defaultMessage = if ($hasStagedChanges) {
        'update'
    } else {
        ((git log -1 --pretty=%s) | Out-String).Trim()
    }
    $message = Read-Host "Commit and pull request title (default: $defaultMessage)"
    if ([string]::IsNullOrWhiteSpace($message)) { $message = $defaultMessage }

    Invoke-Checked 'Fetching origin/main...' { git fetch origin main }
    $remoteAhead = ((git rev-list --count HEAD..origin/main) | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or $remoteAhead -notmatch '^\d+$') {
        Stop-Publish 'Unable to compare local main with origin/main.'
    }
    if ([int]$remoteAhead -gt 0) {
        Stop-Publish 'origin/main changed during publishing. No commit was created; update main and run the script again.'
    }

    if ($hasStagedChanges) {
        Invoke-Checked 'Creating commit...' { git commit -m $message }
        $stagedByScript = $false
    }

    $publishBranch = 'publish/' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + ([guid]::NewGuid().ToString('N').Substring(0, 6))
    Invoke-Checked "Creating publish branch $publishBranch..." { git switch -c $publishBranch }
    Invoke-Checked "Pushing $publishBranch..." { git push -u origin $publishBranch }

    Write-Host 'Creating pull request...' -ForegroundColor Cyan
    $prOutput = & gh pr create --base main --head $publishBranch --title $message --body 'Automated publish created by bushu.ps1 after local Hugo validation.'
    $prExitCode = $LASTEXITCODE
    $prOutputText = ($prOutput | Out-String).Trim()
    $prMatch = [regex]::Match($prOutputText, 'https://github\.com/[^\s]+/pull/\d+')
    if ($prExitCode -ne 0 -or -not $prMatch.Success) {
        Stop-Publish "Unable to create the pull request. GitHub CLI output: $prOutputText"
    }
    $prUrl = $prMatch.Value
    Write-Host "[INFO] Pull request: $prUrl" -ForegroundColor Yellow

    Wait-PullRequestChecks -PrUrl $prUrl
    Invoke-Checked 'Merging pull request...' { gh pr merge $prUrl --merge --delete-branch }
    $pullRequestMerged = $true

    $currentBranch = ((git branch --show-current) | Out-String).Trim()
    if ($currentBranch -ne 'main') {
        Invoke-Checked 'Switching back to main...' { git switch main }
    }
    Invoke-Checked 'Synchronizing local main...' { git pull --ff-only origin main }

    git show-ref --verify --quiet "refs/heads/$publishBranch"
    if ($LASTEXITCODE -eq 0) {
        Invoke-Checked "Deleting local publish branch $publishBranch..." { git branch -d $publishBranch }
    }

    Write-Host "[OK] Published through $prUrl" -ForegroundColor Green
} finally {
    if ($stagedByScript) {
        [void](Clear-PublishStage -Paths $selectedPaths)
    }
    if ($publishBranch -and -not $pullRequestMerged) {
        $currentBranch = ((git branch --show-current) | Out-String).Trim()
        if ($currentBranch -ne 'main') {
            git switch main
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Unable to switch back to main. The safe publish branch is: $publishBranch"
            }
        }
        Write-Warning "Publishing did not finish. The commit is safe on branch: $publishBranch"
    }
}
