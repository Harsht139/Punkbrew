#!/usr/bin/env python3
"""
Local Development Setup for Punk Brewery Pipeline

This script sets up the pipeline for local development without requiring
gcloud CLI installation. It creates mock credentials and tests the API.
"""

import os
import json
import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from src.extract.punk_api_extractor import PunkAPIExtractor
from src.utils.config_manager import ConfigManager
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


def create_mock_credentials():
    """Create mock service account credentials for local testing."""
    print("🔐 Creating mock credentials for local development...")
    
    # Create credentials directory
    credentials_dir = Path("credentials")
    credentials_dir.mkdir(exist_ok=True)
    
    # Mock service account structure (won't work with BigQuery, but allows testing)
    mock_credentials = {
        "type": "service_account",
        "project_id": "punkbrew",
        "private_key_id": "mock_key_id",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
        "client_email": "punk-brewery-pipeline@punkbrew.iam.gserviceaccount.com",
        "client_id": "mock_client_id",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token"
    }
    
    # Save mock credentials
    credentials_file = credentials_dir / "service-account.json"
    with open(credentials_file, 'w') as f:
        json.dump(mock_credentials, f, indent=2)
    
    print(f"✅ Mock credentials created: {credentials_file}")
    return str(credentials_file)


def setup_environment():
    """Set up environment variables."""
    print("⚙️ Setting up environment variables...")
    
    env_vars = {
        'GCP_PROJECT_ID': 'punkbrew',
        'GCP_STORAGE_BUCKET': 'punkbrew-data-staging-bucket',
        'GCP_BIGQUERY_DATASET': 'punkbrew_warehouse',
        'GCP_LOCATION': 'US-CENTRAL1',
        'GOOGLE_APPLICATION_CREDENTIALS': str(Path.cwd() / 'credentials' / 'service-account.json'),
        'PUNK_API_BASE_URL': 'https://api.punkapi.com/v2',
        'LOG_LEVEL': 'INFO'
    }
    
    # Set environment variables
    for key, value in env_vars.items():
        os.environ[key] = value
    
    # Create .env file
    env_file = Path('.env')
    with open(env_file, 'w') as f:
        f.write("# Punk Brewery Pipeline - Local Development Environment\n\n")
        for key, value in env_vars.items():
            f.write(f"{key}={value}\n")
    
    print(f"✅ Environment variables set and saved to {env_file}")


def test_api_connection():
    """Test Punk API connection."""
    print("🔌 Testing Punk API connection...")
    
    try:
        config = ConfigManager()
        extractor = PunkAPIExtractor(config)
        
        # Test API connectivity
        random_beers = extractor.extract_random_beers(count=2)
        
        if random_beers:
            print(f"✅ API connection successful!")
            print(f"📊 Sample beers retrieved:")
            for beer in random_beers:
                print(f"   - {beer.get('name', 'Unknown')} (ABV: {beer.get('abv', 'N/A')}%)")
            return True
        else:
            print("❌ No data received from API")
            return False
            
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        return False


def test_data_transformation():
    """Test data transformation without BigQuery."""
    print("🔄 Testing data transformation...")
    
    try:
        from src.transform.beer_transformer import BeerTransformer
        
        config = ConfigManager()
        extractor = PunkAPIExtractor(config)
        transformer = BeerTransformer(config)
        
        # Get sample data
        raw_data = extractor.extract_random_beers(count=3)
        
        if raw_data:
            # Transform data
            transformed_data = transformer.transform_beer_data(raw_data)
            
            if transformed_data:
                print("✅ Data transformation successful!")
                print("📊 Sample transformed data:")
                for beer in transformed_data:
                    print(f"   - {beer.get('name')}: Category={beer.get('category')}, ABV={beer.get('alcohol_by_volume')}%")
                
                # Show category distribution
                categories = {}
                for beer in transformed_data:
                    cat = beer.get('category', 'unknown')
                    categories[cat] = categories.get(cat, 0) + 1
                
                print(f"📈 Categories found: {categories}")
                return True
            else:
                print("❌ Transformation returned no data")
                return False
        else:
            print("❌ No raw data to transform")
            return False
            
    except Exception as e:
        print(f"❌ Data transformation failed: {e}")
        return False


def create_sample_data_file():
    """Create a sample data file for testing."""
    print("📄 Creating sample data file...")
    
    try:
        config = ConfigManager()
        extractor = PunkAPIExtractor(config)
        transformer = BeerTransformer(config)
        
        # Extract sample data
        raw_data = extractor.extract_random_beers(count=10)
        transformed_data = transformer.transform_beer_data(raw_data)
        
        # Save sample data
        sample_dir = Path("data/samples")
        sample_dir.mkdir(parents=True, exist_ok=True)
        
        # Save raw data
        with open(sample_dir / "raw_beers.json", 'w') as f:
            json.dump(raw_data, f, indent=2, default=str)
        
        # Save transformed data
        with open(sample_dir / "transformed_beers.json", 'w') as f:
            json.dump(transformed_data, f, indent=2, default=str)
        
        print(f"✅ Sample data saved to {sample_dir}")
        print(f"   - Raw data: {len(raw_data)} beers")
        print(f"   - Transformed data: {len(transformed_data)} beers")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to create sample data: {e}")
        return False


def main():
    """Main setup function."""
    print("🍺 Punk Brewery Pipeline - Local Development Setup")
    print("=" * 55)
    
    success_count = 0
    total_tests = 5
    
    # Step 1: Create mock credentials
    try:
        create_mock_credentials()
        success_count += 1
    except Exception as e:
        print(f"❌ Failed to create credentials: {e}")
    
    # Step 2: Setup environment
    try:
        setup_environment()
        success_count += 1
    except Exception as e:
        print(f"❌ Failed to setup environment: {e}")
    
    # Step 3: Test API connection
    if test_api_connection():
        success_count += 1
    
    # Step 4: Test data transformation
    if test_data_transformation():
        success_count += 1
    
    # Step 5: Create sample data
    if create_sample_data_file():
        success_count += 1
    
    # Summary
    print("\n" + "=" * 55)
    print(f"📊 Setup Summary: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("🎉 Local development setup complete!")
        print("\n📋 Next steps:")
        print("1. Review sample data in data/samples/")
        print("2. For BigQuery integration, set up Google Cloud CLI")
        print("3. Or continue development with local data files")
    else:
        print("⚠️  Some setup steps failed. Check the errors above.")
    
    print("\n🔗 Useful commands:")
    print("   - Test API: python -c 'from src.extract.punk_api_extractor import *; print(\"API working!\")'")
    print("   - View sample data: cat data/samples/transformed_beers.json | jq .")


if __name__ == "__main__":
    main()
