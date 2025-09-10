{{ config(
    materialized='incremental',
    unique_key='beer_id',
    on_schema_change='fail'
) }}

/*
    Fact table for beer analytics.
    This model creates the main analytical table for beer data
    with all metrics needed for dashboard reporting.
*/

with beer_data as (
    select * from {{ ref('stg_beers') }}
    {% if is_incremental() %}
        where processed_at > (select max(processed_at) from {{ this }})
    {% endif %}
),

category_lookup as (
    select * from {{ ref('dim_beer_categories') }}
),

beer_metrics as (
    select
        b.beer_id,
        b.beer_name,
        b.tagline,
        b.description,
        b.image_url,
        
        -- Date dimensions
        b.first_brewed_date,
        extract(year from b.first_brewed_date) as brew_year,
        extract(month from b.first_brewed_date) as brew_month,
        extract(quarter from b.first_brewed_date) as brew_quarter,
        
        -- Category information
        c.category_key,
        b.beer_category,
        b.beer_subcategory,
        b.category_confidence,
        
        -- Alcohol metrics
        b.alcohol_by_volume,
        case 
            when b.alcohol_by_volume < 3.5 then 'Low (< 3.5%)'
            when b.alcohol_by_volume < 5.0 then 'Session (3.5-5.0%)'
            when b.alcohol_by_volume < 7.0 then 'Standard (5.0-7.0%)'
            when b.alcohol_by_volume < 9.0 then 'Strong (7.0-9.0%)'
            else 'Very Strong (9.0%+)'
        end as abv_category,
        
        -- Bitterness metrics
        b.international_bitterness_units,
        case 
            when b.international_bitterness_units < 20 then 'Low Bitterness'
            when b.international_bitterness_units < 40 then 'Moderate Bitterness'
            when b.international_bitterness_units < 60 then 'High Bitterness'
            else 'Very High Bitterness'
        end as ibu_category,
        
        -- Color metrics
        b.european_brewery_convention,
        b.standard_reference_method,
        case 
            when b.standard_reference_method < 4 then 'Pale'
            when b.standard_reference_method < 10 then 'Golden'
            when b.standard_reference_method < 20 then 'Amber'
            when b.standard_reference_method < 35 then 'Brown'
            else 'Dark'
        end as color_category,
        
        -- Other brewing metrics
        b.final_gravity,
        b.original_gravity,
        b.ph,
        b.attenuation_level,
        
        -- Volume information
        json_extract_scalar(b.volume, '$.value') as volume_value,
        json_extract_scalar(b.volume, '$.unit') as volume_unit,
        json_extract_scalar(b.boil_volume, '$.value') as boil_volume_value,
        json_extract_scalar(b.boil_volume, '$.unit') as boil_volume_unit,
        
        -- Ingredient complexity (count of ingredients)
        array_length(json_extract_array(b.ingredients, '$.malts')) as malt_count,
        array_length(json_extract_array(b.ingredients, '$.hops')) as hop_count,
        
        -- Food pairing count
        array_length(b.food_pairing) as food_pairing_count,
        
        -- Additional information
        b.brewers_tips,
        b.contributed_by,
        
        -- Metadata
        b.processed_at,
        current_timestamp() as analytics_created_at
        
    from beer_data b
    left join category_lookup c
        on b.beer_category = c.category_name
        and coalesce(b.beer_subcategory, 'Unknown') = c.subcategory_name
),

final as (
    select
        *,
        
        -- Calculated metrics
        case 
            when original_gravity is not null and final_gravity is not null
            then round((original_gravity - final_gravity) / original_gravity * 100, 2)
            else null
        end as apparent_attenuation,
        
        -- Complexity score (simple algorithm)
        (coalesce(malt_count, 0) * 2 + 
         coalesce(hop_count, 0) * 3 + 
         coalesce(food_pairing_count, 0)) as complexity_score,
        
        -- Trend indicators
        case 
            when brew_year >= extract(year from current_date()) - 5 then 'Recent'
            when brew_year >= extract(year from current_date()) - 10 then 'Modern'
            else 'Classic'
        end as brew_era
        
    from beer_metrics
)

select * from final
