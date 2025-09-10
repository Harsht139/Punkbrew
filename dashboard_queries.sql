-- =====================================================
-- PUNK BREWERY DASHBOARD - SQL QUERIES
-- =====================================================
-- Use these queries directly in LookerStudio/DataStudio
-- Project: punkbrew.punkbrew_warehouse.staging_beers
-- =====================================================

-- =====================================================
-- 1. KEY PERFORMANCE INDICATORS (KPIs)
-- =====================================================

-- Total Breweries
SELECT COUNT(*) as total_breweries 
FROM `punkbrew.punkbrew_warehouse.staging_beers`;

-- Korean Breweries
SELECT COUNT(*) as korean_breweries 
FROM `punkbrew.punkbrew_warehouse.staging_beers`
WHERE data_version LIKE '%korea%';

-- Micro Breweries
SELECT COUNT(*) as micro_breweries 
FROM `punkbrew.punkbrew_warehouse.staging_beers`
WHERE subcategory = 'micro';

-- Average ABV
SELECT ROUND(AVG(abv), 1) as avg_abv 
FROM `punkbrew.punkbrew_warehouse.staging_beers`
WHERE abv IS NOT NULL;

-- =====================================================
-- 2. BREWERY TYPE DISTRIBUTION (Pie Chart)
-- =====================================================
SELECT 
  subcategory as brewery_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM `punkbrew.punkbrew_warehouse.staging_beers`
GROUP BY subcategory
ORDER BY count DESC;

-- =====================================================
-- 3. GEOGRAPHIC DISTRIBUTION (Bar Chart)
-- =====================================================
SELECT 
  CASE 
    WHEN data_version LIKE '%korea%' THEN 'South Korea'
    WHEN LOWER(name) LIKE '%ireland%' OR LOWER(name) LIKE '%dublin%' THEN 'Ireland'
    WHEN LOWER(name) LIKE '%portugal%' THEN 'Portugal'
    WHEN LOWER(name) LIKE '%singapore%' THEN 'Singapore'
    ELSE 'United States'
  END as country,
  COUNT(*) as brewery_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM `punkbrew.punkbrew_warehouse.staging_beers`
GROUP BY country
ORDER BY brewery_count DESC;

-- =====================================================
-- 4. KOREAN BREWERY ANALYSIS (Table)
-- =====================================================
SELECT 
  REGEXP_REPLACE(name, ' House Beer$', '') as brewery_name,
  REGEXP_EXTRACT(tagline, r'from (.+)') as location,
  subcategory as brewery_type,
  abv,
  ibu,
  category,
  SUBSTR(description, 1, 100) as description_preview
FROM `punkbrew.punkbrew_warehouse.staging_beers`
WHERE data_version LIKE '%korea%'
ORDER BY brewery_name;

-- =====================================================
-- 5. ABV DISTRIBUTION (Histogram)
-- =====================================================
SELECT 
  CASE 
    WHEN abv IS NULL THEN 'Unknown'
    WHEN abv < 3.0 THEN '< 3.0%'
    WHEN abv < 4.0 THEN '3.0-3.9%'
    WHEN abv < 5.0 THEN '4.0-4.9%'
    WHEN abv < 6.0 THEN '5.0-5.9%'
    WHEN abv < 7.0 THEN '6.0-6.9%'
    WHEN abv < 8.0 THEN '7.0-7.9%'
    ELSE '8.0%+'
  END as abv_range,
  COUNT(*) as count
FROM `punkbrew.punkbrew_warehouse.staging_beers`
GROUP BY abv_range
ORDER BY 
  CASE abv_range
    WHEN 'Unknown' THEN 0
    WHEN '< 3.0%' THEN 1
    WHEN '3.0-3.9%' THEN 2
    WHEN '4.0-4.9%' THEN 3
    WHEN '5.0-5.9%' THEN 4
    WHEN '6.0-6.9%' THEN 5
    WHEN '7.0-7.9%' THEN 6
    ELSE 7
  END;

-- =====================================================
-- 6. IBU DISTRIBUTION (Histogram)
-- =====================================================
SELECT 
  CASE 
    WHEN ibu IS NULL THEN 'Unknown'
    WHEN ibu < 20 THEN '< 20 IBU'
    WHEN ibu < 40 THEN '20-39 IBU'
    WHEN ibu < 60 THEN '40-59 IBU'
    WHEN ibu < 80 THEN '60-79 IBU'
    ELSE '80+ IBU'
  END as ibu_range,
  COUNT(*) as count
FROM `punkbrew.punkbrew_warehouse.staging_beers`
GROUP BY ibu_range
ORDER BY 
  CASE ibu_range
    WHEN 'Unknown' THEN 0
    WHEN '< 20 IBU' THEN 1
    WHEN '20-39 IBU' THEN 2
    WHEN '40-59 IBU' THEN 3
    WHEN '60-79 IBU' THEN 4
    ELSE 5
  END;

-- =====================================================
-- 7. KOREAN CITIES DISTRIBUTION (Bar Chart)
-- =====================================================
SELECT 
  REGEXP_EXTRACT(tagline, r'from ([^,]+)') as city,
  COUNT(*) as brewery_count
FROM `punkbrew.punkbrew_warehouse.staging_beers`
WHERE data_version LIKE '%korea%'
  AND REGEXP_EXTRACT(tagline, r'from ([^,]+)') IS NOT NULL
