@echo off
REM ============================================
REM ARCADE - Windows Installer
REM ============================================

echo.
echo ========================================
echo  ARCADE Game Collection Installer
echo ========================================
echo.

REM Check if Python is installed
echo [1/4] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Python is not installed or not in PATH!
    echo.
    echo Attempting to download and install Python automatically...
    echo.
    
    REM Download Python installer
    powershell -Command "& {Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe' -OutFile 'python_installer.exe'}"
    
    if exist python_installer.exe (
        echo Installing Python... Please wait...
        start /wait python_installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
        del python_installer.exe
        
        echo.
        echo Python installation complete. Please restart this script.
        echo.
        pause
        exit /b 0
    ) else (
        echo.
        echo [ERROR] Could not download Python installer!
        echo Please manually install Python from: https://www.python.org/downloads/
        echo Make sure to check "Add Python to PATH" during installation.
        echo.
        pause
        exit /b 1
    )
)

echo [OK] Python is installed
python --version
echo.

REM Check Python version
echo [2/4] Verifying Python version...
python -c "import sys; exit(0 if sys.version_info >= (3, 7) else 1)" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Python 3.7 or higher is required!
    echo Current version is too old. Attempting to upgrade...
    echo.
    
    REM Download latest Python
    powershell -Command "& {Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe' -OutFile 'python_installer.exe'}"
    
    if exist python_installer.exe (
        echo Installing latest Python... Please wait...
        start /wait python_installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
        del python_installer.exe
        
        echo.
        echo Python upgrade complete. Please restart this script.
        echo.
        pause
        exit /b 0
    ) else (
        echo.
        echo [ERROR] Could not download Python installer!
        echo Please manually upgrade Python from: https://www.python.org/downloads/
        echo.
        pause
        exit /b 1
    )
)

echo [OK] Python version is compatible
echo.

REM Verify required modules
echo [3/4] Verifying required modules...
python -c "import http.server, socketserver, webbrowser, threading, os" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Required Python modules are missing!
    echo This should not happen with standard Python installation.
    echo Attempting to repair Python installation...
    echo.
    
    python -m ensurepip --default-pip >nul 2>&1
    python -m pip install --upgrade pip >nul 2>&1
    
    echo.
    echo Please restart this script after repair.
    echo.
    pause
    exit /b 1
)

echo [OK] All required modules are available
echo.

REM Create desktop shortcut
echo [4/4] Creating desktop shortcut...
set SCRIPT_DIR=%~dp0
set DESKTOP=%USERPROFILE%\Desktop

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\ARCADE Games.lnk'); $Shortcut.TargetPath = 'python'; $Shortcut.Arguments = '\"%SCRIPT_DIR%launch_game.py\"'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.IconLocation = 'shell32.dll,14'; $Shortcut.Description = 'Launch ARCADE Game Collection'; $Shortcut.Save()"

if exist "%DESKTOP%\ARCADE Games.lnk" (
    echo [OK] Desktop shortcut created
) else (
    echo [WARNING] Could not create desktop shortcut
)
echo.

echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo All requirements are satisfied.
echo.
echo You can now run ARCADE by:
echo   1. Double-clicking "ARCADE Games" shortcut on desktop
echo   2. Double-clicking "launch_game.py" in this folder
echo   3. Or running: python launch_game.py
echo.
echo The server will start on http://localhost:8001
echo and automatically open in your browser.
echo.
echo Press any key to launch ARCADE now...
pause >nul

REM Launch the game
python launch_game.py