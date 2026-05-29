Set-Location $PSScriptRoot

Write-Host "Removing <font> tags from posts..." -ForegroundColor Cyan
python .\scripts\remove_font_tags.py

Write-Host "Updating image dimensions..." -ForegroundColor Cyan
python .\scripts\update_image_dimensions.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Image dimensions update failed." -ForegroundColor Red
    exit 1
}

Write-Host "Building Hugo site..." -ForegroundColor Cyan
# 清理旧构建产物，避免 --cleanDestinationDir 在 Windows 上因文件锁失败
if (Test-Path public) { Remove-Item -Recurse -Force public }
hugo --config hugo.yaml
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

git add content/ layouts/ assets/ static/ hugo.yaml hugo.development.yaml scripts/ archetypes/ data/ bushu.ps1 .gitignore .github/
git add --update  # 确保已跟踪文件的修改也被包含
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