"""
BigQuery Data Loader

Handles loading transformed beer data into BigQuery tables with support
for staging, data validation, and incremental updates.
"""

import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from google.cloud import bigquery
from google.cloud import storage
from google.cloud.exceptions import NotFound
import pandas as pd

from ..utils.config_manager import ConfigManager
from ..utils.logger import get_pipeline_logger, log_function_call


class BigQueryLoader:
    """Loads beer data into BigQuery."""
    
    def __init__(self, config: ConfigManager):
        """
        Initialize BigQuery loader.
        
        Args:
            config: Configuration manager instance
        """
        self.config = config
        self.logger = get_pipeline_logger("loader")
        
        # Initialize clients
        self.bq_client = bigquery.Client(project=config.gcp.project_id)
        self.storage_client = storage.Client(project=config.gcp.project_id)
        
        self.project_id = config.gcp.project_id
        self.dataset_id = config.gcp.bigquery_dataset
        self.bucket_name = config.gcp.storage_bucket
        self.staging_path = config.pipeline.staging_path
    
    @log_function_call
    def load_to_bigquery(self, beer_data: List[Dict[str, Any]]) -> None:
        """
        Load beer data to BigQuery through staging process.
        
        Args:
            beer_data: List of transformed beer records
        """
        if not beer_data:
            self.logger.warning("No data to load")
            return
        
        # Step 1: Upload to Cloud Storage
        staging_file = self._upload_to_staging(beer_data)
        
        # Step 2: Ensure dataset and tables exist
        self._ensure_dataset_exists()
        self._ensure_tables_exist()
        
        # Step 3: Load to staging table
        self._load_to_staging_table(staging_file)
        
        # Step 4: Merge to production tables
        self._merge_to_production_tables()
        
        # Step 5: Cleanup staging data
        self._cleanup_staging_data(staging_file)
        
        self.logger.info(f"Successfully loaded {len(beer_data)} records to BigQuery")
    
    def _upload_to_staging(self, beer_data: List[Dict[str, Any]]) -> str:
        """Upload data to Cloud Storage staging area."""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        staging_file = f"{self.staging_path}/beers_{timestamp}.json"
        
        # Get bucket
        bucket = self.storage_client.bucket(self.bucket_name)
        blob = bucket.blob(staging_file)
        
        # Upload data as JSONL (newline-delimited JSON)
        jsonl_data = '\n'.join(json.dumps(record) for record in beer_data)
        blob.upload_from_string(jsonl_data, content_type='application/json')
        
        self.logger.info(f"Uploaded {len(beer_data)} records to gs://{self.bucket_name}/{staging_file}")
        return staging_file
    
    def _ensure_dataset_exists(self) -> None:
        """Ensure BigQuery dataset exists."""
        dataset_ref = self.bq_client.dataset(self.dataset_id)
        
        try:
            self.bq_client.get_dataset(dataset_ref)
            self.logger.debug(f"Dataset {self.dataset_id} already exists")
        except NotFound:
            dataset = bigquery.Dataset(dataset_ref)
            dataset.location = self.config.gcp.location
            dataset.description = "Punk Brewery data warehouse"
            
            self.bq_client.create_dataset(dataset)
            self.logger.info(f"Created dataset {self.dataset_id}")
    
    def _ensure_tables_exist(self) -> None:
        """Ensure required BigQuery tables exist."""
        tables_to_create = [
            ('staging_beers', self._get_staging_schema()),
            ('dim_beers', self._get_dim_beers_schema()),
            ('dim_ingredients', self._get_dim_ingredients_schema()),
            ('fact_beers', self._get_fact_beers_schema()),
            ('fact_beer_ingredients', self._get_fact_beer_ingredients_schema())
        ]
        
        for table_name, schema in tables_to_create:
            self._create_table_if_not_exists(table_name, schema)
    
    def _create_table_if_not_exists(self, table_name: str, schema: List[bigquery.SchemaField]) -> None:
        """Create table if it doesn't exist."""
        table_ref = self.bq_client.dataset(self.dataset_id).table(table_name)
        
        try:
            self.bq_client.get_table(table_ref)
            self.logger.debug(f"Table {table_name} already exists")
        except NotFound:
            table = bigquery.Table(table_ref, schema=schema)
            
            # Add clustering and partitioning for performance
            if table_name in ['fact_beers', 'staging_beers']:
                table.time_partitioning = bigquery.TimePartitioning(
                    type_=bigquery.TimePartitioningType.DAY,
                    field="processed_at"
                )
                table.clustering_fields = ["category"]
            
            self.bq_client.create_table(table)
            self.logger.info(f"Created table {table_name}")
    
    def _load_to_staging_table(self, staging_file: str) -> None:
        """Load data from Cloud Storage to staging table."""
        table_ref = self.bq_client.dataset(self.dataset_id).table('staging_beers')
        
        job_config = bigquery.LoadJobConfig(
            source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
            write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
            autodetect=False,
            schema=self._get_staging_schema()
        )
        
        uri = f"gs://{self.bucket_name}/{staging_file}"
        load_job = self.bq_client.load_table_from_uri(uri, table_ref, job_config=job_config)
        
        load_job.result()  # Wait for job to complete
        
        if load_job.errors:
            raise Exception(f"Load job failed: {load_job.errors}")
        
        self.logger.info(f"Loaded data from {uri} to staging table")
    
    def _merge_to_production_tables(self) -> None:
        """Merge staging data to production tables."""
        # Merge to dim_beers
        self._execute_merge_query("""
            MERGE `{project}.{dataset}.dim_beers` AS target
            USING (
                SELECT DISTINCT
                    beer_id,
                    name,
                    tagline,
                    description,
                    image_url,
                    category,
                    subcategory,
                    category_confidence,
                    processed_at
                FROM `{project}.{dataset}.staging_beers`
            ) AS source
            ON target.beer_id = source.beer_id
            WHEN MATCHED THEN
                UPDATE SET
                    name = source.name,
                    tagline = source.tagline,
                    description = source.description,
                    image_url = source.image_url,
                    category = source.category,
                    subcategory = source.subcategory,
                    category_confidence = source.category_confidence,
                    updated_at = source.processed_at
            WHEN NOT MATCHED THEN
                INSERT (
                    beer_id, name, tagline, description, image_url,
                    category, subcategory, category_confidence,
                    created_at, updated_at
                )
                VALUES (
                    source.beer_id, source.name, source.tagline, source.description,
                    source.image_url, source.category, source.subcategory,
                    source.category_confidence, source.processed_at, source.processed_at
                )
        """)
        
        # Merge to fact_beers
        self._execute_merge_query("""
            MERGE `{project}.{dataset}.fact_beers` AS target
            USING (
                SELECT
                    beer_id,
                    first_brewed,
                    abv,
                    ibu,
                    target_fg,
                    target_og,
                    ebc,
                    srm,
                    ph,
                    attenuation_level,
                    volume,
                    boil_volume,
                    food_pairing,
                    brewers_tips,
                    contributed_by,
                    processed_at
                FROM `{project}.{dataset}.staging_beers`
            ) AS source
            ON target.beer_id = source.beer_id
            WHEN MATCHED THEN
                UPDATE SET
                    first_brewed = source.first_brewed,
                    abv = source.abv,
                    ibu = source.ibu,
                    target_fg = source.target_fg,
                    target_og = source.target_og,
                    ebc = source.ebc,
                    srm = source.srm,
                    ph = source.ph,
                    attenuation_level = source.attenuation_level,
                    volume = source.volume,
                    boil_volume = source.boil_volume,
                    food_pairing = source.food_pairing,
                    brewers_tips = source.brewers_tips,
                    contributed_by = source.contributed_by,
                    updated_at = source.processed_at
            WHEN NOT MATCHED THEN
                INSERT (
                    beer_id, first_brewed, abv, ibu, target_fg, target_og,
                    ebc, srm, ph, attenuation_level, volume, boil_volume,
                    food_pairing, brewers_tips, contributed_by,
                    created_at, updated_at, processed_at
                )
                VALUES (
                    source.beer_id, source.first_brewed, source.abv, source.ibu,
                    source.target_fg, source.target_og, source.ebc, source.srm,
                    source.ph, source.attenuation_level, source.volume,
                    source.boil_volume, source.food_pairing, source.brewers_tips,
                    source.contributed_by, source.processed_at, source.processed_at,
                    source.processed_at
                )
        """)
    
    def _execute_merge_query(self, query_template: str) -> None:
        """Execute a merge query with project and dataset substitution."""
        query = query_template.format(
            project=self.project_id,
            dataset=self.dataset_id
        )
        
        job = self.bq_client.query(query)
        job.result()  # Wait for completion
        
        if job.errors:
            raise Exception(f"Merge query failed: {job.errors}")
    
    def _cleanup_staging_data(self, staging_file: str) -> None:
        """Clean up staging data from Cloud Storage."""
        bucket = self.storage_client.bucket(self.bucket_name)
        blob = bucket.blob(staging_file)
        
        try:
            blob.delete()
            self.logger.info(f"Cleaned up staging file: {staging_file}")
        except Exception as e:
            self.logger.warning(f"Failed to cleanup staging file {staging_file}: {e}")
    
    @log_function_call
    def get_last_processed_date(self) -> Optional[str]:
        """Get the last processed date from BigQuery."""
        query = f"""
            SELECT MAX(DATE(processed_at)) as last_date
            FROM `{self.project_id}.{self.dataset_id}.fact_beers`
        """
        
        try:
            result = self.bq_client.query(query).result()
            for row in result:
                if row.last_date:
                    return row.last_date.strftime('%Y-%m-%d')
            return None
        except Exception as e:
            self.logger.warning(f"Failed to get last processed date: {e}")
            return None
    
    def _get_staging_schema(self) -> List[bigquery.SchemaField]:
        """Get schema for staging table."""
        return [
            bigquery.SchemaField("beer_id", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("name", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("tagline", "STRING"),
            bigquery.SchemaField("description", "STRING"),
            bigquery.SchemaField("image_url", "STRING"),
            bigquery.SchemaField("first_brewed", "DATE"),
            bigquery.SchemaField("abv", "FLOAT"),
            bigquery.SchemaField("ibu", "FLOAT"),
            bigquery.SchemaField("target_fg", "FLOAT"),
            bigquery.SchemaField("target_og", "FLOAT"),
            bigquery.SchemaField("ebc", "FLOAT"),
            bigquery.SchemaField("srm", "FLOAT"),
            bigquery.SchemaField("ph", "FLOAT"),
            bigquery.SchemaField("attenuation_level", "FLOAT"),
            bigquery.SchemaField("volume", "JSON"),
            bigquery.SchemaField("boil_volume", "JSON"),
            bigquery.SchemaField("category", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("subcategory", "STRING"),
            bigquery.SchemaField("category_confidence", "FLOAT"),
            bigquery.SchemaField("ingredients", "JSON"),
            bigquery.SchemaField("method", "JSON"),
            bigquery.SchemaField("food_pairing", "STRING", mode="REPEATED"),
            bigquery.SchemaField("brewers_tips", "STRING"),
            bigquery.SchemaField("contributed_by", "STRING"),
            bigquery.SchemaField("processed_at", "TIMESTAMP", mode="REQUIRED"),
            bigquery.SchemaField("data_version", "STRING")
        ]
    
    def _get_dim_beers_schema(self) -> List[bigquery.SchemaField]:
        """Get schema for dim_beers table."""
        return [
            bigquery.SchemaField("beer_id", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("name", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("tagline", "STRING"),
            bigquery.SchemaField("description", "STRING"),
            bigquery.SchemaField("image_url", "STRING"),
            bigquery.SchemaField("category", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("subcategory", "STRING"),
            bigquery.SchemaField("category_confidence", "FLOAT"),
            bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED"),
            bigquery.SchemaField("updated_at", "TIMESTAMP", mode="REQUIRED")
        ]
    
    def _get_dim_ingredients_schema(self) -> List[bigquery.SchemaField]:
        """Get schema for dim_ingredients table."""
        return [
            bigquery.SchemaField("ingredient_id", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("ingredient_name", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("ingredient_type", "STRING", mode="REQUIRED"),  # malt, hop, yeast
            bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED")
        ]
    
    def _get_fact_beers_schema(self) -> List[bigquery.SchemaField]:
        """Get schema for fact_beers table."""
        return [
            bigquery.SchemaField("beer_id", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("first_brewed", "DATE"),
            bigquery.SchemaField("abv", "FLOAT"),
            bigquery.SchemaField("ibu", "FLOAT"),
            bigquery.SchemaField("target_fg", "FLOAT"),
            bigquery.SchemaField("target_og", "FLOAT"),
            bigquery.SchemaField("ebc", "FLOAT"),
            bigquery.SchemaField("srm", "FLOAT"),
            bigquery.SchemaField("ph", "FLOAT"),
            bigquery.SchemaField("attenuation_level", "FLOAT"),
            bigquery.SchemaField("volume", "JSON"),
            bigquery.SchemaField("boil_volume", "JSON"),
            bigquery.SchemaField("food_pairing", "STRING", mode="REPEATED"),
            bigquery.SchemaField("brewers_tips", "STRING"),
            bigquery.SchemaField("contributed_by", "STRING"),
            bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED"),
            bigquery.SchemaField("updated_at", "TIMESTAMP", mode="REQUIRED"),
            bigquery.SchemaField("processed_at", "TIMESTAMP", mode="REQUIRED")
        ]
    
    def _get_fact_beer_ingredients_schema(self) -> List[bigquery.SchemaField]:
        """Get schema for fact_beer_ingredients table."""
        return [
            bigquery.SchemaField("beer_id", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("ingredient_id", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("amount_value", "FLOAT"),
            bigquery.SchemaField("amount_unit", "STRING"),
            bigquery.SchemaField("add_timing", "STRING"),  # For hops
            bigquery.SchemaField("attribute", "STRING"),   # For hops
            bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED")
        ]
