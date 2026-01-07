# PowerShell скрипт для создания бэкапа PostgreSQL базы данных
param(
    [string]$OutputDir = "backups"
)

# Цвета для вывода
$ErrorActionPreference = "Stop"

Write-Host "🔄 Начинаю создание бэкапа базы данных..." -ForegroundColor Cyan

# Проверяем наличие .env.local или .env файла
$envFile = if (Test-Path ".env.local") { ".env.local" } elseif (Test-Path ".env") { ".env" } else { $null }

if (-not $envFile) {
    Write-Host "❌ Файл .env.local или .env не найден!" -ForegroundColor Red
    exit 1
}

# Читаем DATABASE_URL из файла
Write-Host "📖 Читаю конфигурацию из $envFile..." -ForegroundColor Yellow
$envContent = Get-Content $envFile -Raw
$dbUrlMatch = [regex]::Match($envContent, 'DATABASE_URL=["\']?(.+?)["\']?\s*$', [System.Text.RegularExpressions.RegexOptions]::Multiline)

if (-not $dbUrlMatch.Success) {
    # Пробуем формат без кавычек
    $dbUrlMatch = [regex]::Match($envContent, '^DATABASE_URL=(.+)$', [System.Text.RegularExpressions.RegexOptions]::Multiline)
}

if (-not $dbUrlMatch.Success) {
    Write-Host "❌ DATABASE_URL не найден в $envFile" -ForegroundColor Red
    exit 1
}

$databaseUrl = $dbUrlMatch.Groups[1].Value.Trim()

Write-Host "✅ Найдена строка подключения" -ForegroundColor Green

# Парсим DATABASE_URL
# Формат: postgresql://user:password@host:port/database?params
try {
    $uri = [System.Uri]::new($databaseUrl)
    $userInfo = $uri.UserInfo -split ":"
    $username = $userInfo[0]
    $password = if ($userInfo.Length -gt 1) { $userInfo[1] } else { "" }
    $host = $uri.Host
    $port = if ($uri.Port -ne -1) { $uri.Port } else { 5432 }
    $database = $uri.LocalPath.TrimStart('/')
    
    Write-Host "📊 Параметры подключения:" -ForegroundColor Yellow
    Write-Host "   Host: $host" -ForegroundColor Gray
    Write-Host "   Port: $port" -ForegroundColor Gray
    Write-Host "   Database: $database" -ForegroundColor Gray
    Write-Host "   User: $username" -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка парсинга DATABASE_URL: $_" -ForegroundColor Red
    exit 1
}

# Проверяем наличие pg_dump
$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDump) {
    Write-Host "❌ pg_dump не найден в PATH. Убедитесь, что PostgreSQL установлен и добавлен в PATH." -ForegroundColor Red
    Write-Host "💡 Установите PostgreSQL или добавьте путь к pg_dump в переменную окружения PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ pg_dump найден: $($pgDump.Source)" -ForegroundColor Green

# Создаем директорию для бэкапов если её нет
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "📁 Создана директория: $OutputDir" -ForegroundColor Yellow
}

# Генерируем имя файла с временной меткой
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFileName = "backup_${database}_${timestamp}.sql"
$backupPath = Join-Path $OutputDir $backupFileName

Write-Host "💾 Создаю бэкап: $backupFileName" -ForegroundColor Cyan

# Устанавливаем переменную окружения для пароля
$env:PGPASSWORD = $password

try {
    # Выполняем pg_dump
    $pgDumpArgs = @(
        "--host=$host",
        "--port=$port",
        "--username=$username",
        "--dbname=$database",
        "--no-password",
        "--clean",
        "--if-exists",
        "--verbose",
        "--file=$backupPath"
    )
    
    & pg_dump $pgDumpArgs
    
    if ($LASTEXITCODE -eq 0) {
        $fileSize = (Get-Item $backupPath).Length / 1MB
        Write-Host "✅ Бэкап успешно создан!" -ForegroundColor Green
        Write-Host "📁 Путь: $backupPath" -ForegroundColor Cyan
        Write-Host "📦 Размер: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Ошибка при создании бэкапа (код выхода: $LASTEXITCODE)" -ForegroundColor Red
        if (Test-Path $backupPath) {
            Remove-Item $backupPath -Force
        }
        exit 1
    }
} catch {
    Write-Host "❌ Ошибка при выполнении pg_dump: $_" -ForegroundColor Red
    exit 1
} finally {
    # Очищаем пароль из переменной окружения
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "✨ Готово!" -ForegroundColor Green
