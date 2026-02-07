#!/usr/bin/env python3
"""
ARCADE Game Collection Launcher
Quick start script for the game collection
"""

import os
import sys
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
import socketserver

def main():
    port = 8001
    print("🎮 Starting ARCADE Game Collection...")
    print(f"🌐 Server: http://localhost:{port}")
    
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    handler = SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            print("✅ Server started successfully!")
            print("🚀 Opening ARCADE in browser...")
            webbrowser.open(f'http://localhost:{port}')
            print("\n🎯 Game Controls:")
            print("   • Navigate between games using the left panel")
            print("   • Tic Tac Toe: Click to play")
            print("   • Chess: Click to select and move")
            print("   • Snake: Arrow keys to move")
            print("   • Flappy Bird: Space or Click to flap")
            print("   • Press Ctrl+C to stop server")
            print("\n" + "="*50)
            httpd.serve_forever()
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {port} is already in use!")
            print("   Try closing other applications or use a different port")
        else:
            print(f"❌ Error starting server: {e}")
    except KeyboardInterrupt:
        print("\n🛑 ARCADE stopped by user. Thanks for playing!")

if __name__ == "__main__":
    main()