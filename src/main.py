#!/usr/bin/env python3
"""
Punk Brewery Data Pipeline - Main Entry Point

This is the main orchestration script for the Punk Brewery data pipeline.
It coordinates the extraction, transformation, and loading of beer data
from the Punk API to BigQuery via Cloud Storage.
"""

import sys
import logging
from pathlib import Path
from typing import Optional
import click
from rich.console import Console
from rich.logging import RichHandler

# Add src to path for imports
sys.path.append(str(Path(__file__).parent))

from extract.punk_api_extractor import PunkAPIExtractor
from transform.beer_transformer import BeerTransformer
from load.bigquery_loader import BigQueryLoader
from utils.config_manager import ConfigManager
from utils.logger import setup_logger

console = Console()
logger = setup_logger(__name__)


class PunkBreweryPipeline:
    """Main pipeline orchestrator for Punk Brewery data processing."""
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the pipeline with configuration."""
        self.config = ConfigManager(config_path)
        self.extractor = PunkAPIExtractor(self.config)
        self.transformer = BeerTransformer(self.config)
        self.loader = BigQueryLoader(self.config)
    
    def run_full_pipeline(self, start_date: Optional[str] = None, end_date: Optional[str] = None):
        """Run the complete data pipeline."""
        try:
            console.print("🍺 [bold green]Starting Punk Brewery Data Pipeline[/bold green]")
            
            # Step 1: Extract data from Punk API
            console.print("📥 [blue]Extracting data from Punk API...[/blue]")
            raw_data = self.extractor.extract_beer_data(start_date, end_date)
            logger.info(f"Extracted {len(raw_data)} beer records")
            
            # Step 2: Transform and categorize data
            console.print("🔄 [yellow]Transforming and categorizing beer data...[/yellow]")
            transformed_data = self.transformer.transform_beer_data(raw_data)
            logger.info(f"Transformed {len(transformed_data)} beer records")
            
            # Step 3: Load data to BigQuery
            console.print("📤 [magenta]Loading data to BigQuery...[/magenta]")
            self.loader.load_to_bigquery(transformed_data)
            logger.info("Data successfully loaded to BigQuery")
            
            console.print("✅ [bold green]Pipeline completed successfully![/bold green]")
            
        except Exception as e:
            logger.error(f"Pipeline failed: {str(e)}")
            console.print(f"❌ [bold red]Pipeline failed: {str(e)}[/bold red]")
            raise
    
    def run_incremental_update(self):
        """Run incremental data update based on last processed date."""
        try:
            console.print("🔄 [blue]Running incremental update...[/blue]")
            
            # Get last processed date from BigQuery
            last_date = self.loader.get_last_processed_date()
            logger.info(f"Last processed date: {last_date}")
            
            # Run pipeline from last date
            self.run_full_pipeline(start_date=last_date)
            
        except Exception as e:
            logger.error(f"Incremental update failed: {str(e)}")
            raise


@click.command()
@click.option('--mode', type=click.Choice(['full', 'incremental']), default='incremental',
              help='Pipeline execution mode')
@click.option('--start-date', help='Start date for data extraction (YYYY-MM-DD)')
@click.option('--end-date', help='End date for data extraction (YYYY-MM-DD)')
@click.option('--config', help='Path to configuration file')
def main(mode: str, start_date: Optional[str], end_date: Optional[str], config: Optional[str]):
    """
    Punk Brewery Data Pipeline
    
    Extract beer data from Punk API, transform it, and load to BigQuery.
    """
    try:
        pipeline = PunkBreweryPipeline(config)
        
        if mode == 'full':
            pipeline.run_full_pipeline(start_date, end_date)
        else:
            pipeline.run_incremental_update()
            
    except Exception as e:
        console.print(f"❌ [bold red]Pipeline execution failed: {str(e)}[/bold red]")
        sys.exit(1)


if __name__ == "__main__":
    main()
