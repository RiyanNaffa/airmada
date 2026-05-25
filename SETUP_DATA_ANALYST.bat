@echo off
REM Quick Start Guide for aiRMADA Data Analyst AI (Windows)
REM This script helps setup and test the feature

setlocal enabledelayedexpansion

echo.
echo 🚀 aiRMADA Data Analyst AI - Quick Start (Windows)
echo ===================================================
echo.

REM Check if in correct directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run from project root.
    exit /b 1
)

REM Step 1: Check environment setup
echo 📋 Step 1: Checking environment...
echo.

if not exist "apps\web\.env.local" (
    echo ⚠️  apps\web\.env.local not found
    echo.
    echo To setup OpenRouter:
    echo.
    echo 1. Get FREE API key from https://openrouter.ai/
    echo 2. Create apps\web\.env.local file
    echo 3. Add this line:
    echo.
    echo    OPENROUTER_API_KEY=your_api_key_here
    echo.
    echo 4. Save file and re-run this script
    echo.
    exit /b 1
) else (
    findstr /M "OPENROUTER_API_KEY" "apps\web\.env.local" >nul
    if errorlevel 1 (
        echo ❌ OPENROUTER_API_KEY not found in .env.local
        exit /b 1
    ) else (
        echo ✅ OPENROUTER_API_KEY configured
    )
)

echo.
echo 📦 Step 2: Installing dependencies...
if not exist "node_modules" (
    call npm install
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🎯 Step 3: Building project...
call npm run build

echo.
echo ✨ Setup complete!
echo.
echo Next steps:
echo 1. Start dev server: npm run dev
echo 2. Open: http://localhost:3000/ai-chat
echo 3. Upload: SAMPLE_FLEET_DATA.csv
echo 4. Chat with AI for insights!
echo.
echo Sample questions to ask:
echo - Kendaraan mana yang perlu maintenance?
echo - Berapa rata-rata konsumsi BBM?
echo - Mana kendaraan paling efisien?
echo - Apa rekomendasi optimasi armada?
echo.

pause
