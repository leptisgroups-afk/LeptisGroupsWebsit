@echo off
setlocal enabledelayedexpansion

:: Set workspace directory to the Git root (one level up from this script's folder)
cd /d "%~dp0\.."

title Leptis Group AWS Auto-Deployer
color 0B
cls

:: Default AWS EC2 Connection Details
set "PEM_KEY=D:\LeptisGroup\landingweb.pem"
set "REMOTE_USER=ec2-user"
set "REMOTE_IP=13.48.43.4"
set "REMOTE_PATH=/home/ec2-user/leptis-groups"

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

:menu
cls
echo =======================================================================
echo                 LEPTIS GROUP AWS AUTO-PUSH UTILITY
echo =======================================================================
echo  Deploy and push code to Git & data files to AWS EC2 instance.
echo =======================================================================
echo.
echo  [1] Quick Push Code (Stage, Commit, and Push to GitHub)
echo  [2] Start Code File Watcher (Continuous Auto-Push to GitHub)
echo  [3] Push SQLite Database (db.sqlite3) to AWS via SCP
echo  [4] Push Media Uploads (media/) to AWS via SCP
echo  [5] Push Full File & Data (Database + Media + Code) to AWS
echo  [6] Check Git Status
echo  [7] Run Next.js Build Check (Local verification)
echo  [8] Git Pull (Sync local repository)
echo  [9] Exit
echo.
echo =======================================================================
set /p CHOICE="Select an option (1-9): "

if "%CHOICE%"=="1" goto quick_push
if "%CHOICE%"=="2" goto start_watcher
if "%CHOICE%"=="3" goto push_db
if "%CHOICE%"=="4" goto push_media
if "%CHOICE%"=="5" goto push_full
if "%CHOICE%"=="6" goto git_status
if "%CHOICE%"=="7" goto build_check
if "%CHOICE%"=="8" goto git_pull
if "%CHOICE%"=="9" exit /b
goto menu

:quick_push
cls
echo =======================================================================
echo  QUICK PUSH TO GITHUB (AWS DEPLOY)
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
timeout /t 5 >nul
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

:setup_scp
cls
echo =======================================================================
echo  CONFIRM AWS EC2 CONNECTION DETAILS
echo =======================================================================
echo  1. Key Path:  %PEM_KEY%
echo  2. Remote IP:  %REMOTE_IP%
echo  3. User:       %REMOTE_USER%
echo  4. Dest Dir:   %REMOTE_PATH%
echo =======================================================================
echo.
set /p CONFIRM="Are these details correct? (Y/N): "
if /i "%CONFIRM%" neq "Y" (
    echo.
    set /p PEM_KEY="Enter path to .pem file (e.g. C:\path\to\key.pem): "
    set /p REMOTE_IP="Enter Remote Server IP: "
    set /p REMOTE_USER="Enter SSH Username (e.g. ubuntu): "
    set /p REMOTE_PATH="Enter Destination Path (e.g. /home/ubuntu/LeptisGroupsWebsite): "
)
goto :eof

:push_db
call :setup_scp
cls
echo =======================================================================
echo  UPLOADING SQLITE DATABASE TO AWS
echo =======================================================================
echo.
if not exist "leptis-groups-main\backend\db.sqlite3" (
    echo [ERROR] db.sqlite3 not found locally at leptis-groups-main\backend\db.sqlite3
    pause
    goto menu
)
echo [+] File: leptis-groups-main/backend/db.sqlite3
echo [+] Destination: %REMOTE_USER%@%REMOTE_IP%:%REMOTE_PATH%/leptis-groups-main/backend/db.sqlite3
echo.
scp -i "%PEM_KEY%" "leptis-groups-main\backend\db.sqlite3" "%REMOTE_USER%@%REMOTE_IP%:%REMOTE_PATH%/leptis-groups-main/backend/db.sqlite3"
if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Database uploaded successfully!
) else (
    echo.
    echo [ERROR] Upload failed. Please verify SSH key and remote path permissions.
)
pause
goto menu

:push_media
call :setup_scp
cls
echo =======================================================================
echo  UPLOADING MEDIA FILES TO AWS
echo =======================================================================
echo.
if not exist "leptis-groups-main\backend\media" (
    echo [ERROR] Media folder not found locally.
    pause
    goto menu
)
echo [+] Folder: leptis-groups-main/backend/media
echo [+] Destination: %REMOTE_USER%@%REMOTE_IP%:%REMOTE_PATH%/leptis-groups-main/backend/media
echo.
scp -r -i "%PEM_KEY%" "leptis-groups-main\backend\media" "%REMOTE_USER%@%REMOTE_IP%:%REMOTE_PATH%/leptis-groups-main/backend/"
if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Media folder uploaded successfully!
) else (
    echo.
    echo [ERROR] Upload failed. Please verify SSH key and remote path permissions.
)
pause
goto menu

:push_full
call :setup_scp
cls
echo =======================================================================
echo  FULL FILE & DATA UPLOAD TO AWS (Git Push + SCP Database + SCP Media)
echo =======================================================================
echo.
echo [1/3] Staging and pushing code updates to GitHub...
:: Check if there are changes
set "CHANGES_EXIST="
for /f "delims=" %%i in ('git status --porcelain') do (
    set CHANGES_EXIST=1
)
if defined CHANGES_EXIST (
    git add .
    git commit -m "Auto-update: %date% %time%"
    git pull origin main --rebase
    git push origin main
    echo [+] Code pushed to GitHub successfully.
) else (
    echo [+] Code is already up to date on GitHub.
)

echo.
echo [2/3] Uploading database (db.sqlite3)...
scp -i "%PEM_KEY%" "leptis-groups-main\backend\db.sqlite3" "%REMOTE_USER%@%REMOTE_IP%:%REMOTE_PATH%/leptis-groups-main/backend/db.sqlite3"

echo.
echo [3/3] Uploading media uploads folder...
scp -r -i "%PEM_KEY%" "leptis-groups-main\backend\media" "%REMOTE_USER%@%REMOTE_IP%:%REMOTE_PATH%/leptis-groups-main/backend/"

echo.
echo =======================================================================
echo  FULL DEPLOYMENT COMPLETE
echo =======================================================================
pause
goto menu

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
