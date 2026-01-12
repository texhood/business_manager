@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================
echo  Hood Family Farms - Network Access Setup
echo ============================================
echo.

:: Get the local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "IP=%%a"
    set "IP=!IP:~1!"
    goto :found_ip
)

:found_ip
if "%IP%"=="" (
    echo ERROR: Could not detect local IP address.
    echo Please run 'ipconfig' manually and update the .env files.
    pause
    exit /b 1
)

echo Detected local IP: %IP%
echo.

:: Define paths
set "BACKEND_DIR=%~dp0..\backend"
set "FRONTEND_DIR=%~dp0..\website_ecommerce"
set "BACKEND_ENV=%BACKEND_DIR%\.env"
set "FRONTEND_ENV=%FRONTEND_DIR%\.env"

:: Backup existing .env files
echo Creating backups of .env files...
if exist "%BACKEND_ENV%" copy "%BACKEND_ENV%" "%BACKEND_ENV%.backup" >nul
if exist "%FRONTEND_ENV%" copy "%FRONTEND_ENV%" "%FRONTEND_ENV%.backup" >nul
echo    Backups saved as .env.backup
echo.

:: Update Backend CORS
echo Updating backend CORS settings...

if exist "%BACKEND_ENV%" (
    :: Create temp file with updated CORS
    type nul > "%BACKEND_ENV%.tmp"
    set "CORS_FOUND=0"
    
    for /f "usebackq delims=" %%a in ("%BACKEND_ENV%") do (
        set "line=%%a"
        echo !line! | findstr /b /c:"CORS_ORIGIN=" >nul
        if !errorlevel!==0 (
            echo CORS_ORIGIN=http://localhost:3002,http://%IP%:3002>> "%BACKEND_ENV%.tmp"
            set "CORS_FOUND=1"
        ) else (
            echo !line!>> "%BACKEND_ENV%.tmp"
        )
    )
    
    if "!CORS_FOUND!"=="0" (
        echo CORS_ORIGIN=http://localhost:3002,http://%IP%:3002>> "%BACKEND_ENV%.tmp"
    )
    
    move /y "%BACKEND_ENV%.tmp" "%BACKEND_ENV%" >nul
    echo    Backend CORS updated to allow http://%IP%:3002
) else (
    echo    WARNING: Backend .env not found at %BACKEND_ENV%
)

:: Update Frontend .env
echo.
echo Updating frontend settings...

if exist "%FRONTEND_ENV%" (
    :: Create temp file
    type nul > "%FRONTEND_ENV%.tmp"
    set "API_FOUND=0"
    set "HOST_FOUND=0"
    
    for /f "usebackq delims=" %%a in ("%FRONTEND_ENV%") do (
        set "line=%%a"
        
        echo !line! | findstr /b /c:"REACT_APP_API_URL=" >nul
        if !errorlevel!==0 (
            echo REACT_APP_API_URL=http://%IP%:3001/api/v1>> "%FRONTEND_ENV%.tmp"
            set "API_FOUND=1"
        ) else (
            echo !line! | findstr /b /c:"HOST=" >nul
            if !errorlevel!==0 (
                echo HOST=0.0.0.0>> "%FRONTEND_ENV%.tmp"
                set "HOST_FOUND=1"
            ) else (
                echo !line!>> "%FRONTEND_ENV%.tmp"
            )
        )
    )
    
    if "!API_FOUND!"=="0" (
        echo REACT_APP_API_URL=http://%IP%:3001/api/v1>> "%FRONTEND_ENV%.tmp"
    )
    if "!HOST_FOUND!"=="0" (
        echo HOST=0.0.0.0>> "%FRONTEND_ENV%.tmp"
    )
    
    move /y "%FRONTEND_ENV%.tmp" "%FRONTEND_ENV%" >nul
) else (
    :: Create new .env file
    echo REACT_APP_API_URL=http://%IP%:3001/api/v1> "%FRONTEND_ENV%"
    echo HOST=0.0.0.0>> "%FRONTEND_ENV%"
)
echo    Frontend API URL: http://%IP%:3001/api/v1
echo    Frontend HOST: 0.0.0.0

:: Check/Add Firewall Rules
echo.
echo Checking Windows Firewall rules...

netsh advfirewall firewall show rule name="HFF Dev Server - Backend" >nul 2>&1
if errorlevel 1 (
    echo    Adding firewall rule for backend (port 3001)...
    netsh advfirewall firewall add rule name="HFF Dev Server - Backend" dir=in action=allow protocol=tcp localport=3001 >nul 2>&1
    if errorlevel 1 (
        echo    WARNING: Run as Administrator to add firewall rules
    ) else (
        echo    Added firewall rule for port 3001
    )
) else (
    echo    Firewall rule for backend already exists
)

netsh advfirewall firewall show rule name="HFF Dev Server - Frontend" >nul 2>&1
if errorlevel 1 (
    echo    Adding firewall rule for frontend (port 3002)...
    netsh advfirewall firewall add rule name="HFF Dev Server - Frontend" dir=in action=allow protocol=tcp localport=3002 >nul 2>&1
    if errorlevel 1 (
        echo    WARNING: Run as Administrator to add firewall rules
    ) else (
        echo    Added firewall rule for port 3002
    )
) else (
    echo    Firewall rule for frontend already exists
)

:: Save IP to a file for other scripts
echo %IP%> "%~dp0current-ip.txt"

:: Summary
echo.
echo ============================================
echo  Setup Complete!
echo ============================================
echo.
echo  Your local IP: %IP%
echo.
echo  Access URLs from other devices:
echo    Website:  http://%IP%:3002
echo    API:      http://%IP%:3001/api/v1
echo.
echo  Next steps:
echo    1. Restart the backend:  cd backend ^&^& npm run dev
echo    2. Restart the frontend: cd website_ecommerce ^&^& npm start
echo.
echo  Or run: start-network-servers.bat
echo.
echo ============================================
echo.

pause
