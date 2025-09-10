{{ config(materialized='view') }}

/*
    Staging model for beer data from raw BigQuery tables.
    This model cleans and standardizes the raw beer data.
*/

with source_data as (
    select * from {{ source('punk_brewery', 'staging_beers') }}
),

cleaned_data as (
    select
        -- Primary key
        beer_id,
        
        -- Basic information
        trim(name) as beer_name,
        trim(tagline) as tagline,
        trim(description) as description,
        image_url,
        
        -- Brewing details
        case 
            when first_brewed is not null then first_brewed
            else null
        end as first_brewed_date,
        
        -- Alcohol and bitterness
        case 
            when abv between {{ var('min_abv') }} and {{ var('max_abv') }} then abv
            else null
        end as alcohol_by_volume,
        
        case 
            when ibu between {{ var('min_ibu') }} and {{ var('max_ibu') }} then ibu
            else null
        end as international_bitterness_units,
        
        -- Gravity measurements
        target_fg as final_gravity,
        target_og as original_gravity,
        
        -- Color measurements
        ebc as european_brewery_convention,
        srm as standard_reference_method,
        
        -- Other measurements
        ph,
        attenuation_level,
        
        -- Volume information
        volume,
        boil_volume,
        
        -- Categorization
        lower(trim(category)) as beer_category,
        lower(trim(subcategory)) as beer_subcategory,
        category_confidence,
        
        -- Ingredients and methods
        ingredients,
        method,
        
        -- Additional information
        food_pairing,
        trim(brewers_tips) as brewers_tips,
        trim(contributed_by) as contributed_by,
        
        -- Metadata
        processed_at,
        data_version,
        
        -- Data quality flags
        case 
            when name is null or trim(name) = '' then false
            when beer_id is null then false
            when category is null or trim(category) = '' then false
            else true
        end as is_valid_record
        
    from source_data
)

select * from cleaned_data
where is_valid_record = true
