@echo off
:: Check for administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :admin_tasks
) else (
    echo =======================================================================
    echo    Requesting Administrator privileges to configure Windows Firewall...
    echo =======================================================================
    powershell -Command "Start-Process -FilePath '%0' -Verb RunAs"
    exit /b
)

:admin_tasks
cd /d "%~dp0"
title Leptis Group LAN Server Launcher
cls
echo =======================================================================
echo          LEPTIS GROUP WEBSITE - LOCAL NETWORK (LAN) LAUNCHER
echo =======================================================================
echo.

:: Get the local IP address using python
set "PYTHON_EXE=D:\LeptisGroup\LeptisGroupsWebsite\leptis-groups-main\env\Scripts\python.exe"
for /f "delims=" %%i in ('"%PYTHON_EXE%" -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect((''8.8.8.8'', 1)); print(s.getsockname()[0]); s.close()"') do set LOCAL_IP=%%i

if "%LOCAL_IP%"=="" (
    set LOCAL_IP=127.0.0.1
)

echo [+] Detected Local Network IP: %LOCAL_IP%
echo.

:: Configure firewall rules for incoming connections
echo [+] Configuring Windows Firewall rules for local network access...
netsh advfirewall firewall add rule name="Leptis Group Backend (Port 8001)" dir=in action=allow protocol=TCP localport=8001 profile=any >nul 2>&1
netsh advfirewall firewall add rule name="Leptis Group Frontend (Port 3000)" dir=in action=allow protocol=TCP localport=3000 profile=any >nul 2>&1
echo [OK] Firewall allowed for ports 3000 (Next.js) and 8001 (Django).
echo.

echo =======================================================================
echo   IMPORTANT DIRECTIONS FOR CONNECTING OTHER DEVICES (PHONES, TABLETS):
echo =======================================================================
echo   1. Make sure your phone is connected to the EXACT SAME Wi-Fi network.
echo   2. On your phone, open the browser and go to:
echo         Frontend Website: http://%LOCAL_IP%:3000
echo         Admin Dashboard:  http://%LOCAL_IP%:3000/admin
echo =======================================================================
echo.

echo Starting Servers...
echo.

:: Start Django Backend
echo [1/2] Starting Django backend on http://0.0.0.0:8001 ...
start "Django Backend Server" cmd /k "echo Starting Django Backend... & cd /d D:\LeptisGroup\LeptisGroupsWebsite\leptis-groups-main\backend & ..\env\Scripts\python.exe manage.py runserver 0.0.0.0:8001"

:: Wait 2 seconds for backend to start
timeout /t 2 >nul

:: Start Next.js Frontend
echo [2/2] Starting Next.js frontend on http://0.0.0.0:3000 ...
start "Next.js Frontend Server" cmd /k "echo Starting Next.js Frontend... & cd /d D:\LeptisGroup\LeptisGroupsWebsite\leptis-groups-main\leptis-groups-main & npm run dev"

echo.
echo =======================================================================
echo   SUCCESS: Both servers are running! Keep this window open.
echo   Press any key to close this launcher (servers will keep running).
echo =======================================================================
pause >nul
