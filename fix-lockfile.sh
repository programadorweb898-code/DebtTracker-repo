#!/bin/bash
echo "==================================="
echo "Fixing SWC Dependencies Issue"
echo "==================================="
echo ""

echo "[1/4] Removing node_modules..."
rm -rf node_modules

echo "[2/4] Removing package-lock.json..."
rm -f package-lock.json

echo "[3/4] Cleaning npm cache..."
npm cache clean --force

echo "[4/4] Installing dependencies..."
npm install

echo ""
echo "==================================="
echo "Done! Now try: npm run build"
echo "==================================="
