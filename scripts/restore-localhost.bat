@echo off
echo.
echo ============================================
echo  Hood Family Farms - Restore Localhost Only
echo ============================================
echo.

set "BACKEND_DIR=%~dp0..\backend"
set "FRONTEND_DIR=%~dp0..\website_ecommerce"
set "BACKEND_ENV=%BACKEND_DIR%\.env"
set "FRONTEND_ENV=%FRONTEND_DIR%\.env"

:: Restore from backups if they exist
if exist "%BACKEND_ENV%.backup" (
    copy /y "%BACKEND_ENV%.backup" "%BACKEND_ENV%" >nul
    echo Backend .env restored from backup
) else (
    echo No backend backup found
)

if exist "%FRONTEND_ENV%.backup" (
    copy /y "%FRONTEND_ENV%.backup" "%FRONTEND_ENV%" >nul
    echo Frontend .env restored from backup
) else (
    echo No frontend backup found
)

:: Clean up
if exist "%~dp0current-ip.txt" del "%~dp0current-ip.txt"

echo.
echo Done! Restart the servers to apply changes.
echo.

pause
