#!/bin/bash

# Punk Brewery Data Pipeline Setup Script
# This script sets up the development environment and initializes the project

set -e

echo "🍺 Setting up Punk Brewery Data Pipeline..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python 3.8+ is installed
check_python() {
    print_status "Checking Python installation..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d" " -f2)
        print_success "Python $PYTHON_VERSION found"
    else
        print_error "Python 3 is not installed. Please install Python 3.8 or higher."
        exit 1
    fi
}

# Create virtual environment
create_venv() {
    print_status "Creating virtual environment..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Virtual environment created"
    else
        print_warning "Virtual environment already exists"
    fi
}

# Activate virtual environment and install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    print_success "Dependencies installed"
}

# Create necessary directories
create_directories() {
    print_status "Creating project directories..."
    
    mkdir -p logs
    mkdir -p data/{raw,processed,staging}
    mkdir -p credentials
    mkdir -p notebooks
    
    print_success "Directories created"
}

# Copy environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_warning "Please update .env file with your actual configuration values"
    else
        print_warning ".env file already exists"
    fi
}

# Initialize git repository
init_git() {
    print_status "Initializing git repository..."
    
    if [ ! -d ".git" ]; then
        git init
        git add .
        git commit -m "Initial commit: Punk Brewery Data Pipeline"
        print_success "Git repository initialized"
    else
        print_warning "Git repository already exists"
    fi
}

# Create sample test file
create_test_file() {
    print_status "Creating sample test file..."
    
    cat > tests/test_sample.py << 'EOF'
"""Sample test file for the Punk Brewery Data Pipeline."""

import pytest
from src.utils.config_manager import ConfigManager


def test_config_manager():
    """Test that ConfigManager can be instantiated."""
    config = ConfigManager()
    assert config is not None
    assert config.api.base_url == "https://api.punkapi.com/v2"


def test_api_config():
    """Test API configuration."""
    config = ConfigManager()
    api_config = config.api
    
    assert api_config.base_url is not None
    assert api_config.timeout > 0
    assert api_config.retry_attempts > 0
EOF

    print_success "Sample test file created"
}

# Main setup function
main() {
    echo "🍺 Punk Brewery Data Pipeline Setup"
    echo "=================================="
    
    check_python
    create_venv
    install_dependencies
    create_directories
    setup_environment
    create_test_file
    
    echo ""
    print_success "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update the .env file with your GCP credentials and project details"
    echo "2. Activate the virtual environment: source venv/bin/activate"
    echo "3. Run tests: pytest tests/"
    echo "4. Start the pipeline: python src/main.py"
    echo ""
    echo "For more information, see the README.md file."
}

# Run main function
main
