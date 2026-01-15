@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

REM 1) 确认是 git 仓库
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Not a git repository: %CD%
  pause
  exit /b 1
)

REM 2) 看看是否有改动
git status --porcelain > "%temp%\git_status.txt"
for %%A in ("%temp%\git_status.txt") do set size=%%~zA
if "!size!"=="0" (
  echo [INFO] No changes to commit.
  del "%temp%\git_status.txt" >nul 2>&1
  pause
  exit /b 0
)
del "%temp%\git_status.txt" >nul 2>&1

REM 3) 输入提交信息
set msg=
set /p msg=Commit message (default: update): 
if "%msg%"=="" set msg=update

REM 4) 提交并推送
git add .
git commit -m "%msg%"
if errorlevel 1 (
  echo [ERROR] Commit failed.
  pause
  exit /b 1
)

git push
if errorlevel 1 (
  echo [ERROR] Push failed.
  pause
  exit /b 1
)

echo [OK] Published.
pause
endlocal