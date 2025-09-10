#!/bin/bash

# Google Cloud Platform Setup Script for Punk Brewery Pipeline
# This script sets up the required GCP resources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if gcloud is installed
check_gcloud() {
    print_status "Checking Google Cloud SDK installation..."
    
    if command -v gcloud &> /dev/null; then
        GCLOUD_VERSION=$(gcloud version --format="value(Google Cloud SDK)")
        print_success "Google Cloud SDK $GCLOUD_VERSION found"
    else
        print_error "Google Cloud SDK is not installed."
        print_status "Please install it from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
}

# Set project configuration
setup_project() {
    print_status "Setting up GCP project..."
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Please create it from .env.example"
        return 1
    fi
    
    # Source environment variables
    source .env
    
    if [ -z "$GCP_PROJECT_ID" ]; then
        print_error "GCP_PROJECT_ID not set in .env file"
        return 1
    fi
    
    # Set the project
    gcloud config set project $GCP_PROJECT_ID
    print_success "Project set to: $GCP_PROJECT_ID"
}

# Enable required APIs
enable_apis() {
    print_status "Enabling required Google Cloud APIs..."
    
    apis=(
        "bigquery.googleapis.com"
        "storage.googleapis.com"
        "cloudbuild.googleapis.com"
        "logging.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        print_status "Enabling $api..."
        gcloud services enable $api
    done
    
    print_success "All required APIs enabled"
}

# Create BigQuery dataset
create_bigquery_dataset() {
    print_status "Creating BigQuery dataset..."
    
    source .env
    
    # Check if dataset exists
    if bq ls -d $GCP_PROJECT_ID:$GCP_BIGQUERY_DATASET &> /dev/null; then
        print_warning "Dataset $GCP_BIGQUERY_DATASET already exists"
    else
        bq mk \
            --dataset \
            --description="Punk Brewery Data Warehouse - Contains beer data from Punk API" \
            --location=$GCP_LOCATION \
            $GCP_PROJECT_ID:$GCP_BIGQUERY_DATASET
        
        print_success "BigQuery dataset created: $GCP_BIGQUERY_DATASET"
    fi
}

# Create Cloud Storage bucket
create_storage_bucket() {
    print_status "Creating Cloud Storage bucket..."
    
    source .env
    
    # Check if bucket exists
    if gsutil ls -b gs://$GCP_STORAGE_BUCKET &> /dev/null; then
        print_warning "Bucket $GCP_STORAGE_BUCKET already exists"
    else
        gsutil mb -l $GCP_LOCATION gs://$GCP_STORAGE_BUCKET
        print_success "Cloud Storage bucket created: $GCP_STORAGE_BUCKET"
    fi
    
    # Set lifecycle policy for cost optimization
    cat > /tmp/lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 30}
      }
    ]
  }
}
EOF
    
    gsutil lifecycle set /tmp/lifecycle.json gs://$GCP_STORAGE_BUCKET
    print_success "Lifecycle policy set for bucket (30-day retention)"
    rm /tmp/lifecycle.json
}

# Create service account
create_service_account() {
    print_status "Creating service account..."
    
    source .env
    
    SERVICE_ACCOUNT_NAME="punk-brewery-pipeline"
    SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"
    
    # Check if service account exists
    if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &> /dev/null; then
        print_warning "Service account $SERVICE_ACCOUNT_EMAIL already exists"
    else
        gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
            --description="Service account for Punk Brewery data pipeline" \
            --display-name="Punk Brewery Pipeline"
        
        print_success "Service account created: $SERVICE_ACCOUNT_EMAIL"
    fi
    
    # Grant necessary roles
    roles=(
        "roles/bigquery.dataEditor"
        "roles/bigquery.jobUser"
        "roles/storage.objectAdmin"
        "roles/logging.logWriter"
    )
    
    for role in "${roles[@]}"; do
        gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
            --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
            --role="$role"
    done
    
    print_success "IAM roles assigned to service account"
    
    # Create and download key
    mkdir -p credentials
    KEY_FILE="credentials/service-account.json"
    
    if [ ! -f "$KEY_FILE" ]; then
        gcloud iam service-accounts keys create $KEY_FILE \
            --iam-account=$SERVICE_ACCOUNT_EMAIL
        
        print_success "Service account key created: $KEY_FILE"
        print_warning "Keep this key file secure and never commit it to version control!"
    else
        print_warning "Service account key already exists: $KEY_FILE"
    fi
}

# Set up billing alerts
setup_billing_alerts() {
    print_status "Setting up billing alerts..."
    print_warning "Please set up billing alerts manually in the GCP Console:"
    print_status "1. Go to: https://console.cloud.google.com/billing/budgets"
    print_status "2. Create budget with $1 alert threshold"
    print_status "3. Set up email notifications"
}

# Verify setup
verify_setup() {
    print_status "Verifying setup..."
    
    source .env
    
    # Test BigQuery access
    if bq ls $GCP_PROJECT_ID:$GCP_BIGQUERY_DATASET &> /dev/null; then
        print_success "✓ BigQuery dataset accessible"
    else
        print_error "✗ BigQuery dataset not accessible"
    fi
    
    # Test Cloud Storage access
    if gsutil ls gs://$GCP_STORAGE_BUCKET &> /dev/null; then
        print_success "✓ Cloud Storage bucket accessible"
    else
        print_error "✗ Cloud Storage bucket not accessible"
    fi
    
    # Test service account
    if [ -f "credentials/service-account.json" ]; then
        print_success "✓ Service account key file exists"
    else
        print_error "✗ Service account key file missing"
    fi
}

# Main setup function
main() {
    echo "🍺 Punk Brewery Pipeline - GCP Setup"
    echo "===================================="
    
    check_gcloud
    setup_project
    enable_apis
    create_bigquery_dataset
    create_storage_bucket
    create_service_account
    setup_billing_alerts
    verify_setup
    
    echo ""
    print_success "GCP setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update GOOGLE_APPLICATION_CREDENTIALS in .env to point to credentials/service-account.json"
    echo "2. Run: export GOOGLE_APPLICATION_CREDENTIALS=\$(pwd)/credentials/service-account.json"
    echo "3. Test the pipeline: make run-pipeline"
    echo ""
}

# Run main function
main
