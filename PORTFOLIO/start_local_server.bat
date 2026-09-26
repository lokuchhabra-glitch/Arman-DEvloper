@echo on
title Arman's Portfolio & Excel Spreadsheet Backend
cls
echo ======================================================
echo   Arman.dev Portfolio & MS Excel Backend Server
echo ======================================================
echo.
echo Starting local backend server...
echo Every contact form submission will be automatically saved to:
echo "%~dp0backend\contact_submissions.csv"
echo.
echo Opening portfolio in your web browser...
start http://localhost:3000
node server.js
pause