GROUP BY city
ORDER BY brewery_count DESC
LIMIT 15;

-- =====================================================
-- 8. KOREAN VS US COMPARISON (Grouped Bar Chart)
-- =====================================================
SELECT 
  CASE 
    WHEN data_version LIKE '%korea%' THEN 'South Korea'
    ELSE 'United States'
  END as country,
  subcategory as brewery_type,
  COUNT(*) as count,
  ROUND(AVG(abv), 1) as avg_abv,
  ROUND(AVG(ibu), 0) as avg_ibu
FROM `punkbrew.punkbrew_warehouse.staging_beers`
WHERE subcategory IN ('micro', 'brewpub', 'regional', 'large')
GROUP BY country, subcategory
ORDER BY country, count DESC;

-- =====================================================
-- 9. BEER CATEGORY DISTRIBUTION (Pie Chart)
-- =====================================================
SELECT 
  category,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM `punkbrew.punkbrew_warehouse.staging_beers`
GROUP BY category
ORDER BY count DESC;

-- =====================================================
-- 10. PROCESSING TIMELINE (Line Chart)
-- =====================================================
SELECT 
  DATE(processed_at) as processing_date,
  COUNT(*) as breweries_processed,
  CASE 
    WHEN data_version LIKE '%korea%' THEN 'Korean Breweries'
    ELSE 'Other Breweries'
  END as data_source
FROM `punkbrew.punkbrew_warehouse.staging_beers`
GROUP BY processing_date, data_source
ORDER BY processing_date;

-- =====================================================
-- 11. TOP BREWERY STATES/PROVINCES (Bar Chart)
-- =====================================================
SELECT 
  REGEXP_EXTRACT(tagline, r'from [^,]+,\s*([^,]+)') as state_province,
  COUNT(*) as brewery_count
FROM `punkbrew.punkbrew_warehouse.staging_beers`
WHERE REGEXP_EXTRACT(tagline, r'from [^,]+,\s*([^,]+)') IS NOT NULL
GROUP BY state_province
ORDER BY brewery_count DESC
LIMIT 20;

-- =====================================================
-- 12. BREWERY SIZE ANALYSIS (Stacked Bar Chart)
-- =====================================================
SELECT 
  CASE 
    WHEN subcategory IN ('nano', 'micro') THEN 'Small'
    WHEN subcategory IN ('brewpub', 'taproom') THEN 'Medium'
    WHEN subcategory IN ('regional', 'large') THEN 'Large'
    ELSE 'Other'
  END as brewery_size,
  CASE 
    WHEN data_version LIKE '%korea%' THEN 'South Korea'
    ELSE 'United States'
  END as country,
  COUNT(*) as count
FROM `punkbrew.punkbrew_warehouse.staging_beers`
GROUP BY brewery_size, country
ORDER BY brewery_size, count DESC;

-- =====================================================
-- 13. DETAILED BREWERY INFORMATION (Data Table)
-- =====================================================
SELECT 
  REGEXP_REPLACE(name, ' House Beer$', '') as brewery_name,
  subcategory as type,
  REGEXP_EXTRACT(tagline, r'from (.+)') as location,
  category,
  abv,
  ibu,
  CASE 
    WHEN data_version LIKE '%korea%' THEN 'South Korea'
    ELSE 'United States'
  END as country,
  DATE(processed_at) as date_added
FROM `punkbrew.punkbrew_warehouse.staging_beers`
ORDER BY brewery_name;

-- =====================================================
-- 14. CRAFT BEER CHARACTERISTICS SCATTER PLOT
-- =====================================================
SELECT 
  abv,
  ibu,
  subcategory as brewery_type,
  CASE 
    WHEN data_version LIKE '%korea%' THEN 'South Korea'
    ELSE 'United States'
  END as country,
  REGEXP_REPLACE(name, ' House Beer$', '') as brewery_name
FROM `punkbrew.punkbrew_warehouse.staging_beers`
WHERE abv IS NOT NULL AND ibu IS NOT NULL
ORDER BY abv, ibu;

-- =====================================================
-- 15. MONTHLY SUMMARY METRICS (Scorecard)
-- =====================================================
SELECT 
  COUNT(*) as total_breweries,
  COUNT(CASE WHEN data_version LIKE '%korea%' THEN 1 END) as korean_breweries,
  COUNT(CASE WHEN subcategory = 'micro' THEN 1 END) as micro_breweries,
  COUNT(CASE WHEN subcategory = 'brewpub' THEN 1 END) as brewpubs,
  COUNT(DISTINCT subcategory) as brewery_types,
  ROUND(AVG(abv), 1) as avg_abv,
  ROUND(AVG(ibu), 0) as avg_ibu,
  COUNT(CASE WHEN category = 'ale' THEN 1 END) as ale_breweries,
  COUNT(CASE WHEN category = 'lager' THEN 1 END) as lager_breweries
FROM `punkbrew.punkbrew_warehouse.staging_beers`;

-- =====================================================
-- USAGE INSTRUCTIONS:
-- =====================================================
-- 1. Copy any query above
-- 2. In LookerStudio, create new chart
-- 3. Choose "Custom Query" as data source
-- 4. Paste the SQL query
-- 5. Configure chart type and styling
-- 6. Add to your dashboard
-- =====================================================
