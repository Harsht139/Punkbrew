# Punk Brewery Data Pipeline Makefile
# Provides convenient commands for development and deployment

.PHONY: help setup test lint format clean docker-build docker-run deploy

# Default target
help:
	@echo "🍺 Punk Brewery Data Pipeline"
	@echo "Available commands:"
	@echo "  setup          - Set up development environment"
	@echo "  test           - Run all tests"
	@echo "  lint           - Run linting checks"
	@echo "  format         - Format code with black and isort"
	@echo "  clean          - Clean up temporary files"
	@echo "  docker-build   - Build Docker image"
	@echo "  docker-run     - Run pipeline in Docker"
	@echo "  dbt-run        - Run dbt models"
	@echo "  deploy         - Deploy to production"

# Setup development environment
setup:
	@echo "Setting up development environment..."
	chmod +x scripts/setup.sh
	./scripts/setup.sh

# Run tests
test:
	@echo "Running tests..."
	pytest tests/ -v --cov=src --cov-report=html --cov-report=term

# Run linting
lint:
	@echo "Running linting checks..."
	flake8 src/ tests/
	mypy src/

# Format code
format:
	@echo "Formatting code..."
	black src/ tests/
	isort src/ tests/

# Clean temporary files
clean:
	@echo "Cleaning up..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache/
	rm -rf htmlcov/
	rm -rf dist/
	rm -rf build/

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	docker build -t punk-brewery-pipeline:latest .

# Run pipeline in Docker
docker-run:
	@echo "Running pipeline in Docker..."
	docker-compose up --build

# Run dbt models
dbt-run:
	@echo "Running dbt models..."
	cd dbt && dbt run --profiles-dir .

# Run dbt tests
dbt-test:
	@echo "Running dbt tests..."
	cd dbt && dbt test --profiles-dir .

# Generate dbt documentation
dbt-docs:
	@echo "Generating dbt documentation..."
	cd dbt && dbt docs generate --profiles-dir .
	cd dbt && dbt docs serve --profiles-dir .

# Install pre-commit hooks
install-hooks:
	@echo "Installing pre-commit hooks..."
	pre-commit install

# Run pre-commit on all files
pre-commit:
	@echo "Running pre-commit on all files..."
	pre-commit run --all-files

# Extract sample data for testing
extract-sample:
	@echo "Extracting sample data..."
	python -c "
from src.extract.punk_api_extractor import PunkAPIExtractor
from src.utils.config_manager import ConfigManager
config = ConfigManager()
extractor = PunkAPIExtractor(config)
data = extractor.extract_random_beers(10)
extractor.save_raw_data(data, 'data/sample_beers.json')
print(f'Extracted {len(data)} sample beers')
"

# Run full pipeline
run-pipeline:
	@echo "Running full pipeline..."
	python src/main.py --mode full

# Run incremental pipeline
run-incremental:
	@echo "Running incremental pipeline..."
	python src/main.py --mode incremental

# Deploy to production (placeholder)
deploy:
	@echo "Deploying to production..."
	@echo "⚠️  Please configure your deployment process"
	# Add your deployment commands here
	# Example: gcloud functions deploy punk-brewery-pipeline --source .

# Monitor pipeline
monitor:
	@echo "Opening monitoring dashboard..."
	@echo "📊 Monitoring dashboard: http://localhost:3000"
	docker-compose --profile monitoring up -d

# Stop all services
stop:
	@echo "Stopping all services..."
	docker-compose down

# View logs
logs:
	@echo "Viewing pipeline logs..."
	docker-compose logs -f punk-brewery-pipeline

# Backup data
backup:
	@echo "Creating data backup..."
	mkdir -p backups/$(shell date +%Y%m%d_%H%M%S)
	# Add backup commands for your data

# Restore data
restore:
	@echo "Restoring data from backup..."
	@echo "⚠️  Please specify backup directory"
	# Add restore commands

# Check system requirements
check-requirements:
	@echo "Checking system requirements..."
	python --version
	docker --version
	docker-compose --version
	@echo "✅ System requirements check completed"
