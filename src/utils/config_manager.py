"""
Configuration Manager for Punk Brewery Data Pipeline

Handles loading and managing configuration settings from various sources
including YAML files, environment variables, and default values.
"""

import os
import yaml
from typing import Dict, Any, Optional, List
from pathlib import Path
from dataclasses import dataclass


@dataclass
class FallbackAPI:
    """Configuration for a fallback API."""
    url: str
    type: str
    enabled: bool


@dataclass
class APIConfig:
    """Configuration for API sources with fallback support."""
    primary_url: str
    fallback_apis: List[FallbackAPI]
    timeout: int
    retry_attempts: int
    rate_limit_delay: float
    fallback_enabled: bool


@dataclass
class GCPConfig:
    """Configuration for Google Cloud Platform services."""
    project_id: str
    storage_bucket: str
    bigquery_dataset: str
    credentials_path: Optional[str]
    location: str


@dataclass
class PipelineConfig:
    """Configuration for pipeline execution."""
    batch_size: int
    max_workers: int
    staging_path: str
    data_retention_days: int


class ConfigManager:
    """Manages configuration for the Punk Brewery data pipeline."""
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize configuration manager.
        
        Args:
            config_path: Path to configuration file. If None, uses default config.
        """
        self.config_path = config_path or self._get_default_config_path()
        self._config = self._load_config()
    
    def _get_default_config_path(self) -> str:
        """Get default configuration file path."""
        return str(Path(__file__).parent.parent.parent / "config" / "config.yaml")
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file and environment variables."""
        config = {}
        
        # Load from YAML file if it exists
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f) or {}
        
        # Override with environment variables
        config = self._apply_env_overrides(config)
        
        # Apply defaults
        config = self._apply_defaults(config)
        
        return config
    
    def _apply_env_overrides(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Apply environment variable overrides to configuration."""
        env_mappings = {
            'PUNK_API_BASE_URL': ['api', 'base_url'],
            'GCP_PROJECT_ID': ['gcp', 'project_id'],
            'GCP_STORAGE_BUCKET': ['gcp', 'storage_bucket'],
            'GCP_BIGQUERY_DATASET': ['gcp', 'bigquery_dataset'],
            'GOOGLE_APPLICATION_CREDENTIALS': ['gcp', 'credentials_path'],
            'GCP_LOCATION': ['gcp', 'location'],
            'PIPELINE_BATCH_SIZE': ['pipeline', 'batch_size'],
            'PIPELINE_MAX_WORKERS': ['pipeline', 'max_workers'],
        }
        
        for env_var, config_path in env_mappings.items():
            value = os.getenv(env_var)
            if value:
                # Navigate to nested config and set value
                current = config
                for key in config_path[:-1]:
                    current = current.setdefault(key, {})
                
                # Convert to appropriate type
                if config_path[-1] in ['batch_size', 'max_workers', 'timeout', 'retry_attempts']:
                    value = int(value)
                elif config_path[-1] in ['rate_limit_delay']:
                    value = float(value)
                
                current[config_path[-1]] = value
        
        return config
    
    def _apply_defaults(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Apply default values to configuration."""
        defaults = {
            'api': {
                'base_url': 'https://api.punkapi.com/v2',
                'timeout': 30,
                'retry_attempts': 3,
                'rate_limit_delay': 1.0
            },
            'gcp': {
                'project_id': 'punk-brewery-pipeline',
                'storage_bucket': 'punk-brewery-staging',
                'bigquery_dataset': 'punk_brewery_dw',
                'location': 'US',
                'credentials_path': None
            },
            'pipeline': {
                'batch_size': 100,
                'max_workers': 4,
                'staging_path': 'staging/beers',
                'data_retention_days': 30
            }
        }
        
        # Deep merge defaults with config
        return self._deep_merge(defaults, config)
    
    def _deep_merge(self, default: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
        """Deep merge two dictionaries."""
        result = default.copy()
        
        for key, value in override.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._deep_merge(result[key], value)
            else:
                result[key] = value
        
        return result
    
    @property
    def api(self) -> APIConfig:
        """Get API configuration."""
        api_config = self._config['api']
        return APIConfig(
            base_url=api_config['base_url'],
            timeout=api_config['timeout'],
            retry_attempts=api_config['retry_attempts'],
            rate_limit_delay=api_config['rate_limit_delay']
        )
    
    @property
    def gcp(self) -> GCPConfig:
        """Get GCP configuration."""
        gcp_config = self._config['gcp']
        return GCPConfig(
            project_id=gcp_config['project_id'],
            storage_bucket=gcp_config['storage_bucket'],
            bigquery_dataset=gcp_config['bigquery_dataset'],
            credentials_path=gcp_config.get('credentials_path'),
            location=gcp_config['location']
        )
    
    @property
    def pipeline(self) -> PipelineConfig:
        """Get pipeline configuration."""
        pipeline_config = self._config['pipeline']
        return PipelineConfig(
            batch_size=pipeline_config['batch_size'],
            max_workers=pipeline_config['max_workers'],
            staging_path=pipeline_config['staging_path'],
            data_retention_days=pipeline_config['data_retention_days']
        )
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by key."""
        keys = key.split('.')
        value = self._config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def to_dict(self) -> Dict[str, Any]:
        """Return configuration as dictionary."""
        return self._config.copy()
