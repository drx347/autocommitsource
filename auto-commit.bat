@echo off
setlocal

cd /d "%~dp0"

title Auto Commit Bot by @exotickic
color 0A
mode con: cols=72 lines=32

echo ============================================================
echo =                                                          =
echo =                    AUTO COMMIT BOT                       =
echo =                                                          =
echo =   Author : @exotickic                                    =
echo =   GitHub : drx347                                        =
echo =   Mode   : GitHub Commit Injector                        =
echo =                                                          =
echo ============================================================
echo =   Initializing local access node...                      =
echo ============================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto-commit.ps1"

echo.
echo ============================================================
echo Session finished. Press any key to close...
echo ============================================================
pause >nul
