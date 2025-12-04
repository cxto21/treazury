#!/bin/bash
set -e

echo "🔧 Installing dependencies with npm..."
npm install --legacy-peer-deps

echo "🏗️  Building with Vite..."
npm run build:web

echo "✅ Build complete!"
