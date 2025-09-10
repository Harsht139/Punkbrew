# 🍺 Punk Brewery Data Pipeline - Project Structure

## Overview
This document provides a comprehensive overview of the project structure and explains the purpose of each component in the Punk Brewery Data Pipeline.

## Directory Structure

```
data_pipeline/
├── 📁 src/                     # Source code
│   ├── 📁 extract/            # Data extraction modules
│   │   ├── __init__.py
│   │   └── punk_api_extractor.py
│   ├── 📁 transform/          # Data transformation modules
│   │   ├── __init__.py
│   │   └── beer_transformer.py
│   ├── 📁 load/               # Data loading modules
│   │   ├── __init__.py
│   │   └── bigquery_loader.py
│   ├── 📁 utils/              # Utility modules
│   │   ├── __init__.py
│   │   ├── config_manager.py
│   │   └── logger.py
│   ├── __init__.py
│   └── main.py                # Main entry point
├── 📁 config/                 # Configuration files
│   └── config.yaml
├── 📁 tests/                  # Unit and integration tests
│   └── test_extractor.py
├── 📁 dbt/                    # dbt models and transformations
│   ├── 📁 models/
│   │   ├── 📁 staging/
│   │   │   ├── sources.yml
│   │   │   └── stg_beers.sql
│   │   └── 📁 marts/
│   │       └── 📁 core/
│   │           ├── dim_beer_categories.sql
│   │           └── fact_beer_analytics.sql
│   ├── 📁 macros/
│   ├── 📁 seeds/
│   ├── 📁 snapshots/
│   ├── dbt_project.yml
│   └── profiles.yml
├── 📁 airflow/                # Airflow DAGs and plugins
│   ├── 📁 dags/
│   │   └── punk_brewery_pipeline_dag.py
│   └── 📁 plugins/
├── 📁 docker/                 # Docker configurations
├── 📁 sql/                    # SQL scripts and schemas
│   ├── 📁 schemas/
│   │   └── bigquery_schema.sql
│   └── 📁 queries/
├── 📁 docs/                   # Documentation
│   └── PROJECT_STRUCTURE.md
├── 📁 scripts/                # Deployment and utility scripts
│   └── setup.sh
├── 📁 notebooks/              # Jupyter notebooks for exploration
├── 📄 requirements.txt        # Python dependencies
├── 📄 Dockerfile             # Docker image definition
├── 📄 docker-compose.yml     # Docker Compose configuration
├── 📄 Makefile               # Development commands
├── 📄 .env.example           # Environment variables template
├── 📄 .gitignore             # Git ignore rules
└── 📄 README.md              # Project documentation
```

## Component Details

### 🔧 Core Application (`src/`)

#### **Main Entry Point**
- `main.py` - Orchestrates the entire pipeline execution
- Provides CLI interface with different execution modes
- Handles error management and logging

#### **Extract Module (`extract/`)**
- `punk_api_extractor.py` - Handles data extraction from Punk API
- Features:
  - Asynchronous HTTP requests for performance
  - Rate limiting and retry logic
  - Incremental data loading support
  - Error handling and metrics collection

#### **Transform Module (`transform/`)**
- `beer_transformer.py` - Transforms and categorizes raw beer data
- Features:
  - Beer categorization based on yeast types and styles
  - Data cleaning and validation
  - Ingredient parsing and standardization
  - Business logic implementation

#### **Load Module (`load/`)**
- `bigquery_loader.py` - Loads data into BigQuery
- Features:
  - Staging through Cloud Storage
  - Incremental loading with merge operations
  - Schema management and validation
  - Data quality checks

#### **Utilities (`utils/`)**
- `config_manager.py` - Configuration management
- `logger.py` - Centralized logging setup

### 📊 Data Transformation (`dbt/`)

#### **Models Structure**
- **Staging Models** (`models/staging/`)
  - `stg_beers.sql` - Cleans and standardizes raw data
  - `sources.yml` - Defines data sources and tests

- **Marts Models** (`models/marts/core/`)
  - `dim_beer_categories.sql` - Beer category dimension table
  - `fact_beer_analytics.sql` - Main analytical fact table

#### **Configuration**
- `dbt_project.yml` - dbt project configuration
- `profiles.yml` - Database connection profiles

### 🔄 Orchestration (`airflow/`)

#### **DAGs**
- `punk_brewery_pipeline_dag.py` - Main pipeline orchestration
- Features:
  - Daily scheduling
  - Task dependencies
  - Error handling and retries
  - Data quality checks

### 🗄️ Database Schema (`sql/`)

#### **Schema Definitions**
- `bigquery_schema.sql` - Complete BigQuery schema
- Includes:
  - Staging tables
  - Dimension tables
  - Fact tables
  - Analytical views

### 🧪 Testing (`tests/`)

#### **Test Structure**
- `test_extractor.py` - Unit tests for API extraction
- Covers:
  - API interaction testing
  - Error handling validation
  - Data format verification

### 🐳 Containerization

#### **Docker Configuration**
- `Dockerfile` - Application container definition
- `docker-compose.yml` - Multi-service orchestration
- Features:
  - Production-ready container
  - Development environment setup
  - Optional monitoring services

### ⚙️ Configuration & Setup

#### **Configuration Files**
- `config/config.yaml` - Application configuration
- `.env.example` - Environment variables template
- `requirements.txt` - Python dependencies

#### **Development Tools**
- `Makefile` - Development commands and shortcuts
- `scripts/setup.sh` - Automated environment setup
- `.gitignore` - Version control exclusions

## Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Punk API      │───▶│  Cloud Storage   │───▶│   BigQuery      │
│                 │    │   (Staging)      │    │ (Data Warehouse)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │   DataStudio    │
                                               │   Dashboard     │
                                               └─────────────────┘
```

## Key Features

### 🚀 **Performance & Scalability**
- Asynchronous data extraction
- Partitioned and clustered BigQuery tables
- Incremental data processing
- Containerized deployment

### 🔍 **Data Quality**
- Comprehensive data validation
- dbt tests and documentation
- Error handling and monitoring
- Data lineage tracking

### 📈 **Analytics Ready**
- Pre-built analytical views
- Beer categorization logic
- Trend analysis capabilities
- Dashboard-optimized data models

### 🛠️ **Developer Experience**
- Comprehensive testing suite
- Automated setup scripts
- Clear documentation
- Makefile for common tasks

## Getting Started

1. **Setup Environment**
   ```bash
   make setup
   ```

2. **Configure Credentials**
   ```bash
   cp .env.example .env
   # Edit .env with your GCP credentials
   ```

3. **Run Tests**
   ```bash
   make test
   ```

4. **Execute Pipeline**
   ```bash
   make run-pipeline
   ```

## Next Steps

- Set up Google Cloud Platform credentials
- Configure BigQuery datasets
- Deploy Airflow for scheduling
- Create DataStudio dashboards
- Set up monitoring and alerting
