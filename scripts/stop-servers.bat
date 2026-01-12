@echo off
echo.
echo Stopping development servers...
echo.

:: Kill Node.js processes running on our ports
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do (
    echo Stopping backend (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3002" ^| findstr "LISTENING"') do (
    echo Stopping frontend (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Done!
echo.

timeout /t 2 >nul
