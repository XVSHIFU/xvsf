@echo off
setlocal
cd /d "%~dp0"

REM No changes? exit.
git diff --quiet && git diff --cached --quiet
if %errorlevel%==0 (
  echo [INFO] No changes to commit.
  pause
  exit /b 0
)

set msg=
set /p msg=Commit message (default: update): 
if "%msg%"=="" set msg=update

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