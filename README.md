# 🍺 Punk Brewery Data Pipeline & Analytics Dashboard

## Project Overview
A comprehensive data pipeline solution that extracts beer data from the Punk API, processes it through Google Cloud Storage and BigQuery, and presents insights through DataStudio dashboards.

## Architecture
```
Punk API → Cloud Storage (Staging) → BigQuery (Data Warehouse) → DataStudio Dashboard
```

## Technology Stack
- **Data Pipeline**: Python, Apache Airflow
- **Cloud Platform**: Google Cloud Platform
- **Storage**: Google Cloud Storage, BigQuery
- **Visualization**: Google DataStudio/LookerStudio
- **Data Transformation**: dbt (data build tool)
- **Containerization**: Docker
- **Version Control**: Git

## Project Structure
```
data_pipeline/
├── src/                    # Source code
│   ├── extract/           # Data extraction modules
│   ├── transform/         # Data transformation logic
│   ├── load/             # Data loading utilities
│   └── utils/            # Common utilities
├── config/               # Configuration files
├── tests/                # Unit and integration tests
├── dbt/                  # dbt models and transformations
├── airflow/              # Airflow DAGs and plugins
├── docker/               # Docker configurations
├── sql/                  # SQL scripts and schemas
├── docs/                 # Documentation
└── scripts/              # Deployment and utility scripts
```

## Quick Start
1. **Setup Environment**: `pip install -r requirements.txt`
2. **Configure GCP**: Update `config/gcp_config.yaml`
3. **Run Tests**: `pytest tests/`
4. **Start Pipeline**: `python src/main.py`

## Dashboard Features
- Beer trends analysis by category (Ale, Lager, Other)
- Interactive ingredient exploration
- Educational beer terminology
- Drill-down capabilities from category to individual beers

## Development Timeline
- **Week 1**: Project setup and API analysis
- **Week 2**: Data extraction and Cloud Storage
- **Week 3**: BigQuery data warehouse design
- **Week 4**: Pipeline orchestration with Airflow
- **Week 5**: DataStudio dashboard development

## Contributing
Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) before submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
