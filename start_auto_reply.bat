@echo off
echo Starting FSUU Auto-Reply System
echo ================================
echo.
echo This will start both the Laravel Scheduler and Queue Worker
echo Press Ctrl+C to stop both processes
echo.

:: Start Laravel Scheduler in background
echo [1/2] Starting Laravel Scheduler...
start /min "Laravel Scheduler" cmd /c "php artisan schedule:work"

:: Wait a moment for scheduler to start
timeout /t 2 /nobreak >nul

:: Start Queue Worker in foreground (so we can see the output)
echo [2/2] Starting Queue Worker...
echo.
echo 🤖 Auto-Reply System is now running!
echo 📧 Monitoring emails to: jburgers728@gmail.com
echo 🔄 Checking for new emails every 2 minutes
echo 📤 Processing auto-replies automatically
echo.
echo Queue Worker Output:
echo ====================
php artisan queue:work --daemon --timeout=60 --memory=512

:: If queue worker stops, also stop the scheduler
echo.
echo Stopping Laravel Scheduler...
taskkill /FI "WindowTitle eq Laravel Scheduler*" /T /F >nul 2>&1
echo Auto-Reply System stopped.
pause