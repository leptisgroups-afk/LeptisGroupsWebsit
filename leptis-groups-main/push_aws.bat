@echo off
setlocal enabledelayedexpansion

:: Set workspace directory to the Git root (one level up from this script's folder)
cd /d "%~dp0\.."

title Leptis Group AWS Auto-Deployer
color 0B
cls

:: Check if git is installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo =======================================================================
    echo [ERROR] Git is not installed or not in your system PATH.
    echo Please install Git and try again.
    echo =======================================================================
    pause
    exit /b 1
)

:: Check if git repository exists
if not exist .git (
    echo =======================================================================
    echo [ERROR] No Git repository detected in the parent directory!
    echo Please ensure this script is in leptis-groups-main directory.
    echo =======================================================================
    pause
    exit /b 1
)

:: Validate Git Configurations
git config user.name >nul 2>&1
set NO_NAME=%errorlevel%
git config user.email >nul 2>&1
set NO_EMAIL=%errorlevel%

if %NO_NAME% neq 0 (
    echo [WARNING] Git user.name is not configured locally. Commits may fail.
)
if %NO_EMAIL% neq 0 (
    echo [WARNING] Git user.email is not configured locally. Commits may fail.
)

:menu
cls
echo =======================================================================
echo                 LEPTIS GROUP AWS AUTO-PUSH UTILITY
echo =======================================================================
echo  This script pushes updates to GitHub, which automatically deploys to AWS.
echo =======================================================================
echo.
echo  [1] Quick Push (Stage, Commit with message, and Push)
echo  [2] Start File Watcher (Continuous Auto-Push on change)
echo  [3] Check Git Status
echo  [4] Run Next.js Build Check (Local verification)
echo  [5] Git Pull (Sync local repository)
echo  [6] Exit
echo.
echo =======================================================================
set /p CHOICE="Select an option (1-6): "

if "%CHOICE%"=="1" goto quick_push
if "%CHOICE%"=="2" goto start_watcher
if "%CHOICE%"=="3" goto git_status
if "%CHOICE%"=="4" goto build_check
if "%CHOICE%"=="5" goto git_pull
if "%CHOICE%"=="6" exit /b
goto menu

:quick_push
cls
echo =======================================================================
echo  QUICK PUSH TO AWS
echo =======================================================================
echo.

:: Verify if there are any changes to stage/commit
set "CHANGES_EXIST="
for /f "delims=" %%i in ('git status --porcelain') do (
    set CHANGES_EXIST=1
)

if not defined CHANGES_EXIST (
    echo [INFO] No changes detected. Your local repository is already clean.
    echo.
    pause
    goto menu
)

echo [+] Changes detected:
git status -s
echo.

set "COMMIT_MSG="
set /p COMMIT_MSG="Enter commit message (or press Enter for auto-timestamp): "
if "%COMMIT_MSG%"=="" (
    set "COMMIT_MSG=Auto-update: %date% %time%"
)

echo.
echo [+] Staging all changes (git add .)...
git add .

echo [+] Committing changes...
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo [ERROR] Git commit failed! Please check Git user settings.
    pause
    goto menu
)

echo [+] Pulling latest changes from remote to prevent conflicts...
git pull origin main --rebase
if %errorlevel% neq 0 (
    echo [WARN] Git pull failed or encountered conflicts.
    echo Please resolve conflicts manually if needed.
)

echo [+] Pushing changes to AWS (GitHub)...
git push origin main
if %errorlevel% equ 0 (
    echo.
    echo =======================================================================
    echo [SUCCESS] Changes pushed successfully! AWS build should start shortly.
    echo =======================================================================
) else (
    echo.
    echo =======================================================================
    echo [ERROR] Push failed. Please check network connection or Git conflicts.
    echo =======================================================================
)
echo.
pause
goto menu

:start_watcher
cls
echo =======================================================================
echo                 AWS AUTO-PUSH WATCHER STARTED
echo =======================================================================
echo  Watching for any file updates in the repository...
echo  (Press Ctrl+C at any time to stop the watcher)
echo =======================================================================
echo.

:watch_loop
:: Wait 5 seconds before checking again
timeout /t 5 >nul

:: Check git status
set "HAS_CHANGES="
for /f "delims=" %%i in ('git status --porcelain') do (
    set HAS_CHANGES=1
)

if defined HAS_CHANGES (
    echo [+] File changes detected at %time%
    echo [+] Staging and committing...
    git add .
    
    set "WATCH_MSG=Auto-update: %date% %time%"
    git commit -m "!WATCH_MSG!"
    
    echo [+] Pulling remote updates...
    git pull origin main --rebase
    
    echo [+] Pushing to AWS (GitHub)...
    git push origin main
    if !errorlevel! equ 0 (
        echo [OK] Auto-pushed changes successfully at !time!
    ) else (
        echo [WARN] Push failed. Will retry on next check.
    )
    echo [*] Resuming file monitoring...
    echo.
)
goto watch_loop

:git_status
cls
echo =======================================================================
echo  CURRENT GIT STATUS
echo =======================================================================
echo.
git status
echo.
pause
goto menu

:build_check
cls
echo =======================================================================
echo  RUNNING LOCAL NEXT.JS BUILD CHECK
echo =======================================================================
echo.
echo Running "npm run build" in frontend...
cd leptis-groups-main\leptis-groups-main
call npm run build
set BUILD_ERR=%errorlevel%
cd ..\..
echo.
if %BUILD_ERR% equ 0 (
    echo [SUCCESS] Next.js build completed successfully with no errors!
) else (
    echo [ERROR] Next.js build failed. Please fix compilation errors before pushing.
)
echo.
pause
goto menu

:git_pull
cls
echo =======================================================================
echo  SYNCING WITH AWS (GIT PULL)
echo =======================================================================
echo.
git pull origin main
echo.
pause
goto menu
