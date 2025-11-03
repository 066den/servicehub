# PowerShell script for checking PostgreSQL database connection
$ErrorActionPreference = "Continue"

Write-Host "Checking database connection..." -ForegroundColor Cyan
Write-Host ""

# Check for .env.local or .env file
$envFile = if (Test-Path ".env.local") { ".env.local" } elseif (Test-Path ".env") { ".env" } else { $null }

if (-not $envFile) {
    Write-Host "[ERROR] File .env.local or .env not found!" -ForegroundColor Red
    Write-Host "[TIP] Create .env.local file and add DATABASE_URL line" -ForegroundColor Yellow
    Write-Host "     Example: DATABASE_URL=postgresql://user:password@localhost:5432/dbname" -ForegroundColor Gray
    exit 1
}

Write-Host "[OK] Found file: $envFile" -ForegroundColor Green

# Read DATABASE_URL from file
$envContent = Get-Content $envFile -Raw

# Try different DATABASE_URL formats
$databaseUrl = $null

# Format with single quotes
if ($envContent -match "DATABASE_URL='([^']+)'") {
    $databaseUrl = $matches[1]
}

# Format with double quotes
if (-not $databaseUrl -and $envContent -match 'DATABASE_URL="([^"]+)"') {
    $databaseUrl = $matches[1]
}

# Format without quotes (on separate line)
if (-not $databaseUrl -and $envContent -match '(?m)^DATABASE_URL\s*=\s*(.+)$') {
    $databaseUrl = $matches[1].Trim()
}

