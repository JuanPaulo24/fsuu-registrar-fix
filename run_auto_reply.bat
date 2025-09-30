@echo off
title FSUU Auto-Reply System
color 0A

echo.
echo  ========================================
echo   FSUU Auto-Reply System
echo  ========================================
echo.
echo  📧 Monitoring: jburgers728@gmail.com
echo  ⏰ Check Interval: Every 2 minutes
echo  🚀 Auto-Reply: Enabled
echo.
echo  Press Ctrl+C to stop
echo  ========================================
echo.

:loop
echo [%date% %time%] Checking for new emails...
echo   ^> Dispatching email check job...    
php artisan emails:check --user-id=1

echo   ^> Processing queued jobs...
php artisan queue:work --once --timeout=30 --verbose

echo [%date% %time%] Waiting 2 minutes before next check...
echo.

timeout /t 120 /nobreak >nul
goto loop