-- =====================================================
-- PUNK BREWERY DATA PIPELINE - DATABASE SCHEMA
-- =====================================================
-- Project: Punk Brewery Dashboard Migration
-- Dataset: punkbrew.punkbrew_warehouse
-- Created: 2025-01-10
-- Last Updated: 2025-01-10
-- =====================================================

-- =====================================================
-- CURRENT PRODUCTION SCHEMA
-- =====================================================
-- Table: staging_beers (Currently Active)
-- Records: 8,400+ brewery-based beer records
-- Source: Open Brewery DB API (fallback from Punk API)
-- =====================================================

CREATE OR REPLACE TABLE `punkbrew.punkbrew_warehouse.staging_beers` (
  -- Primary Identifiers
  beer_id STRING,                    -- Unique beer identifier (brewery_XXXXX format)
  name STRING,                       -- Beer name (e.g., "Brewery Name House Beer")
  
  -- Beer Description
  tagline STRING,                    -- Short description/tagline
  description STRING,                -- Detailed beer description
  image_url STRING,                  -- URL to beer image (mostly NULL for brewery data)
  
  -- Brewing Information
  first_brewed STRING,               -- First brewed date (mostly NULL for brewery data)
  abv FLOAT64,                       -- Alcohol by Volume percentage
  ibu INT64,                         -- International Bitterness Units
  target_fg STRING,                  -- Target Final Gravity (mostly NULL)
  target_og STRING,                  -- Target Original Gravity (mostly NULL)
  ebc STRING,                        -- European Brewery Convention color (mostly NULL)
  srm STRING,                        -- Standard Reference Method color (mostly NULL)
  ph STRING,                         -- pH level (mostly NULL)
  attenuation_level STRING,          -- Attenuation level (mostly NULL)
  
  -- Volume Information
  volume STRING,                     -- Volume information as JSON string
  boil_volume STRING,                -- Boil volume information as JSON string
  
  -- Categorization
  category STRING NOT NULL,          -- Primary category: ale, lager, other
  subcategory STRING,                -- Brewery type: micro, brewpub, regional, etc.
  category_confidence FLOAT64,       -- Confidence score for categorization (0.0-1.0)
  
  -- Recipe Information
  ingredients STRING,                -- Ingredients as JSON string (mostly empty for brewery data)
  method STRING,                     -- Brewing method as JSON string (mostly empty)
  
  -- Pairing and Tips
  food_pairing ARRAY<STRING>,        -- Food pairing suggestions
  brewers_tips STRING,               -- Brewer's tips and recommendations
  
  -- Metadata
  contributed_by STRING,             -- Data source contributor
  processed_at TIMESTAMP NOT NULL,   -- When record was processed
  data_version STRING NOT NULL       -- Data version (e.g., "v1.0_openbrewery_db")
)
PARTITION BY DATE(processed_at)
CLUSTER BY category, subcategory;

-- =====================================================
-- ENHANCED SCHEMA (Future Implementation)
-- =====================================================
-- This schema includes additional fields for geographic
-- and brewery information when available
-- =====================================================

CREATE OR REPLACE TABLE `punkbrew.punkbrew_warehouse.staging_beers_enhanced` (
  -- Primary Identifiers
  beer_id STRING NOT NULL,
  name STRING NOT NULL,
  
  -- Beer Description
  tagline STRING,
  description STRING,
  image_url STRING,
  
  -- Brewing Information
  first_brewed DATE,                 -- Proper DATE type
  abv FLOAT64,
  ibu INT64,
  target_fg FLOAT64,                 -- Proper numeric type
  target_og FLOAT64,                 -- Proper numeric type
  ebc INT64,                         -- Proper numeric type
  srm INT64,                         -- Proper numeric type
  ph FLOAT64,                        -- Proper numeric type
  attenuation_level FLOAT64,         -- Proper numeric type
  
  -- Volume Information (Structured)
  volume_value FLOAT64,              -- Volume amount
  volume_unit STRING,                -- Volume unit (liters, gallons, etc.)
  boil_volume_value FLOAT64,         -- Boil volume amount
  boil_volume_unit STRING,           -- Boil volume unit
  
  -- Categorization
  category STRING NOT NULL,
  subcategory STRING,
  category_confidence FLOAT64,
  
  -- Recipe Information (Structured)
  ingredients JSON,                  -- Structured ingredients data
  method JSON,                       -- Structured brewing method
  
  -- Pairing and Tips
  food_pairing ARRAY<STRING>,
  brewers_tips STRING,
  
  -- Brewery Information (Enhanced)
  brewery_name STRING,               -- Actual brewery name
  brewery_type STRING,               -- Type of brewery
  brewery_address STRING,            -- Full address
  brewery_city STRING,               -- City
  brewery_state STRING,              -- State/Province
  brewery_country STRING,            -- Country
  brewery_postal_code STRING,        -- Postal/ZIP code
  brewery_phone STRING,              -- Phone number
  brewery_website STRING,            -- Website URL
  brewery_latitude FLOAT64,          -- Latitude coordinate
  brewery_longitude FLOAT64,         -- Longitude coordinate
  
  -- Metadata
  contributed_by STRING,
  processed_at TIMESTAMP NOT NULL,
  data_version STRING NOT NULL,
  
  -- Data Quality
  data_quality_score FLOAT64,       -- Overall data quality score
  has_geographic_data BOOLEAN,       -- Whether geographic data is available
  has_brewing_data BOOLEAN           -- Whether detailed brewing data is available
)
PARTITION BY DATE(processed_at)
CLUSTER BY category, brewery_country, brewery_state;

