# Simple script to test database connection via Prisma
Write-Host "Testing database connection via Prisma..." -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "[ERROR] .env.local file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Found .env.local" -ForegroundColor Green
Write-Host ""

# Try to connect via Prisma
Write-Host "Attempting connection..." -ForegroundColor Yellow

try {
    # Use Prisma to check connection
    $result = & npx prisma db pull --schema=./prisma/schema.prisma 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Connection successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Database is accessible and ready to use." -ForegroundColor Green
        exit 0
    } else {
        Write-Host "[ERROR] Connection failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error output:" -ForegroundColor Yellow
        $result | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        Write-Host ""
        
        if ($result -match "Can't reach database server") {
            Write-Host "[TIP] Database server is not accessible" -ForegroundColor Yellow
            Write-Host "  - Check if PostgreSQL server is running" -ForegroundColor Gray
            Write-Host "  - Check DATABASE_URL in .env.local" -ForegroundColor Gray
            Write-Host "  - Verify network/firewall settings" -ForegroundColor Gray
        } elseif ($result -match "password authentication failed") {
            Write-Host "[TIP] Authentication failed" -ForegroundColor Yellow
            Write-Host "  - Check username and password in DATABASE_URL" -ForegroundColor Gray
        } elseif ($result -match "database.*does not exist") {
            Write-Host "[TIP] Database does not exist" -ForegroundColor Yellow
            Write-Host "  - Run: npx prisma db push" -ForegroundColor Gray
        }
        
        exit 1
    }
} catch {
    Write-Host "[ERROR] Exception: $_" -ForegroundColor Red
    exit 1
}
