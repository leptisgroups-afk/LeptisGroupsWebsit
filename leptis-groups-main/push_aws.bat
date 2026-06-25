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
set "REMOTE_IP=16.171.11.162"
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
echo                 LEPTIS GROUP AWS AUTO-PUSH & DEPLOY UTILITY
echo =======================================================================
echo  Deploy and sync code and data files to AWS EC2 instance directly.
echo =======================================================================
echo.
echo  [1] Deploy Code to AWS (Create Tarball, SCP, Remote Build & Restart)
echo  [2] Push SQLite Database (db.sqlite3) to AWS via SCP
echo  [3] Push Media Uploads (media/) to AWS via SCP
echo  [4] Full Deployment to AWS (Deploy Code + Database + Media + Restart)
echo  [5] Push Code to GitHub (Stage, Commit, and Push)
echo  [6] Start GitHub Auto-Push Watcher (Continuous Local-to-GitHub sync)
echo  [7] Run Next.js Build Check (Local verification)
echo  [8] Check Git Status
echo  [9] Exit
echo.
echo =======================================================================
set /p CHOICE="Select an option (1-9): "

if "%CHOICE%"=="1" goto deploy_code
if "%CHOICE%"=="2" goto push_db
if "%CHOICE%"=="3" goto push_media
if "%CHOICE%"=="4" goto deploy_full
if "%CHOICE%"=="5" goto quick_push
if "%CHOICE%"=="6" goto start_watcher
if "%CHOICE%"=="7" goto build_check
if "%CHOICE%"=="8" goto git_status
if "%CHOICE%"=="9" exit /b
goto menu

:deploy_code
call :setup_scp
cls
echo =======================================================================
echo  DEPLOYING CODE TO AWS VIA SCP & TARBALL
echo =======================================================================
echo.
echo [1/4] Creating local deployment tarball...
if exist deploy.tar.gz del deploy.tar.gz

tar --exclude="leptis-groups-main/env" --exclude="leptis-groups-main/leptis-groups-main/node_modules" --exclude="leptis-groups-main/leptis-groups-main/.next" --exclude=".git" -czf deploy.tar.gz leptis-groups-main

if %errorlevel% neq 0 (
    echo [ERROR] Failed to create local tarball.
    pause
    goto menu
)

echo.
echo [2/4] Uploading tarball to AWS via SCP...
scp -i "%PEM_KEY%" deploy.tar.gz %REMOTE_USER%@%REMOTE_IP%:/home/%REMOTE_USER%/deploy.tar.gz
if %errorlevel% neq 0 (
    echo [ERROR] SCP upload failed.
    if exist deploy.tar.gz del deploy.tar.gz
    pause
    goto menu
)
if exist deploy.tar.gz del deploy.tar.gz

echo.
echo [3/4] Extracting tarball on remote AWS server...
ssh -i "%PEM_KEY%" %REMOTE_USER%@%REMOTE_IP% "cd %REMOTE_PATH% && tar -xzf /home/%REMOTE_USER%/deploy.tar.gz"
if %errorlevel% neq 0 (
    echo [ERROR] Extraction failed on remote server.
    pause
    goto menu
)

echo.
echo [4/4] Building Next.js and restarting backend/frontend services...
ssh -i "%PEM_KEY%" %REMOTE_USER%@%REMOTE_IP% "cd %REMOTE_PATH%/leptis-groups-main/leptis-groups-main && npm run build && pm2 restart nextjs-frontend && sudo systemctl restart django.service"
if %errorlevel% equ 0 (
    echo.
    echo =======================================================================
    echo [SUCCESS] Code deployed, built, and restarted successfully!
    echo =======================================================================
) else (
    echo.
    echo =======================================================================
    echo [ERROR] Remote build or restart failed.
    echo =======================================================================
)
pause
goto menu

:deploy_full
call :setup_scp
cls
echo =======================================================================
echo  FULL DEPLOYMENT TO AWS (Code + Database + Media + Restart)
echo =======================================================================
echo.
echo [1/5] Creating local deployment tarball...
if exist deploy.tar.gz del deploy.tar.gz

tar --exclude="leptis-groups-main/env" --exclude="leptis-groups-main/leptis-groups-main/node_modules" --exclude="leptis-groups-main/leptis-groups-main/.next" --exclude=".git" -czf deploy.tar.gz leptis-groups-main

if %errorlevel% neq 0 (
    echo [ERROR] Failed to create local tarball.
    pause
    goto menu
)

echo.
echo [2/5] Uploading tarball to AWS via SCP...
scp -i "%PEM_KEY%" deploy.tar.gz %REMOTE_USER%@%REMOTE_IP%:/home/%REMOTE_USER%/deploy.tar.gz
if %errorlevel% neq 0 (
    echo [ERROR] SCP upload failed.
    if exist deploy.tar.gz del deploy.tar.gz
    pause
    goto menu
)
if exist deploy.tar.gz del deploy.tar.gz

echo.
echo [3/5] Uploading database (db.sqlite3)...
if exist "leptis-groups-main\backend\db.sqlite3" (
    scp -i "%PEM_KEY%" "leptis-groups-main\backend\db.sqlite3" "%REMOTE_USER%@%REMOTE_IP%:%REMOTE_PATH%/leptis-groups-main/backend/db.sqlite3"
) else (
    echo [WARN] db.sqlite3 not found locally. Skipping database upload.
)

echo.
echo [4/5] Uploading media uploads folder...
if exist "leptis-groups-main\backend\media" (
    scp -r -i "%PEM_KEY%" "leptis-groups-main\backend\media" "%REMOTE_USER%@%REMOTE_IP%:%REMOTE_PATH%/leptis-groups-main/backend/"
) else (
    echo [WARN] Media folder not found locally. Skipping media upload.
)

echo.
echo [5/5] Extracting, building, and restarting remote services...
ssh -i "%PEM_KEY%" %REMOTE_USER%@%REMOTE_IP% "cd %REMOTE_PATH% && tar -xzf /home/%REMOTE_USER%/deploy.tar.gz && cd leptis-groups-main/leptis-groups-main && npm run build && pm2 restart nextjs-frontend && sudo systemctl restart django.service"
if %errorlevel% equ 0 (
    echo.
    echo =======================================================================
    echo [SUCCESS] Full deployment completed successfully!
    echo =======================================================================
) else (
    echo.
    echo =======================================================================
    echo [ERROR] Remote build or restart failed.
    echo =======================================================================
)
pause
goto menu

:quick_push
cls
echo =======================================================================
echo  PUSH CODE TO GITHUB
echo =======================================================================
echo.
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
echo [+] Pushing changes to GitHub...
git push origin main
if %errorlevel% equ 0 (
    echo.
    echo =======================================================================
    echo [SUCCESS] Changes pushed to GitHub successfully!
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
echo                 GITHUB AUTO-PUSH WATCHER STARTED
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
    echo [+] Pushing to GitHub...
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

