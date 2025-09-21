#!/bin/bash

echo "🚀 Starting W.A.T.A. Chain MVP..."

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file not found. Please copy backend/.env.example to backend/.env and configure it."
    exit 1
fi

if [ ! -f "contracts/.env" ]; then
    echo "❌ Contracts .env file not found. Please copy contracts/.env.example to contracts/.env and configure it."
    exit 1
fi

# Start backend
echo "🔧 Starting backend..."
cd backend
yarn install
yarn dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "🎨 Starting frontend..."
cd ../frontend
yarn install
yarn dev &
FRONTEND_PID=$!

echo "✅ W.A.T.A. Chain MVP is running!"
echo "📊 Backend: http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait

# Cleanup
echo "🛑 Stopping services..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
echo "✅ All services stopped"
