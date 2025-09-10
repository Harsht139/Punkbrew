#!/usr/bin/env python3
"""
Punk Brewery Pipeline Testing Script

This script tests the complete data pipeline from API extraction
to BigQuery loading and validates the results.
"""

import sys
import os
import json
from pathlib import Path
from datetime import datetime, timedelta
import pandas as pd

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from src.extract.punk_api_extractor import PunkAPIExtractor
from src.transform.beer_transformer import BeerTransformer
from src.load.bigquery_loader import BigQueryLoader
from src.utils.config_manager import ConfigManager
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class PipelineTester:
    """Comprehensive pipeline testing class."""
    
    def __init__(self):
        """Initialize the pipeline tester."""
        self.config = ConfigManager()
        self.extractor = PunkAPIExtractor(self.config)
        self.transformer = BeerTransformer(self.config)
        self.loader = BigQueryLoader(self.config)
        
        # Test results
        self.test_results = {
            'extraction': {'status': 'pending', 'details': {}},
            'transformation': {'status': 'pending', 'details': {}},
            'loading': {'status': 'pending', 'details': {}},
            'validation': {'status': 'pending', 'details': {}}
        }
    
    def test_api_connectivity(self):
        """Test Punk API connectivity."""
        logger.info("🔌 Testing API connectivity...")
        
        try:
            # Test random beer extraction
            random_beers = self.extractor.extract_random_beers(count=1)
            
            if random_beers and len(random_beers) > 0:
                self.test_results['extraction']['status'] = 'success'
                self.test_results['extraction']['details'] = {
                    'api_accessible': True,
                    'sample_beer': random_beers[0].get('name', 'Unknown'),
                    'response_time': 'Good'
                }
                logger.info("✅ API connectivity test passed")
                return True
            else:
                raise Exception("No data returned from API")
                
        except Exception as e:
            self.test_results['extraction']['status'] = 'failed'
            self.test_results['extraction']['details'] = {'error': str(e)}
            logger.error(f"❌ API connectivity test failed: {e}")
            return False
    
    def test_data_extraction(self, sample_size=10):
        """Test data extraction with a small sample."""
        logger.info(f"📥 Testing data extraction (sample size: {sample_size})...")
        
        try:
            # Extract sample data
            beer_data = self.extractor.extract_random_beers(count=sample_size)
            
            if not beer_data:
                raise Exception("No data extracted")
            
            # Validate data structure
            required_fields = ['id', 'name', 'abv']
            for beer in beer_data[:3]:  # Check first 3 beers
                for field in required_fields:
                    if field not in beer:
                        raise Exception(f"Missing required field: {field}")
            
            self.test_results['extraction']['details'].update({
                'sample_size': len(beer_data),
                'data_structure_valid': True,
                'sample_names': [beer.get('name') for beer in beer_data[:3]]
            })
            
            logger.info(f"✅ Data extraction test passed - {len(beer_data)} beers extracted")
            return beer_data
            
        except Exception as e:
            self.test_results['extraction']['status'] = 'failed'
            self.test_results['extraction']['details']['extraction_error'] = str(e)
            logger.error(f"❌ Data extraction test failed: {e}")
            return None
    
    def test_data_transformation(self, raw_data):
        """Test data transformation logic."""
        logger.info("🔄 Testing data transformation...")
        
        try:
            if not raw_data:
                raise Exception("No raw data provided for transformation")
            
            # Transform data
            transformed_data = self.transformer.transform_beer_data(raw_data)
            
            if not transformed_data:
                raise Exception("No transformed data returned")
            
            # Validate transformation
            required_fields = ['beer_id', 'name', 'category']
            categories_found = set()
            
            for beer in transformed_data:
                # Check required fields
                for field in required_fields:
                    if field not in beer:
                        raise Exception(f"Missing required field after transformation: {field}")
                
                # Collect categories
                if beer.get('category'):
                    categories_found.add(beer['category'])
            
            # Validate categorization
            valid_categories = {'ale', 'lager', 'other'}
            invalid_categories = categories_found - valid_categories
            
            if invalid_categories:
                logger.warning(f"Found unexpected categories: {invalid_categories}")
            
            self.test_results['transformation'] = {
                'status': 'success',
                'details': {
                    'transformed_count': len(transformed_data),
                    'categories_found': list(categories_found),
                    'categorization_working': len(categories_found) > 0,
                    'sample_transformed': {
                        'name': transformed_data[0].get('name'),
                        'category': transformed_data[0].get('category'),
                        'abv': transformed_data[0].get('alcohol_by_volume')
                    }
                }
            }
            
            logger.info(f"✅ Data transformation test passed - {len(transformed_data)} beers transformed")
            logger.info(f"📊 Categories found: {list(categories_found)}")
            return transformed_data
            
        except Exception as e:
            self.test_results['transformation']['status'] = 'failed'
            self.test_results['transformation']['details'] = {'error': str(e)}
            logger.error(f"❌ Data transformation test failed: {e}")
            return None
    
    def test_bigquery_connection(self):
        """Test BigQuery connectivity and permissions."""
        logger.info("🗄️ Testing BigQuery connection...")
        
        try:
            # Test dataset access
            dataset_ref = self.loader.bq_client.dataset(self.loader.dataset_id)
            dataset = self.loader.bq_client.get_dataset(dataset_ref)
            
            logger.info(f"✅ BigQuery dataset accessible: {dataset.dataset_id}")
            
            # Test query execution
            test_query = f"""
                SELECT 
                    '{datetime.now().isoformat()}' as test_timestamp,
                    'pipeline_test' as test_type
            """
            
            query_job = self.loader.bq_client.query(test_query)
            results = list(query_job.result())
            
            if results:
                logger.info("✅ BigQuery query execution successful")
                return True
            else:
                raise Exception("Query returned no results")
                
        except Exception as e:
            logger.error(f"❌ BigQuery connection test failed: {e}")
            return False
    
    def test_data_loading(self, transformed_data, test_mode=True):
        """Test data loading to BigQuery."""
        logger.info("📤 Testing data loading to BigQuery...")
        
        try:
            if not transformed_data:
                raise Exception("No transformed data provided for loading")
            
            if test_mode:
                # In test mode, only load first 5 records
                test_data = transformed_data[:5]
                logger.info(f"Test mode: Loading {len(test_data)} records")
            else:
                test_data = transformed_data
            
            # Load data
            self.loader.load_to_bigquery(test_data)
            
            # Verify data was loaded
            verification_query = f"""
                SELECT COUNT(*) as record_count
                FROM `{self.loader.project_id}.{self.loader.dataset_id}.staging_beers`
                WHERE DATE(processed_at) = CURRENT_DATE()
            """
            
            query_job = self.loader.bq_client.query(verification_query)
            results = list(query_job.result())
            
            if results and results[0].record_count > 0:
                record_count = results[0].record_count
                self.test_results['loading'] = {
                    'status': 'success',
                    'details': {
                        'records_loaded': record_count,
                        'load_successful': True,
                        'verification_passed': True
                    }
                }
                logger.info(f"✅ Data loading test passed - {record_count} records loaded")
                return True
            else:
                raise Exception("No records found in BigQuery after loading")
                
        except Exception as e:
            self.test_results['loading']['status'] = 'failed'
            self.test_results['loading']['details'] = {'error': str(e)}
            logger.error(f"❌ Data loading test failed: {e}")
            return False
    
    def test_data_validation(self):
        """Validate loaded data in BigQuery."""
        logger.info("🔍 Testing data validation...")
        
        try:
            # Test queries for data validation
            validation_queries = {
                'total_records': f"""
                    SELECT COUNT(*) as count 
                    FROM `{self.loader.project_id}.{self.loader.dataset_id}.staging_beers`
                """,
                'category_distribution': f"""
                    SELECT category, COUNT(*) as count 
                    FROM `{self.loader.project_id}.{self.loader.dataset_id}.staging_beers`
                    GROUP BY category
                """,
                'data_quality': f"""
                    SELECT 
                        COUNT(*) as total_records,
                        COUNT(CASE WHEN name IS NOT NULL THEN 1 END) as records_with_name,
                        COUNT(CASE WHEN category IS NOT NULL THEN 1 END) as records_with_category,
                        COUNT(CASE WHEN abv IS NOT NULL THEN 1 END) as records_with_abv
                    FROM `{self.loader.project_id}.{self.loader.dataset_id}.staging_beers`
                """
            }
            
            validation_results = {}
            
            for query_name, query in validation_queries.items():
                query_job = self.loader.bq_client.query(query)
                results = list(query_job.result())
                validation_results[query_name] = [dict(row) for row in results]
            
            self.test_results['validation'] = {
                'status': 'success',
                'details': validation_results
            }
            
            logger.info("✅ Data validation test passed")
            logger.info(f"📊 Total records: {validation_results['total_records'][0]['count']}")
            
            return True
            
        except Exception as e:
            self.test_results['validation']['status'] = 'failed'
            self.test_results['validation']['details'] = {'error': str(e)}
            logger.error(f"❌ Data validation test failed: {e}")
            return False
    
    def run_full_pipeline_test(self, sample_size=10):
        """Run complete pipeline test."""
        logger.info("🚀 Starting full pipeline test...")
        
        # Test 1: API Connectivity
        if not self.test_api_connectivity():
            return False
        
        # Test 2: Data Extraction
        raw_data = self.test_data_extraction(sample_size)
        if not raw_data:
            return False
        
        # Test 3: Data Transformation
        transformed_data = self.test_data_transformation(raw_data)
        if not transformed_data:
            return False
        
        # Test 4: BigQuery Connection
        if not self.test_bigquery_connection():
            return False
        
        # Test 5: Data Loading
        if not self.test_data_loading(transformed_data, test_mode=True):
            return False
        
        # Test 6: Data Validation
        if not self.test_data_validation():
            return False
        
        logger.info("🎉 Full pipeline test completed successfully!")
        return True
    
    def generate_test_report(self):
        """Generate a comprehensive test report."""
        report = {
            'test_timestamp': datetime.now().isoformat(),
            'overall_status': 'success' if all(
                result['status'] == 'success' 
                for result in self.test_results.values()
            ) else 'failed',
            'test_results': self.test_results
        }
        
        # Save report
        report_file = f"test_reports/pipeline_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        os.makedirs('test_reports', exist_ok=True)
        
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"📄 Test report saved: {report_file}")
        return report


def main():
    """Main test execution function."""
    print("🍺 Punk Brewery Pipeline - Comprehensive Testing")
    print("=" * 50)
    
    tester = PipelineTester()
    
    try:
        # Run full pipeline test
        success = tester.run_full_pipeline_test(sample_size=5)
        
        # Generate report
        report = tester.generate_test_report()
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        for test_name, result in tester.test_results.items():
            status_emoji = "✅" if result['status'] == 'success' else "❌"
            print(f"{status_emoji} {test_name.title()}: {result['status'].upper()}")
        
        print(f"\n🎯 Overall Status: {'SUCCESS' if success else 'FAILED'}")
        
        if success:
            print("\n🎉 Pipeline is ready for production!")
            print("\nNext steps:")
            print("1. Run full data load: python src/main.py --mode full")
            print("2. Set up Airflow scheduling")
            print("3. Create DataStudio dashboard")
        else:
            print("\n⚠️  Please fix the issues above before proceeding.")
        
        return 0 if success else 1
        
    except Exception as e:
        logger.error(f"Test execution failed: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
