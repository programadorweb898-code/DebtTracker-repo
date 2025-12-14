@echo off
echo ===================================
echo Fixing SWC Dependencies Issue
echo ===================================
echo.

echo [1/4] Removing node_modules...
if exist node_modules rmdir /s /q node_modules

echo [2/4] Removing package-lock.json...
if exist package-lock.json del /f /q package-lock.json

echo [3/4] Cleaning npm cache...
call npm cache clean --force

echo [4/4] Installing dependencies...
call npm install

echo.
echo ===================================
echo Done! Now try: npm run build
echo ===================================
pause