if (-not $databaseUrl) {
    Write-Host "[ERROR] DATABASE_URL not found in $envFile" -ForegroundColor Red
    Write-Host "[TIP] Add DATABASE_URL line to $envFile" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Found connection string" -ForegroundColor Green
Write-Host ""

# Parse DATABASE_URL
$parsed = $false
try {
    # Try to parse as URI
    if ($databaseUrl -match '^postgresql?://') {
        $uri = [System.Uri]::new($databaseUrl)
        
        $userInfo = $uri.UserInfo
        if ($userInfo) {
            $userParts = $userInfo -split ':', 2
            $username = $userParts[0]
            $password = if ($userParts.Length -gt 1) { $userParts[1] } else { "" }
        } else {
            $username = ""
            $password = ""
        }
        
        $host = $uri.Host
        $port = if ($uri.Port -ne -1) { $uri.Port } else { 5432 }
        $database = $uri.LocalPath.TrimStart('/') -replace '\?.*$', ''
        
        $parsed = $true
    } else {
        # Try manual parsing for postgres://user:pass@host:port/db format
        if ($databaseUrl -match '^postgres://(.+)$') {
            $urlPart = $matches[1]
            $parts = $urlPart -split '@'
            
            if ($parts.Length -eq 2) {
                $credentials = $parts[0]
                $hostDb = $parts[1]
                
                $credParts = $credentials -split ':', 2
                $username = $credParts[0]
                $password = if ($credParts.Length -gt 1) { $credParts[1] } else { "" }
                
                if ($hostDb -match '^([^:]+):(\d+)/(.+)$') {
                    $host = $matches[1]
                    $port = [int]$matches[2]
                    $database = $matches[3] -replace '\?.*$', ''
                    $parsed = $true
                } elseif ($hostDb -match '^([^/]+)/(.+)$') {
                    $host = $matches[1]
                    $port = 5432
                    $database = $matches[2] -replace '\?.*$', ''
                    $parsed = $true
                }
            }
        }
    }
    
    if (-not $parsed) {
        Write-Host "[ERROR] Could not parse DATABASE_URL" -ForegroundColor Red
        Write-Host "Connection string preview (first 50 chars): $($databaseUrl.Substring(0, [Math]::Min(50, $databaseUrl.Length)))..." -ForegroundColor Gray
        Write-Host "[TIP] Expected format: postgresql://user:password@host:port/database" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Connection parameters:" -ForegroundColor Yellow
    Write-Host "   Host: $host" -ForegroundColor Gray
    Write-Host "   Port: $port" -ForegroundColor Gray
    Write-Host "   Database: $database" -ForegroundColor Gray
    Write-Host "   User: $username" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "[ERROR] Error parsing DATABASE_URL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "[TIP] Check connection string format in $envFile" -ForegroundColor Yellow
    Write-Host "Expected format: postgresql://user:password@host:port/database" -ForegroundColor Gray
    exit 1
}

# Check 1: Check port availability
Write-Host "[1] Checking port $port availability on $host..." -ForegroundColor Cyan
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connect = $tcpClient.BeginConnect($host, $port, $null, $null)
    $wait = $connect.AsyncWaitHandle.WaitOne(3000, $false)
    
    if ($wait) {
        $tcpClient.EndConnect($connect)
        Write-Host "   [OK] Port $port is available" -ForegroundColor Green
        $tcpClient.Close()
    } else {
        Write-Host "   [ERROR] Port $port is not available (timeout)" -ForegroundColor Red
        Write-Host "   [TIP] Make sure PostgreSQL server is running" -ForegroundColor Yellow
        if ($host -eq "localhost" -or $host -eq "127.0.0.1") {
            Write-Host "   [TIP] Check if PostgreSQL service is running on this computer" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   [ERROR] Failed to connect to port $port" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Gray
}

# Check 2: Check for psql
Write-Host ""
Write-Host "[2] Checking PostgreSQL client..." -ForegroundColor Cyan
$psql = Get-Command psql -ErrorAction SilentlyContinue
if ($psql) {
    Write-Host "   [OK] psql found: $($psql.Source)" -ForegroundColor Green
} else {
    Write-Host "   [WARN] psql not found in PATH" -ForegroundColor Yellow
    Write-Host "   [TIP] Install PostgreSQL or add psql to PATH" -ForegroundColor Yellow
}

# Check 3: Try to connect via psql
if ($psql) {
    Write-Host ""
    Write-Host "[3] Attempting database connection..." -ForegroundColor Cyan
    
    $env:PGPASSWORD = $password
    
    try {
        $query = "SELECT version();"
        $result = & psql -h $host -p $port -U $username -d $database -c $query -t 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   [OK] Connection successful!" -ForegroundColor Green
            Write-Host "   PostgreSQL version:" -ForegroundColor Gray
            $result | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        } else {
            Write-Host "   [ERROR] Database connection error" -ForegroundColor Red
            Write-Host "   Error:" -ForegroundColor Gray
            $result | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
            
            if ($result -match "password authentication failed") {
                Write-Host ""
                Write-Host "   [TIP] Incorrect password or user" -ForegroundColor Yellow
            } elseif ($result -match "database.*does not exist") {
                Write-Host ""
                Write-Host "   [TIP] Database '$database' does not exist" -ForegroundColor Yellow
                Write-Host "   [TIP] Run: npx prisma db push" -ForegroundColor Yellow
            } elseif ($result -match "connection.*refused") {
                Write-Host ""
                Write-Host "   [TIP] PostgreSQL server is not running or not accessible" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "   [ERROR] Error executing connection: $_" -ForegroundColor Red
    } finally {
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
} else {
    Write-Host ""
    Write-Host "[3] Skipped (psql not found)" -ForegroundColor Yellow
}

# Check 4: Check Prisma
Write-Host ""
Write-Host "[4] Checking Prisma..." -ForegroundColor Cyan
$npx = Get-Command npx -ErrorAction SilentlyContinue
if ($npx) {
    Write-Host "   [OK] npx found" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "[5] Attempting Prisma connection..." -ForegroundColor Cyan
    try {
        # Simple check via prisma db pull
        $prismaResult = & npx prisma db pull --schema=./prisma/schema.prisma 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   [OK] Prisma can connect to database" -ForegroundColor Green
        } else {
            Write-Host "   [WARN] Could not verify via Prisma" -ForegroundColor Yellow
            $prismaResult | Select-Object -First 5 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        }
    } catch {
        Write-Host "   [WARN] Error checking Prisma: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [WARN] npx not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Check completed" -ForegroundColor Cyan
Write-Host ""
Write-Host "[TIP] If connection does not work:" -ForegroundColor Yellow
Write-Host "   1. Make sure PostgreSQL server is running" -ForegroundColor Gray
Write-Host "   2. Check DATABASE_URL correctness in $envFile" -ForegroundColor Gray
Write-Host "   3. Make sure database exists (run: npx prisma db push)" -ForegroundColor Gray
Write-Host "   4. Check firewall settings" -ForegroundColor Gray