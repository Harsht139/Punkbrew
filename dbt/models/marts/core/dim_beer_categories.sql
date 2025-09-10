{{ config(materialized='table') }}

/*
    Dimension table for beer categories.
    This model creates a clean dimension table for beer categories
    with additional metadata and classification information.
*/

with beer_categories as (
    select distinct
        beer_category,
        beer_subcategory
    from {{ ref('stg_beers') }}
    where beer_category is not null
),

category_stats as (
    select
        beer_category,
        beer_subcategory,
        count(*) as beer_count,
        avg(alcohol_by_volume) as avg_abv,
        avg(international_bitterness_units) as avg_ibu,
        min(first_brewed_date) as earliest_brew_date,
        max(first_brewed_date) as latest_brew_date
    from {{ ref('stg_beers') }}
    where beer_category is not null
    group by beer_category, beer_subcategory
),

final as (
    select
        {{ dbt_utils.generate_surrogate_key(['beer_category', 'coalesce(beer_subcategory, "unknown")']) }} as category_key,
        
        -- Category information
        beer_category as category_name,
        coalesce(beer_subcategory, 'Unknown') as subcategory_name,
        
        -- Category statistics
        beer_count,
        round(avg_abv, 2) as average_abv,
        round(avg_ibu, 1) as average_ibu,
        earliest_brew_date,
        latest_brew_date,
        
        -- Category classification
        case 
            when beer_category = 'ale' then 'Top-fermented beer with fruity and complex flavors'
            when beer_category = 'lager' then 'Bottom-fermented beer with clean and crisp taste'
            when beer_category = 'other' then 'Specialty beers with unique characteristics'
            else 'Unknown beer category'
        end as category_description,
        
        case 
            when beer_category = 'ale' then 'Saccharomyces cerevisiae'
            when beer_category = 'lager' then 'Saccharomyces pastorianus'
            else 'Various yeast strains'
        end as typical_yeast_type,
        
        case 
            when beer_category = 'ale' then '15-24°C (59-75°F)'
            when beer_category = 'lager' then '7-13°C (45-55°F)'
            else 'Varies by style'
        end as fermentation_temperature,
        
        -- Metadata
        current_timestamp() as created_at,
        current_timestamp() as updated_at
        
    from category_stats
)

select * from final
order by category_name, subcategory_name
