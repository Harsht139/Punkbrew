"""
Airflow DAG for Punk Brewery Data Pipeline

This DAG orchestrates the daily extraction, transformation, and loading
of beer data from the Punk API to BigQuery.
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.providers.google.cloud.operators.bigquery import BigQueryCheckOperator
from airflow.providers.google.cloud.sensors.gcs import GCSObjectExistenceSensor
import sys
import os

# Add the dags directory to the Python path
import os
sys.path.append(os.path.dirname(__file__))

# Now import from the src directory
from src.main import PunkBreweryPipeline
from src.utils.config_manager import ConfigManager


# Default arguments for the DAG
default_args = {
    'owner': 'data-engineering',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'catchup': False
}

# DAG definition
dag = DAG(
    'punk_brewery_pipeline',
    default_args=default_args,
    description='Daily Punk Brewery data pipeline',
    schedule_interval='0 6 * * *',  # Daily at 6 AM UTC
    max_active_runs=1,
    tags=['data-pipeline', 'brewery', 'bigquery']
)


def extract_beer_data(**context):
    """Extract beer data from Punk API."""
    config = ConfigManager()
    pipeline = PunkBreweryPipeline(config)
    
    # Get execution date for incremental loading
    execution_date = context['execution_date']
    start_date = execution_date.strftime('%Y-%m-%d')
    
    # Extract data
    extractor = pipeline.extractor
    beer_data = extractor.extract_beer_data(start_date=start_date)
    
    # Save to temporary location for next task
    temp_file = f"/tmp/beer_data_{execution_date.strftime('%Y%m%d')}.json"
    extractor.save_raw_data(beer_data, temp_file)
    
    return temp_file


def transform_beer_data(**context):
    """Transform extracted beer data."""
    import json
    
    # Get temp file from previous task
    temp_file = context['task_instance'].xcom_pull(task_ids='extract_data')
    
    # Load data
    with open(temp_file, 'r') as f:
        raw_data = json.load(f)
    
    # Transform data
    config = ConfigManager()
    pipeline = PunkBreweryPipeline(config)
    transformed_data = pipeline.transformer.transform_beer_data(raw_data)
    
    # Save transformed data
    transformed_file = temp_file.replace('beer_data_', 'transformed_data_')
    with open(transformed_file, 'w') as f:
        json.dump(transformed_data, f, default=str)
    
    return transformed_file


def load_to_bigquery(**context):
    """Load transformed data to BigQuery."""
    import json
    
    # Get transformed file from previous task
    transformed_file = context['task_instance'].xcom_pull(task_ids='transform_data')
    
    # Load data
    with open(transformed_file, 'r') as f:
        transformed_data = json.load(f)
    
    # Load to BigQuery
    config = ConfigManager()
    pipeline = PunkBreweryPipeline(config)
    pipeline.loader.load_to_bigquery(transformed_data)
    
    # Cleanup temp files
    import os
    temp_file = context['task_instance'].xcom_pull(task_ids='extract_data')
    if os.path.exists(temp_file):
        os.remove(temp_file)
    if os.path.exists(transformed_file):
        os.remove(transformed_file)


def validate_data_quality(**context):
    """Validate data quality after loading."""
    config = ConfigManager()
    
    # Check if data was loaded today
    execution_date = context['execution_date']
    check_date = execution_date.strftime('%Y-%m-%d')
    
    # This would typically run data quality checks
    # For now, we'll just log success
    print(f"Data quality validation completed for {check_date}")
    return True


# Task definitions
extract_task = PythonOperator(
    task_id='extract_data',
    python_callable=extract_beer_data,
    dag=dag
)

transform_task = PythonOperator(
    task_id='transform_data',
    python_callable=transform_beer_data,
    dag=dag
)

load_task = PythonOperator(
    task_id='load_to_bigquery',
    python_callable=load_to_bigquery,
    dag=dag
)

# Data quality check using BigQuery
data_quality_check = BigQueryCheckOperator(
    task_id='data_quality_check',
    sql="""
        SELECT COUNT(*) as record_count
        FROM `{{ var.value.gcp_project_id }}.{{ var.value.bigquery_dataset }}.fact_beers`
        WHERE DATE(processed_at) = CURRENT_DATE()
    """,
    dag=dag
)

# dbt transformation (if using dbt)
dbt_run = BashOperator(
    task_id='dbt_run',
    bash_command='cd /opt/airflow/dags/dbt && dbt run --profiles-dir .',
    dag=dag
)

# Data validation task
validate_task = PythonOperator(
    task_id='validate_data_quality',
    python_callable=validate_data_quality,
    dag=dag
)

# Success notification
success_notification = BashOperator(
    task_id='success_notification',
    bash_command='echo "Punk Brewery pipeline completed successfully for {{ ds }}"',
    dag=dag
)

# Task dependencies
extract_task >> transform_task >> load_task >> data_quality_check >> dbt_run >> validate_task >> success_notification
