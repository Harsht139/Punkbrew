# Punk Brewery Data Pipeline

A comprehensive data pipeline solution that extracts beer data from the Open Brewery DB API, processes it through Google Cloud Storage and BigQuery, and presents insights through a React-based dashboard.

## Project Structure

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
│   └── 📁 utils/              # Utility modules
│       ├── __init__.py
│       ├── config_manager.py
│       └── logger.py
├── 📁 frontend/               # React frontend application
│   ├── public/               # Static files
│   └── src/                  # React source code
│       ├── components/       # Reusable UI components
│       ├── pages/            # Page components
│       ├── services/         # API services
│       └── App.js            # Main application component
├── 📁 config/                 # Configuration files
│   └── config.yaml
├── 📁 tests/                  # Unit and integration tests
├── 📁 dbt/                    # dbt models and transformations
│   ├── 📁 models/
│   ├── 📁 macros/
│   ├── 📁 seeds/
│   ├── dbt_project.yml
│   └── profiles.yml
├── 📁 airflow/                # Airflow DAGs and plugins
│   ├── dags/
│   └── plugins/
├── 📁 docker/                 # Docker configurations
├── .env.example              # Example environment variables
├── requirements.txt          # Python dependencies
└── package.json              # Frontend dependencies
```

## Features

- **Data Extraction**: Fetches beer data from the [Open Brewery DB API](https://www.openbrewerydb.org/documentation)
- **Data Processing**: Cleans, transforms, and enriches raw data
- **Data Storage**: Stores processed data in Google BigQuery
- **Orchestration**: Automated workflow management with Apache Airflow
- **Frontend Dashboard**: Interactive React-based dashboard with data visualization
- **Monitoring**: Built-in data quality checks and logging

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Docker & Docker Compose
- Google Cloud SDK (for GCP integration)
- [uv](https://github.com/astral-sh/uv) (Ultra-fast Python package installer)

### Backend Setup

1. **Create and activate virtual environment using uv**:
   ```bash
   # Install uv if you haven't already
   curl -sSf https://astral.sh/uv/install.sh | sh
   
   # Create and activate virtual environment
   uv venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   
   # Install Python dependencies using uv
   uv pip install -r requirements.txt
   ```

2. **Configure Google Cloud**:
   - Create a new project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable BigQuery API
   - Create a service account with BigQuery Admin role
   - Download the JSON key file to `credentials/service-account.json`

3. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your GCP configuration
   # Make sure to set GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account.json
   ```

### Frontend Setup

1. **Install Node.js dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   # Frontend will be available at http://localhost:3000
   ```

### Running with Docker

1. **Start the backend services**:
   ```bash
   cd airflow
   docker compose up -d
   ```
   - Access Airflow UI: http://localhost:8080
   - Default credentials: `airflow` / `airflow`

2. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm start
   ```
   - Access the dashboard: http://localhost:3000

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```ini
# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account.json
GCP_PROJECT_ID=your-project-id
GCP_DATASET=brewery_data
GCP_TABLE=beers

# Airflow
AIRFLOW_UID=$(id -u)
AIRFLOW_GID=0

# API
PUNK_API_BASE_URL=https://api.punkapi.com/v2
```

## Data Model

The pipeline creates and maintains the following tables in BigQuery:

### `beers`
- `id` (INTEGER): Unique beer identifier
- `name` (STRING): Name of the beer
- `tagline` (STRING): Short description
- `first_brewed` (STRING): Date of first brew (MM/YYYY)
- `description` (STRING): Full description
- `abv` (FLOAT): Alcohol by volume
- `ibu` (FLOAT): International Bitterness Units
- `target_fg` (FLOAT): Target final gravity
- `target_og` (FLOAT): Target original gravity
- `ebc` (FLOAT): European Brewery Convention color
- `srm` (FLOAT): Standard Reference Method
- `ph` (FLOAT): pH value
- `attenuation_level` (FLOAT): Attenuation level
- `volume` (RECORD): Volume information
- `boil_volume` (RECORD): Boil volume information
- `method` (RECORD): Brewing method details
- `ingredients` (RECORD): List of ingredients
- `food_pairing` (STRING[]): Suggested food pairings
- `brewers_tips` (STRING): Brewing tips
- `contributed_by` (STRING): Contributor information
- `created_at` (TIMESTAMP): When the record was created

## 🛠️ Development

### Running Tests
```bash
pytest tests/
```

### Code Formatting
```bash
# Auto-format code
black .

# Sort imports
isort .

# Check for style issues
flake8
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  Acknowledgments

- [Punk API](https://punkapi.com/) for providing the beer data
- [Apache Airflow](https://airflow.apache.org/) for workflow orchestration
- [Google Cloud Platform](https://cloud.google.com/) for data infrastructure
