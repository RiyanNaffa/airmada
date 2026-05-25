#!/bin/bash

# Quick Start Guide for aiRMADA Data Analyst AI
# This script helps setup and test the feature

set -e

echo "🚀 aiRMADA Data Analyst AI - Quick Start"
echo "========================================="
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Step 1: Check environment setup
echo "📋 Step 1: Checking environment..."

if [ ! -f "apps/web/.env.local" ]; then
    echo "⚠️  apps/web/.env.local not found"
    echo ""
    echo "To setup OpenRouter:"
    echo ""
    echo "1. Get FREE API key from https://openrouter.ai/"
    echo "2. Create apps/web/.env.local:"
    echo ""
    echo "   OPENROUTER_API_KEY=your_api_key_here"
    echo ""
    echo "3. Re-run this script"
    exit 1
else
    if grep -q "OPENROUTER_API_KEY" apps/web/.env.local; then
        echo "✅ OPENROUTER_API_KEY configured"
    else
        echo "❌ OPENROUTER_API_KEY not found in .env.local"
        exit 1
    fi
fi

echo ""
echo "📦 Step 2: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎯 Step 3: Building project..."
npm run build

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Open: http://localhost:3000/ai-chat"
echo "3. Upload: SAMPLE_FLEET_DATA.csv"
echo "4. Chat with AI for insights!"
echo ""
echo "Sample questions to ask:"
echo "- Kendaraan mana yang perlu maintenance?"
echo "- Berapa rata-rata konsumsi BBM?"
echo "- Mana kendaraan paling efisien?"
echo "- Apa rekomendasi optimasi armada?"
echo ""
