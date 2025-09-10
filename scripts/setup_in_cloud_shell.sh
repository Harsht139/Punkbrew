#!/bin/bash

# Setup Script for Google Cloud Shell
echo "🍺 Punk Brewery Pipeline - Cloud Shell Setup"
echo "============================================="

# Set project variables
PROJECT_ID="punkbrew"
SERVICE_ACCOUNT_NAME="punk-brewery-pipeline"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

echo "Setting up in Google Cloud Shell..."
echo "Project ID: $PROJECT_ID"

# Step 1: Clone the repository to Cloud Shell
echo ""
echo "📋 Step 1: Upload your project to Cloud Shell"
echo "You can either:"
echo "1. Upload the entire data_pipeline folder to Cloud Shell"
echo "2. Or run these commands in Cloud Shell:"

cat << 'EOF'

# In Google Cloud Shell, run these commands:

# Create project directory
mkdir -p ~/punk_brewery_pipeline
cd ~/punk_brewery_pipeline

# Create the key files manually or upload them
# Then run the setup commands below

EOF

echo ""
echo "📋 Step 2: Create Service Account (Run in Cloud Shell)"
cat << EOF

# Create service account
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \\
    --description="Service account for Punk Brewery data pipeline" \\
    --display-name="Punk Brewery Pipeline" \\
    --project=$PROJECT_ID

# Grant roles
gcloud projects add-iam-policy-binding $PROJECT_ID \\
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \\
    --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding $PROJECT_ID \\
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \\
    --role="roles/bigquery.jobUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \\
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \\
    --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding $PROJECT_ID \\
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \\
    --role="roles/logging.logWriter"

# Create service account key
mkdir -p credentials
gcloud iam service-accounts keys create credentials/service-account.json \\
    --iam-account=$SERVICE_ACCOUNT_EMAIL \\
    --project=$PROJECT_ID

EOF

echo ""
echo "📋 Step 3: Create BigQuery Tables (Run in Cloud Shell)"
echo "Copy and paste this SQL into Cloud Shell:"

cat << 'EOF'

bq query --use_legacy_sql=false "
-- Staging table for raw beer data
CREATE OR REPLACE TABLE \`punkbrew.punkbrew_warehouse.staging_beers\` (
  beer_id INT64 NOT NULL,
  name STRING NOT NULL,
  tagline STRING,
  description STRING,
  image_url STRING,
  first_brewed DATE,
  abv FLOAT64,
  ibu FLOAT64,
  target_fg FLOAT64,
  target_og FLOAT64,
  ebc FLOAT64,
  srm FLOAT64,
  ph FLOAT64,
  attenuation_level FLOAT64,
  volume JSON,
  boil_volume JSON,
  category STRING NOT NULL,
  subcategory STRING,
  category_confidence FLOAT64,
  ingredients JSON,
  method JSON,
  food_pairing ARRAY<STRING>,
  brewers_tips STRING,
  contributed_by STRING,
  processed_at TIMESTAMP NOT NULL,
  data_version STRING
)
PARTITION BY DATE(processed_at)
CLUSTER BY category;
"

EOF

echo ""
echo "✅ Follow these steps in Google Cloud Shell to complete setup!"
