#!/bin/bash

# W.A.T.A. Chain - Execute All Tests
# This script runs both contract and backend test suites

set -e  # Exit on any error

echo "🧪 W.A.T.A. Chain - Running All Tests"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if directories exist
if [ ! -d "contracts" ]; then
    print_error "contracts directory not found!"
    exit 1
fi

if [ ! -d "backend" ]; then
    print_error "backend directory not found!"
    exit 1
fi

# Run contract tests
print_status "Running Smart Contract Tests (Hardhat)..."
echo "----------------------------------------"

cd contracts

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_status "Installing contract dependencies..."
    yarn install
fi

# Run contract tests
if yarn test; then
    print_success "Smart contract tests passed!"
else
    print_error "Smart contract tests failed!"
    exit 1
fi

cd ..

echo ""
print_status "Running Backend Integration Tests (Jest)..."
echo "--------------------------------------------"

cd backend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    yarn install
fi

# Run backend tests with coverage
if yarn test:coverage; then
    print_success "Backend integration tests passed!"
else
    print_error "Backend integration tests failed!"
    exit 1
fi

cd ..

echo ""
echo "======================================"
print_success "All tests completed successfully! 🎉"
echo "======================================"

echo ""
print_status "Test Summary:"
echo "✅ Smart Contract Tests (Hardhat) - PASSED"
echo "✅ Backend Integration Tests (Jest) - PASSED"
echo ""
print_status "Coverage reports available at:"
echo "📊 Backend: backend/coverage/lcov-report/index.html"
echo ""
print_status "Ready for deployment! 🚀"
