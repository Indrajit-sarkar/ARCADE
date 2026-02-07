#!/bin/bash
# ============================================
# ARCADE - macOS Installer
# ============================================

echo ""
echo "========================================"
echo " ARCADE Game Collection Installer"
echo "========================================"
echo ""

# Check if Python 3 is installed
echo "[1/4] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo ""
    echo "[WARNING] Python 3 is not installed!"
    echo ""
    echo "Attempting to install Python automatically..."
    
    # Check if Homebrew is installed
    if command -v brew &> /dev/null; then
        echo "Installing Python via Homebrew..."
        brew install python3
        
        if [ $? -eq 0 ]; then
            echo "[OK] Python 3 installed successfully"
        else
            echo "[ERROR] Failed to install Python via Homebrew"
            echo "Please manually install from: https://www.python.org/downloads/"
            exit 1
        fi
    else
        echo "Homebrew not found. Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        if [ $? -eq 0 ]; then
            echo "Installing Python via Homebrew..."
            brew install python3
            
            if [ $? -eq 0 ]; then
                echo "[OK] Python 3 installed successfully"
            else
                echo "[ERROR] Failed to install Python"
                echo "Please manually install from: https://www.python.org/downloads/"
                exit 1
            fi
        else
            echo "[ERROR] Failed to install Homebrew"
            echo "Please manually install Python from: https://www.python.org/downloads/"
            exit 1
        fi
    fi
else
    echo "[OK] Python 3 is installed"
    python3 --version
fi
echo ""

# Check Python version
echo "[2/4] Verifying Python version..."
python3 -c "import sys; exit(0 if sys.version_info >= (3, 7) else 1)" 2>/dev/null
if [ $? -ne 0 ]; then
    echo ""
    echo "[WARNING] Python 3.7 or higher is required!"
    echo "Attempting to upgrade Python..."
    
    if command -v brew &> /dev/null; then
        brew upgrade python3
        
        if [ $? -eq 0 ]; then
            echo "[OK] Python upgraded successfully"
        else
            echo "[ERROR] Failed to upgrade Python"
            echo "Please manually upgrade from: https://www.python.org/downloads/"
            exit 1
        fi
    else
        echo "[ERROR] Cannot upgrade automatically without Homebrew"
        echo "Please manually upgrade from: https://www.python.org/downloads/"
        exit 1
    fi
else
    echo "[OK] Python version is compatible"
fi
echo ""

# Verify required modules
echo "[3/4] Verifying required modules..."
python3 -c "import http.server, socketserver, webbrowser, threading, os" 2>/dev/null
if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Required Python modules are missing!"
    echo "Attempting to repair Python installation..."
    
    python3 -m ensurepip --default-pip 2>/dev/null
    python3 -m pip install --upgrade pip 2>/dev/null
    
    echo ""
    echo "Please restart this script after repair."
    exit 1
else
    echo "[OK] All required modules are available"
fi
echo ""

# Create application launcher
echo "[4/4] Creating application launcher..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create .command file for easy launching
cat > "$SCRIPT_DIR/Launch ARCADE.command" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
python3 launch_game.py
EOF

chmod +x "$SCRIPT_DIR/Launch ARCADE.command"

if [ -f "$SCRIPT_DIR/Launch ARCADE.command" ]; then
    echo "[OK] Application launcher created"
else
    echo "[WARNING] Could not create launcher"
fi
echo ""

echo "========================================"
echo " Installation Complete!"
echo "========================================"
echo ""
echo "All requirements are satisfied."
echo ""
echo "You can now run ARCADE by:"
echo "  1. Double-clicking 'Launch ARCADE.command'"
echo "  2. Or running: python3 launch_game.py"
echo ""
echo "The server will start on http://localhost:8001"
echo "and automatically open in your browser."
echo ""
read -p "Press Enter to launch ARCADE now..."

# Launch the game
python3 launch_game.py