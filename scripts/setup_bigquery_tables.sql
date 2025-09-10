-- BigQuery Table Setup for Punk Brewery Pipeline
-- Project: punkbrew
-- Dataset: punkbrew_warehouse

-- Staging table for raw beer data
CREATE OR REPLACE TABLE `punkbrew.punkbrew_warehouse.staging_beers` (
  beer_id INT64 NOT NULL,
  name STRING NOT NULL,
  tagline STRING,
  description STRING,
  image_url STRING,
  first_brewed DATE,
  abv FLOAT64,
  ibu FLOAT64,
  target_fg FLOAT64,
  target_og FLOAT64,
  ebc FLOAT64,
  srm FLOAT64,
  ph FLOAT64,
  attenuation_level FLOAT64,
  volume JSON,
  boil_volume JSON,
  category STRING NOT NULL,
  subcategory STRING,
  category_confidence FLOAT64,
  ingredients JSON,
  method JSON,
  food_pairing ARRAY<STRING>,
  brewers_tips STRING,
  contributed_by STRING,
  processed_at TIMESTAMP NOT NULL,
  data_version STRING
)
PARTITION BY DATE(processed_at)
CLUSTER BY category
OPTIONS(
  description="Staging table for raw beer data from Punk API"
);

-- Dimension table for beer information
CREATE OR REPLACE TABLE `punkbrew.punkbrew_warehouse.dim_beers` (
  beer_id INT64 NOT NULL,
  name STRING NOT NULL,
  tagline STRING,
  description STRING,
  image_url STRING,
  category STRING NOT NULL,
  subcategory STRING,
  category_confidence FLOAT64,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
)
CLUSTER BY category
OPTIONS(
  description="Dimension table containing beer information"
);

-- Dimension table for ingredients
CREATE OR REPLACE TABLE `punkbrew.punkbrew_warehouse.dim_ingredients` (
  ingredient_id STRING NOT NULL,
  ingredient_name STRING NOT NULL,
  ingredient_type STRING NOT NULL, -- malt, hop, yeast
  created_at TIMESTAMP NOT NULL
)
CLUSTER BY ingredient_type
OPTIONS(
  description="Dimension table containing ingredient information"
);

-- Fact table for beer metrics
CREATE OR REPLACE TABLE `punkbrew.punkbrew_warehouse.fact_beers` (
  beer_id INT64 NOT NULL,
  first_brewed DATE,
  abv FLOAT64,
  ibu FLOAT64,
  target_fg FLOAT64,
  target_og FLOAT64,
  ebc FLOAT64,
  srm FLOAT64,
  ph FLOAT64,
  attenuation_level FLOAT64,
  volume JSON,
  boil_volume JSON,
  food_pairing ARRAY<STRING>,
  brewers_tips STRING,
  contributed_by STRING,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP NOT NULL
)
PARTITION BY DATE(processed_at)
CLUSTER BY DATE(first_brewed)
OPTIONS(
  description="Fact table containing beer metrics and measurements"
);

-- Fact table for beer ingredients relationships
CREATE OR REPLACE TABLE `punkbrew.punkbrew_warehouse.fact_beer_ingredients` (
  beer_id INT64 NOT NULL,
  ingredient_id STRING NOT NULL,
  amount_value FLOAT64,
  amount_unit STRING,
  add_timing STRING, -- For hops: start, middle, end, dry hop
  attribute STRING,  -- For hops: aroma, flavor, bittering
  created_at TIMESTAMP NOT NULL
)
CLUSTER BY beer_id
OPTIONS(
  description="Fact table linking beers to their ingredients"
);

-- View for beer analytics (used by DataStudio)
CREATE OR REPLACE VIEW `punkbrew.punkbrew_warehouse.vw_beer_analytics` AS
SELECT 
  b.beer_id,
  b.name as beer_name,
  b.tagline,
  b.category,
  b.subcategory,
  f.abv,
  f.ibu,
  f.ebc,
  f.srm,
  f.first_brewed,
  EXTRACT(YEAR FROM f.first_brewed) as brew_year,
  EXTRACT(MONTH FROM f.first_brewed) as brew_month,
  
  -- ABV Categories
  CASE 
    WHEN f.abv < 3.5 THEN 'Low (< 3.5%)'
    WHEN f.abv < 5.0 THEN 'Session (3.5-5.0%)'
    WHEN f.abv < 7.0 THEN 'Standard (5.0-7.0%)'
    WHEN f.abv < 9.0 THEN 'Strong (7.0-9.0%)'
    ELSE 'Very Strong (9.0%+)'
  END as abv_category,
  
  -- IBU Categories
  CASE 
    WHEN f.ibu < 20 THEN 'Low Bitterness'
    WHEN f.ibu < 40 THEN 'Moderate Bitterness'
    WHEN f.ibu < 60 THEN 'High Bitterness'
    ELSE 'Very High Bitterness'
  END as ibu_category,
  
  -- Color Categories
  CASE 
    WHEN f.srm < 4 THEN 'Pale'
    WHEN f.srm < 10 THEN 'Golden'
    WHEN f.srm < 20 THEN 'Amber'
    WHEN f.srm < 35 THEN 'Brown'
    ELSE 'Dark'
  END as color_category,
  
  f.food_pairing,
  ARRAY_LENGTH(f.food_pairing) as food_pairing_count,
  f.brewers_tips,
  f.contributed_by,
  f.processed_at
  
FROM `punkbrew.punkbrew_warehouse.dim_beers` b
JOIN `punkbrew.punkbrew_warehouse.fact_beers` f ON b.beer_id = f.beer_id;

-- View for category trends
CREATE OR REPLACE VIEW `punkbrew.punkbrew_warehouse.vw_category_trends` AS
SELECT 
  b.category,
  b.subcategory,
  EXTRACT(YEAR FROM f.first_brewed) as brew_year,
  COUNT(*) as beer_count,
  AVG(f.abv) as avg_abv,
  AVG(f.ibu) as avg_ibu,
  MIN(f.first_brewed) as earliest_brew,
  MAX(f.first_brewed) as latest_brew
  
FROM `punkbrew.punkbrew_warehouse.dim_beers` b
JOIN `punkbrew.punkbrew_warehouse.fact_beers` f ON b.beer_id = f.beer_id
WHERE f.first_brewed IS NOT NULL
GROUP BY b.category, b.subcategory, EXTRACT(YEAR FROM f.first_brewed)
ORDER BY brew_year DESC, beer_count DESC;