-- =====================================================
-- ANALYTICAL VIEWS
-- =====================================================

-- Beer Category Summary View
CREATE OR REPLACE VIEW `punkbrew.punkbrew_warehouse.beer_categories` AS
SELECT 
  category,
  subcategory,
  COUNT(*) as beer_count,
  ROUND(AVG(abv), 2) as avg_abv,
  ROUND(AVG(ibu), 0) as avg_ibu,
  MIN(abv) as min_abv,
  MAX(abv) as max_abv,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM `punkbrew.punkbrew_warehouse.staging_beers`
WHERE category IS NOT NULL
GROUP BY category, subcategory
ORDER BY beer_count DESC;

-- ABV Distribution View
CREATE OR REPLACE VIEW `punkbrew.punkbrew_warehouse.abv_distribution` AS
SELECT 
  CASE 
    WHEN abv < 3.0 THEN 'Low (< 3%)'
    WHEN abv < 5.0 THEN 'Moderate (3-5%)'
    WHEN abv < 7.0 THEN 'Standard (5-7%)'
    WHEN abv < 9.0 THEN 'Strong (7-9%)'
    ELSE 'Very Strong (9%+)'
  END as abv_range,
  COUNT(*) as beer_count,
  ROUND(AVG(abv), 2) as avg_abv_in_range,
  category
FROM `punkbrew.punkbrew_warehouse.staging_beers`
WHERE abv IS NOT NULL
GROUP BY abv_range, category
ORDER BY MIN(abv);

-- Data Quality Summary View
CREATE OR REPLACE VIEW `punkbrew.punkbrew_warehouse.data_quality` AS
SELECT 
  data_version,
  COUNT(*) as total_records,
  COUNT(CASE WHEN abv IS NOT NULL THEN 1 END) as records_with_abv,
  COUNT(CASE WHEN ibu IS NOT NULL THEN 1 END) as records_with_ibu,
  COUNT(CASE WHEN description IS NOT NULL THEN 1 END) as records_with_description,
  ROUND(COUNT(CASE WHEN abv IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 2) as abv_completeness_pct,
  MIN(processed_at) as first_processed,
  MAX(processed_at) as last_processed
FROM `punkbrew.punkbrew_warehouse.staging_beers`
GROUP BY data_version
ORDER BY last_processed DESC;

-- =====================================================
-- SAMPLE QUERIES FOR DASHBOARD
-- =====================================================

-- Query 1: Beer Category Distribution (Pie Chart)
/*
SELECT 
  category,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM `punkbrew.punkbrew_warehouse.staging_beers`
GROUP BY category
ORDER BY count DESC;
*/

-- Query 2: ABV Distribution by Category (Histogram)
/*
SELECT 
  category,
  ROUND(abv, 0) as abv_rounded,
  COUNT(*) as count
FROM `punkbrew.punkbrew_warehouse.staging_beers`
WHERE abv IS NOT NULL
GROUP BY category, abv_rounded
ORDER BY category, abv_rounded;
*/

-- Query 3: Brewery Type Analysis (Bar Chart)
/*
SELECT 
  subcategory as brewery_type,
  COUNT(*) as brewery_count,
  ROUND(AVG(abv), 1) as avg_abv
FROM `punkbrew.punkbrew_warehouse.staging_beers`
WHERE subcategory IS NOT NULL
GROUP BY subcategory
ORDER BY brewery_count DESC
LIMIT 10;
*/

-- Query 4: Top Beer Names (Table)
/*
SELECT 
  name,
  category,
  subcategory,
  abv,
  ibu,
  SUBSTR(description, 1, 100) as description_preview
FROM `punkbrew.punkbrew_warehouse.staging_beers`
ORDER BY name
LIMIT 20;
*/

-- =====================================================
-- INDEXES AND OPTIMIZATION
-- =====================================================

-- The table is already optimized with:
-- 1. PARTITION BY DATE(processed_at) - for time-based queries
-- 2. CLUSTER BY category, subcategory - for category-based filtering

-- Additional optimization recommendations:
-- 1. Use SELECT with specific columns instead of SELECT *
-- 2. Filter by category/subcategory when possible
-- 3. Use date partitioning for time-based analysis
-- 4. Consider materialized views for frequently accessed aggregations

-- =====================================================
-- CURRENT DATA STATISTICS (as of load)
-- =====================================================
/*
Total Records: 8,400
Categories: 3 (ale, lager, other)
Subcategories: 13 (micro, brewpub, regional, etc.)
Data Source: Open Brewery DB API
Geographic Coverage: Worldwide
Primary Use Case: Brewery analysis and beer categorization
*/

-- =====================================================
-- COST OPTIMIZATION NOTES
-- =====================================================
/*
Storage Cost: ~$0.002/month (100MB data)
Query Cost: ~$0.000625 per full table scan
Recommended: Use clustered columns in WHERE clauses
Partition pruning: Filter by processed_at date when possible
*/
