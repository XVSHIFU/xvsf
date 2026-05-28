Set-Location $PSScriptRoot

Write-Host "Updating image dimensions..." -ForegroundColor Cyan
python .\scripts\update_image_dimensions.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Image dimensions update failed." -ForegroundColor Red
    exit 1
}

Write-Host "Building Hugo site..." -ForegroundColor Cyan
hugo --config hugo.yaml,hugo.development.yaml --cleanDestinationDir
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Hugo build failed." -ForegroundColor Red
    exit 1
}

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

Write-Host "Pulling latest changes..." -ForegroundColor Cyan
git pull origin main --rebase
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Pull failed." -ForegroundColor Red
    exit 1
}

git push origin main
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] Push failed."; exit 1 }

Write-Host "[OK] Published."