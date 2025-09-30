# FSUU Auto-Reply System
# Run this script to start auto-reply monitoring without browser

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " FSUU Auto-Reply System" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📧 Monitoring: jburgers728@gmail.com" -ForegroundColor Yellow
Write-Host "⏰ Check Interval: Every 2 minutes" -ForegroundColor Yellow
Write-Host "🚀 Auto-Reply: Enabled" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check configuration first
Write-Host "🔍 Checking system status..." -ForegroundColor Cyan
php artisan auto-reply:status
Write-Host ""

$count = 0
while ($true) {
    $count++
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "[$timestamp] Check #$count - Checking for new emails..." -ForegroundColor White
    
    try {
        # Dispatch email check job
        Write-Host "  📧 Dispatching email check job..." -ForegroundColor Cyan
        php artisan emails:check --user-id=1
        
        # Process any queued jobs
        Write-Host "  ⚙️  Processing queued jobs..." -ForegroundColor Cyan
        php artisan queue:work --once --timeout=30
        
        Write-Host "[$timestamp] ✅ Check completed" -ForegroundColor Green
        
    } catch {
        Write-Host "[$timestamp] ❌ Error: $_" -ForegroundColor Red
    }
    
    Write-Host "[$timestamp] 💤 Waiting 2 minutes before next check..." -ForegroundColor Gray
    Write-Host ""
    
    # Wait 2 minutes (120 seconds)
    Start-Sleep -Seconds 120
}