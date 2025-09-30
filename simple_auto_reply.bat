@echo off
title FSUU Auto-Reply - Simple Version
echo.
echo FSUU Auto-Reply System - Simple Version
echo ======================================
echo This will run ONE email check cycle
echo.

echo 1. Clearing cache to detect new emails...
php artisan cache:clear

echo.
echo 2. Checking for new emails...
php artisan emails:check --user-id=1

echo.
echo 3. Processing auto-reply jobs...
php artisan queue:work --once --verbose --timeout=60

echo.
echo ======================================
echo Auto-reply cycle completed!
echo.
echo To run continuously, use: run_auto_reply.bat
echo Or run this script again for another check
echo.
pause