#!/bin/bash

# Quick Setup Script for Punk Brewery Pipeline
echo "🍺 Punk Brewery Pipeline - Quick Setup"
echo "======================================"

# Step 1: Create service account and credentials
echo "Step 1: Creating service account..."
./scripts/create_service_account.sh

# Step 2: Create BigQuery tables
echo ""
echo "Step 2: Creating BigQuery tables..."
bq query --use_legacy_sql=false < scripts/setup_bigquery_tables.sql

# Step 3: Set up Python environment
echo ""
echo "Step 3: Setting up Python environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Step 4: Set environment variables
echo ""
echo "Step 4: Setting environment variables..."
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/credentials/service-account.json"

# Update .env file
cat > .env << EOF
# Google Cloud Platform Configuration
GCP_PROJECT_ID=punkbrew
GCP_STORAGE_BUCKET=punkbrew-data-staging-bucket
GCP_BIGQUERY_DATASET=punkbrew_warehouse
GCP_LOCATION=US-CENTRAL1
GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/credentials/service-account.json

# Punk API Configuration
PUNK_API_BASE_URL=https://api.punkapi.com/v2
PUNK_API_TIMEOUT=30
PUNK_API_RETRY_ATTEMPTS=3
PUNK_API_RATE_LIMIT_DELAY=1.0

# Pipeline Configuration
PIPELINE_BATCH_SIZE=100
PIPELINE_MAX_WORKERS=4
PIPELINE_DATA_RETENTION_DAYS=30

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/pipeline.log
USE_GCP_LOGGING=false

# Development Configuration
ENVIRONMENT=development
DEBUG=false
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Test the pipeline: python scripts/test_pipeline.py"
echo "2. Run full pipeline: python src/main.py --mode full"
echo ""
echo "📝 Environment variables set:"
echo "   GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS"
