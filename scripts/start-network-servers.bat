@echo off
echo.
echo ============================================
echo  Hood Family Farms - Starting Servers
echo ============================================
echo.

:: Check for IP file
set "IP_FILE=%~dp0current-ip.txt"
if exist "%IP_FILE%" (
    set /p IP=<"%IP_FILE%"
    echo Local IP: %IP%
    echo.
    echo Access from other devices:
    echo   http://%IP%:3002
    echo.
) else (
    echo Run setup-network-access.bat first to configure network access.
    echo.
)

:: Define paths
set "BACKEND_DIR=%~dp0..\backend"
set "FRONTEND_DIR=%~dp0..\website_ecommerce"

echo Starting backend server...
start "HFF Backend" cmd /k "cd /d %BACKEND_DIR% && npm run dev"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "HFF Frontend" cmd /k "cd /d %FRONTEND_DIR% && npm start"

echo.
echo ============================================
echo  Servers starting in separate windows
echo ============================================
echo.
echo  Backend:  http://localhost:3001
echo  Frontend: http://localhost:3002
echo.
if defined IP (
    echo  Network:  http://%IP%:3002
    echo.
)
echo  Close this window when done.
echo  Close the server windows to stop them.
echo.

pause
