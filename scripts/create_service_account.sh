#!/bin/bash

# Create Service Account for Punk Brewery Pipeline
echo "🔐 Creating service account for Punk Brewery Pipeline..."

# Set variables
PROJECT_ID="punkbrew"
SERVICE_ACCOUNT_NAME="punk-brewery-pipeline"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
KEY_FILE="credentials/service-account.json"

# Create credentials directory
mkdir -p credentials

# Create service account
echo "Creating service account: $SERVICE_ACCOUNT_EMAIL"
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --description="Service account for Punk Brewery data pipeline" \
    --display-name="Punk Brewery Pipeline" \
    --project=$PROJECT_ID

# Grant necessary roles
echo "Granting IAM roles..."
roles=(
    "roles/bigquery.dataEditor"
    "roles/bigquery.jobUser"
    "roles/storage.objectAdmin"
    "roles/logging.logWriter"
)

for role in "${roles[@]}"; do
    echo "Granting role: $role"
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="$role"
done

# Create and download key
echo "Creating service account key..."
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SERVICE_ACCOUNT_EMAIL \
    --project=$PROJECT_ID

echo "✅ Service account setup complete!"
echo "📄 Key file created: $KEY_FILE"
echo ""
echo "Next steps:"
echo "1. Set environment variable: export GOOGLE_APPLICATION_CREDENTIALS=\$(pwd)/$KEY_FILE"
echo "2. Test the pipeline: python scripts/test_pipeline.py"
