#!/bin/bash
# ============================================
# ARCADE - Linux Installer
# ============================================

echo ""
echo "========================================"
echo " ARCADE Game Collection Installer"
echo "========================================"
echo ""

# Detect Linux distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    OS="unknown"
fi

echo "Detected OS: $OS"
echo ""

# Check if Python 3 is installed
echo "[1/4] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo ""
    echo "[WARNING] Python 3 is not installed!"
    echo "Attempting to install Python automatically..."
    echo ""
    
    case $OS in
        ubuntu|debian|linuxmint)
            echo "Installing Python for Ubuntu/Debian..."
            sudo apt-get update
            sudo apt-get install -y python3 python3-pip
            ;;
        fedora|rhel|centos)
            echo "Installing Python for Fedora/RHEL..."
            sudo dnf install -y python3 python3-pip
            ;;
        arch|manjaro)
            echo "Installing Python for Arch..."
            sudo pacman -S --noconfirm python python-pip
            ;;
        opensuse*)
            echo "Installing Python for openSUSE..."
            sudo zypper install -y python3 python3-pip
            ;;
        *)
            echo "[ERROR] Unsupported distribution: $OS"
            echo "Please manually install Python 3 from your package manager"
            echo "Or download from: https://www.python.org/downloads/"
            exit 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        echo "[OK] Python 3 installed successfully"
    else
        echo "[ERROR] Failed to install Python"
        echo "Please manually install Python 3 using your package manager"
        exit 1
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
    echo ""
    
    case $OS in
        ubuntu|debian|linuxmint)
            sudo apt-get update
            sudo apt-get upgrade -y python3
            ;;
        fedora|rhel|centos)
            sudo dnf upgrade -y python3
            ;;
        arch|manjaro)
            sudo pacman -Syu --noconfirm python
            ;;
        opensuse*)
            sudo zypper update -y python3
            ;;
        *)
            echo "[ERROR] Cannot upgrade automatically"
            echo "Please manually upgrade Python 3"
            exit 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        echo "[OK] Python upgraded successfully"
    else
        echo "[ERROR] Failed to upgrade Python"
        echo "Please manually upgrade Python 3"
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

# Create desktop launcher
echo "[4/4] Creating desktop launcher..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create .desktop file
mkdir -p ~/.local/share/applications

cat > ~/.local/share/applications/arcade-games.desktop << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=ARCADE Games
Comment=Launch ARCADE Game Collection
Exec=python3 "$SCRIPT_DIR/launch_game.py"
Path=$SCRIPT_DIR
Icon=applications-games
Terminal=false
Categories=Game;
EOF

# Create shell script launcher
cat > "$SCRIPT_DIR/launch_arcade.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
python3 launch_game.py
EOF

chmod +x "$SCRIPT_DIR/launch_arcade.sh"

if [ -f ~/.local/share/applications/arcade-games.desktop ]; then
    echo "[OK] Desktop launcher created"
    echo "    You can find 'ARCADE Games' in your applications menu"
else
    echo "[WARNING] Could not create desktop launcher"
fi
echo ""

echo "========================================"
echo " Installation Complete!"
echo "========================================"
echo ""
echo "All requirements are satisfied."
echo ""
echo "You can now run ARCADE by:"
echo "  1. Searching for 'ARCADE Games' in your applications menu"
echo "  2. Running: ./launch_arcade.sh"
echo "  3. Or running: python3 launch_game.py"
echo ""
echo "The server will start on http://localhost:8001"
echo "and automatically open in your browser."
echo ""
read -p "Press Enter to launch ARCADE now..."

# Launch the game
python3 launch_game.py