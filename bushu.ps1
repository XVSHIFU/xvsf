Set-Location $PSScriptRoot

$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
  Write-Host "[INFO] No changes to commit."
  exit 0
}

$msg = Read-Host 'Commit message (default: update)'
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "update" }

git add .
git commit -m "$msg"
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] Commit failed."; exit 1 }

git push
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] Push failed."; exit 1 }

Write-Host "[OK] Published."