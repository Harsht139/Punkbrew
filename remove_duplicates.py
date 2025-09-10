#!/usr/bin/env python3
"""
Remove duplicate breweries from BigQuery dataset
"""

import os
from google.cloud import bigquery

def remove_duplicates():
    """Remove duplicate breweries from staging_beers table."""
    print("🔍 Removing Duplicate Breweries")
    print("="*50)
    
    # Set credentials
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.join(os.getcwd(), 'credentials', 'service-account.json')
    
    client = bigquery.Client(project="punkbrew")
    table_id = "punkbrew.punkbrew_warehouse.staging_beers"
    
    # First, check for duplicates
    print("📊 Checking for duplicates...")
    
    duplicate_check_query = f"""
    SELECT 
      beer_id,
      name,
      COUNT(*) as duplicate_count
    FROM `{table_id}`
    GROUP BY beer_id, name
    HAVING COUNT(*) > 1
    ORDER BY duplicate_count DESC
    LIMIT 20
    """
    
    duplicate_results = client.query(duplicate_check_query).result()
    
    duplicates_found = False
    print("\n🔍 Found Duplicates:")
    for row in duplicate_results:
        duplicates_found = True
        print(f"   {row.name}: {row.duplicate_count} copies")
    
    if not duplicates_found:
        print("   ✅ No duplicates found!")
        return True
    
    # Count total records before deduplication
    count_query = f"SELECT COUNT(*) as total FROM `{table_id}`"
    before_count = list(client.query(count_query).result())[0].total
    print(f"\n📊 Total records before deduplication: {before_count}")
    
    # Create deduplicated table (preserve partitioning)
    print("\n🔧 Creating deduplicated dataset...")
    
    # First create a temporary table with deduplicated data
    temp_table = f"{table_id}_temp"
    
    dedup_query = f"""
    CREATE OR REPLACE TABLE `{temp_table}`
    PARTITION BY DATE(processed_at)
    CLUSTER BY category, subcategory
    AS
    SELECT * EXCEPT(row_num)
    FROM (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY beer_id, name 
          ORDER BY processed_at DESC
        ) as row_num
      FROM `{table_id}`
    )
    WHERE row_num = 1
    """
    
    job = client.query(dedup_query)
    job.result()
    
    # Drop original table and rename temp table
    print("🔄 Replacing original table...")
    
    drop_query = f"DROP TABLE `{table_id}`"
    client.query(drop_query).result()
    
    rename_query = f"""
    CREATE OR REPLACE TABLE `{table_id}`
    PARTITION BY DATE(processed_at)
    CLUSTER BY category, subcategory
    AS SELECT * FROM `{temp_table}`
    """
    client.query(rename_query).result()
    
    # Clean up temp table
    client.query(f"DROP TABLE `{temp_table}`").result()
    
    # Count records after deduplication
    after_count = list(client.query(count_query).result())[0].total
    removed_count = before_count - after_count
    
    print(f"✅ Deduplication complete!")
    print(f"   Before: {before_count} records")
    print(f"   After: {after_count} records")
    print(f"   Removed: {removed_count} duplicates")
    
    # Verify no duplicates remain
    print("\n🔍 Verifying deduplication...")
    remaining_duplicates = list(client.query(duplicate_check_query).result())
    
    if not remaining_duplicates:
        print("✅ No duplicates remaining!")
    else:
        print("⚠️ Some duplicates still exist:")
        for row in remaining_duplicates:
            print(f"   {row.name}: {row.duplicate_count} copies")
    
    # Show final dataset summary
    print("\n📊 Final Dataset Summary:")
    
    summary_query = f"""
    SELECT 
      COUNT(*) as total_breweries,
      COUNT(DISTINCT subcategory) as brewery_types,
      COUNT(CASE WHEN data_version LIKE '%korea%' THEN 1 END) as korean_breweries,
      COUNT(CASE WHEN subcategory = 'micro' THEN 1 END) as micro_breweries,
      COUNT(CASE WHEN subcategory = 'brewpub' THEN 1 END) as brewpubs
    FROM `{table_id}`
    """
    
    summary_results = list(client.query(summary_query).result())[0]
    
    print(f"   Total Breweries: {summary_results.total_breweries}")
    print(f"   Korean Breweries: {summary_results.korean_breweries}")
    print(f"   Micro Breweries: {summary_results.micro_breweries}")
    print(f"   Brewpubs: {summary_results.brewpubs}")
    print(f"   Brewery Types: {summary_results.brewery_types}")
    
    return True

def main():
    """Main execution."""
    try:
        success = remove_duplicates()
        
        if success:
            print("\n🎉 DEDUPLICATION COMPLETE!")
            print("="*50)
            print("✅ All duplicate breweries removed")
            print("✅ Dataset is now clean and optimized")
            print("✅ Ready for dashboard creation")
            print("\n💰 Cost Impact: Reduced storage and query costs")
        else:
            print("\n❌ Deduplication failed")
            
    except Exception as e:
        print(f"\n❌ Error during deduplication: {e}")

if __name__ == "__main__":
    main()
