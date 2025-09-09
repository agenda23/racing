#!/bin/bash

echo "🏎️ Starting Ultimate 3D Racing Game..."
echo ""

# Check if npm is available
if command -v npm &> /dev/null; then
    echo "✅ Using npm (recommended)"
    npm start &
    SERVER_PID=$!
    PORT=3000
elif command -v npx &> /dev/null; then
    echo "✅ Using npx serve"
    npx serve . --port 8080 --single &
    SERVER_PID=$!
    PORT=8080
elif command -v python3 &> /dev/null; then
    echo "✅ Using Python 3 HTTP server"
    python3 -m http.server 8080 &
    SERVER_PID=$!
    PORT=8080
elif command -v python &> /dev/null; then
    echo "✅ Using Python HTTP server"
    python -m http.server 8080 &
    SERVER_PID=$!
    PORT=8080
else
    echo "❌ No suitable server found. Please install Node.js or Python."
    exit 1
fi

# Wait for server to start
echo "⏳ Starting server..."
sleep 3

# Open browser
GAME_URL="http://localhost:${PORT}/ultimate-game.html"
echo "🚀 Opening game at: $GAME_URL"

if command -v open &> /dev/null; then
    # macOS
    open "$GAME_URL"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "$GAME_URL"
elif command -v start &> /dev/null; then
    # Windows (Git Bash)
    start "$GAME_URL"
else
    echo "🌐 Please open your browser and go to: $GAME_URL"
fi

echo ""
echo "🎮 Game is ready! Press Ctrl+C to stop the server."

# Wait for Ctrl+C
trap "echo ''; echo '⏹️  Stopping server...'; kill $SERVER_PID 2>/dev/null; echo '✅ Server stopped. Thanks for playing!'; exit 0" INT

# Keep script running
wait $SERVER_PID