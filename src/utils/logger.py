"""
Logging utilities for Punk Brewery Data Pipeline

Provides centralized logging configuration with support for different
output formats, log levels, and integration with Google Cloud Logging.
"""

import logging
import sys
from typing import Optional
from pathlib import Path
from rich.logging import RichHandler
from rich.console import Console


def setup_logger(
    name: str,
    level: str = "INFO",
    log_file: Optional[str] = None,
    use_rich: bool = True,
    use_gcp_logging: bool = False
) -> logging.Logger:
    """
    Set up a logger with rich formatting and optional file output.
    
    Args:
        name: Logger name
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional file path for log output
        use_rich: Whether to use rich formatting for console output
        use_gcp_logging: Whether to enable Google Cloud Logging
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Clear existing handlers to avoid duplicates
    logger.handlers.clear()
    
    # Set log level
    log_level = getattr(logging, level.upper(), logging.INFO)
    logger.setLevel(log_level)
    
    # Create formatter
    formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler with rich formatting
    if use_rich:
        console_handler = RichHandler(
            console=Console(stderr=True),
            show_time=True,
            show_path=True,
            markup=True,
            rich_tracebacks=True
        )
        console_handler.setFormatter(
            logging.Formatter(fmt='%(message)s', datefmt='%Y-%m-%d %H:%M:%S')
        )
    else:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
    
    console_handler.setLevel(log_level)
    logger.addHandler(console_handler)
    
    # File handler (optional)
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        file_handler.setLevel(log_level)
        logger.addHandler(file_handler)
    
    # Google Cloud Logging (optional)
    if use_gcp_logging:
        try:
            from google.cloud import logging as gcp_logging
            
            client = gcp_logging.Client()
            gcp_handler = client.get_default_handler()
            gcp_handler.setFormatter(formatter)
            logger.addHandler(gcp_handler)
            
        except ImportError:
            logger.warning("Google Cloud Logging not available. Install google-cloud-logging.")
        except Exception as e:
            logger.warning(f"Failed to setup Google Cloud Logging: {e}")
    
    return logger


class PipelineLogger:
    """Context manager for pipeline logging with progress tracking."""
    
    def __init__(self, name: str, operation: str):
        """
        Initialize pipeline logger.
        
        Args:
            name: Logger name
            operation: Operation being performed
        """
        self.logger = setup_logger(name)
        self.operation = operation
        self.start_time = None
    
    def __enter__(self):
        """Enter context and log start of operation."""
        import time
        self.start_time = time.time()
        self.logger.info(f"Starting {self.operation}")
        return self.logger
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Exit context and log completion or error."""
        import time
        duration = time.time() - self.start_time if self.start_time else 0
        
        if exc_type is None:
            self.logger.info(f"Completed {self.operation} in {duration:.2f}s")
        else:
            self.logger.error(f"Failed {self.operation} after {duration:.2f}s: {exc_val}")
        
        return False  # Don't suppress exceptions


def log_function_call(func):
    """Decorator to log function calls with parameters and execution time."""
    import functools
    import time
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger = setup_logger(func.__module__)
        
        # Log function call
        logger.debug(f"Calling {func.__name__} with args={args}, kwargs={kwargs}")
        
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            logger.debug(f"{func.__name__} completed in {duration:.2f}s")
            return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"{func.__name__} failed after {duration:.2f}s: {e}")
            raise
    
    return wrapper


def get_pipeline_logger(module_name: str) -> logging.Logger:
    """
    Get a standardized logger for pipeline modules.
    
    Args:
        module_name: Name of the module requesting the logger
    
    Returns:
        Configured logger instance
    """
    return setup_logger(
        name=f"punk_brewery.{module_name}",
        level="INFO",
        use_rich=True
    )
