"""
Punk API Data Extractor

Handles extraction of beer data from the Punk API with support for
incremental loading, rate limiting, and error handling.
"""

import asyncio
import aiohttp
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, AsyncGenerator
from dataclasses import dataclass
import json
from pathlib import Path

from ..utils.config_manager import ConfigManager
from ..utils.logger import get_pipeline_logger, log_function_call


@dataclass
class ExtractionMetrics:
    """Metrics for data extraction process."""
    total_records: int = 0
    successful_records: int = 0
    failed_records: int = 0
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    
    @property
    def duration(self) -> Optional[timedelta]:
        """Calculate extraction duration."""
        if self.start_time and self.end_time:
            return self.end_time - self.start_time
        return None


class PunkAPIExtractor:
    """Extracts beer data from the Punk API."""
    
    def __init__(self, config: ConfigManager):
        """
        Initialize the Punk API extractor.
        
        Args:
            config: Configuration manager instance
        """
        self.config = config
        self.logger = get_pipeline_logger("extractor")
        self.base_url = config.api.base_url
        self.timeout = config.api.timeout
        self.retry_attempts = config.api.retry_attempts
        self.rate_limit_delay = config.api.rate_limit_delay
        
    @log_function_call
    def extract_beer_data(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        page_size: int = 80
    ) -> List[Dict[str, Any]]:
        """
        Extract beer data from Punk API.
        
        Args:
            start_date: Start date for filtering (YYYY-MM-DD format)
            end_date: End date for filtering (YYYY-MM-DD format)
            page_size: Number of records per page (max 80 for Punk API)
        
        Returns:
            List of beer records
        """
        metrics = ExtractionMetrics(start_time=datetime.now())
        
        try:
            # Run async extraction
            beer_data = asyncio.run(
                self._extract_async(start_date, end_date, page_size, metrics)
            )
            
            metrics.end_time = datetime.now()
            metrics.total_records = len(beer_data)
            metrics.successful_records = len(beer_data)
            
            self.logger.info(
                f"Extraction completed: {metrics.successful_records} records "
                f"in {metrics.duration.total_seconds():.2f}s"
            )
            
            return beer_data
            
        except Exception as e:
            metrics.end_time = datetime.now()
            self.logger.error(f"Extraction failed: {e}")
            raise
    
    async def _extract_async(
        self,
        start_date: Optional[str],
        end_date: Optional[str],
        page_size: int,
        metrics: ExtractionMetrics
    ) -> List[Dict[str, Any]]:
        """Async extraction of beer data."""
        all_beers = []
        
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(self.timeout)) as session:
            page = 1
            
            while True:
                self.logger.debug(f"Fetching page {page}")
                
                # Build URL with parameters
                url = f"{self.base_url}/beers"
                params = {
                    'page': page,
                    'per_page': page_size
                }
                
                # Add date filters if provided
                if start_date:
                    params['brewed_after'] = start_date
                if end_date:
                    params['brewed_before'] = end_date
                
                # Fetch page data
                page_data = await self._fetch_page_with_retry(session, url, params)
                
                if not page_data:
                    self.logger.info(f"No more data found at page {page}")
                    break
                
                all_beers.extend(page_data)
                self.logger.info(f"Fetched {len(page_data)} beers from page {page}")
                
                # Check if we got less than requested (last page)
                if len(page_data) < page_size:
                    self.logger.info("Reached last page")
                    break
                
                page += 1
                
                # Rate limiting
                await asyncio.sleep(self.rate_limit_delay)
        
        return all_beers
    
    async def _fetch_page_with_retry(
        self,
        session: aiohttp.ClientSession,
        url: str,
        params: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Fetch a single page with retry logic."""
        for attempt in range(self.retry_attempts):
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    elif response.status == 429:  # Rate limited
                        wait_time = 2 ** attempt
                        self.logger.warning(f"Rate limited, waiting {wait_time}s")
                        await asyncio.sleep(wait_time)
                    else:
                        self.logger.warning(f"HTTP {response.status} for {url}")
                        
            except asyncio.TimeoutError:
                self.logger.warning(f"Timeout on attempt {attempt + 1}")
            except Exception as e:
                self.logger.warning(f"Error on attempt {attempt + 1}: {e}")
            
            if attempt < self.retry_attempts - 1:
                wait_time = 2 ** attempt
                await asyncio.sleep(wait_time)
        
        self.logger.error(f"Failed to fetch {url} after {self.retry_attempts} attempts")
        return []
    
    @log_function_call
    def extract_beer_by_id(self, beer_id: int) -> Optional[Dict[str, Any]]:
        """
        Extract a specific beer by ID.
        
        Args:
            beer_id: Beer ID to fetch
        
        Returns:
            Beer data or None if not found
        """
        return asyncio.run(self._extract_beer_by_id_async(beer_id))
    
    async def _extract_beer_by_id_async(self, beer_id: int) -> Optional[Dict[str, Any]]:
        """Async extraction of single beer by ID."""
        url = f"{self.base_url}/beers/{beer_id}"
        
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(self.timeout)) as session:
            try:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data[0] if data else None
                    else:
                        self.logger.warning(f"Beer {beer_id} not found (HTTP {response.status})")
                        return None
                        
            except Exception as e:
                self.logger.error(f"Error fetching beer {beer_id}: {e}")
                return None
    
    @log_function_call
    def extract_random_beers(self, count: int = 10) -> List[Dict[str, Any]]:
        """
        Extract random beers from the API.
        
        Args:
            count: Number of random beers to fetch
        
        Returns:
            List of random beer records
        """
        return asyncio.run(self._extract_random_beers_async(count))
    
    async def _extract_random_beers_async(self, count: int) -> List[Dict[str, Any]]:
        """Async extraction of random beers."""
        beers = []
        
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(self.timeout)) as session:
            for _ in range(count):
                url = f"{self.base_url}/beers/random"
                
                try:
                    async with session.get(url) as response:
                        if response.status == 200:
                            data = await response.json()
                            if data:
                                beers.append(data[0])
                        
                    # Rate limiting
                    await asyncio.sleep(self.rate_limit_delay)
                    
                except Exception as e:
                    self.logger.warning(f"Error fetching random beer: {e}")
        
        return beers
    
    @log_function_call
    def save_raw_data(self, data: List[Dict[str, Any]], file_path: str) -> None:
        """
        Save raw extracted data to JSON file.
        
        Args:
            data: Beer data to save
            file_path: Path to save the data
        """
        output_path = Path(file_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        self.logger.info(f"Saved {len(data)} records to {file_path}")
    
    def get_api_info(self) -> Dict[str, Any]:
        """Get information about the Punk API."""
        return {
            'base_url': self.base_url,
            'timeout': self.timeout,
            'retry_attempts': self.retry_attempts,
            'rate_limit_delay': self.rate_limit_delay
        }
