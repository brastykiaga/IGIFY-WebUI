@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing project dependencies...
  npm install
)
npm run dev
pause
