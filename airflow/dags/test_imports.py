"""
Test script to verify Python path and imports.
"""
import os
import sys

print("Python Path:")
for path in sys.path:
    print(f"- {path}")

print("\nCurrent working directory:", os.getcwd())
print("\nContents of /opt/airflow/dags:")
os.system("ls -la /opt/airflow/dags")
print("\nContents of /opt/airflow/dags/src:")
os.system("ls -la /opt/airflow/dags/src")
print("\nContents of /home/tappu/data_pipeline/src:")
os.system("ls -la /home/tappu/data_pipeline/src")

print("\nTrying to import from src.main...")
try:
    from src.main import PunkBreweryPipeline
    print("Successfully imported PunkBreweryPipeline!")
except Exception as e:
    print(f"Error importing PunkBreweryPipeline: {e}")

print("\nTrying to import from src.utils.config_manager...")
try:
    from src.utils.config_manager import ConfigManager
    print("Successfully imported ConfigManager!")
except Exception as e:
    print(f"Error importing ConfigManager: {e}")
