#!/usr/bin/env python3
"""
Simple ICD-10-CM Importer for Supabase
Downloads from CMS FTP and imports to Supabase
"""

import requests
import os
from typing import List, Dict

# Supabase config
SUPABASE_URL = "https://hwclojaalnzruviubxju.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2xvamFhbG56cnV2aXVieGp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA4MTYzNCwiZXhwIjoyMDc5NjU3NjM0fQ.1em5TT2fvcUFU-fEnfKB26_V4PTvL00jiYS6kOBaHDU"

# CMS ICD-10-CM 2025 Codes (works as of 2025)
ICD10_URL = "https://www.cms.gov/files/zip/2025-code-descriptions-tabular-order.zip"

# Alternative: Use a smaller curated dataset
SAMPLE_CODES_URL = "https://raw.githubusercontent.com/kamillamagna/ICD-10-CSV/master/codes.csv"

def fetch_sample_icd10():
    """Fetch curated ICD-10 codes from GitHub (free, open-source)"""
    print("📥 Downloading ICD-10 codes from GitHub...")
    
    response = requests.get(SAMPLE_CODES_URL)
    response.raise_for_status()
    
    lines = response.text.split('\n')
    codes = []
    
    for i, line in enumerate(lines[1:], 1):  # Skip header
        if not line.strip():
            continue
            
        parts = line.split(',')
        if len(parts) >= 2:
            code = parts[0].strip().strip('"')
            description = parts[1].strip().strip('"')
            
            # Determine chapter from code prefix
            chapter = get_chapter(code)
            
            codes.append({
                'code': code,
                'short_title': description[:100],
                'long_description': description,
                'chapter': chapter
            })
    
    print(f"✅ Fetched {len(codes):,} ICD-10 codes")
    return codes

def get_chapter(code: str) -> str:
    """Map ICD-10 code to chapter"""
    chapters = {
        'A': 'Infectious Diseases', 'B': 'Infectious Diseases',
        'C': 'Neoplasms', 'D0': 'Neoplasms', 'D1': 'Neoplasms',
        'D5': 'Blood Diseases', 'D6': 'Blood Diseases',
        'E': 'Endocrine/Metabolic',
        'F': 'Mental/Behavioral',
        'G': 'Nervous System',
        'H0': 'Eye Diseases', 'H6': 'Ear Diseases',
        'I': 'Circulatory System',
        'J': 'Respiratory System',
        'K': 'Digestive System',
        'L': 'Skin Diseases',
        'M': 'Musculoskeletal',
        'N': 'Genitourinary',
        'O': 'Pregnancy/Childbirth',
        'P': 'Perinatal',
        'Q': 'Congenital',
        'R': 'Symptoms/Signs',
        'S': 'Injury/Poisoning', 'T': 'Injury/Poisoning',
        'V': 'External Causes', 'W': 'External Causes',
        'X': 'External Causes', 'Y': 'External Causes',
        'Z': 'Health Status'
    }
    
    prefix = code[:2] if len(code) >= 2 else code[:1]
    if prefix in chapters:
        return chapters[prefix]
    
    prefix = code[:1]
    return chapters.get(prefix, 'Other')

def upload_to_supabase(codes: List[Dict], batch_size=500):
    """Upload codes to Supabase in batches"""
    print(f"\n📤 Uploading {len(codes):,} codes to Supabase...")
    
    url = f"{SUPABASE_URL}/rest/v1/icd10_codes"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }
    
    total_batches = (len(codes) + batch_size - 1) // batch_size
    uploaded = 0
    
    for i in range(0, len(codes), batch_size):
        batch = codes[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        
        try:
            response = requests.post(url, headers=headers, json=batch)
            response.raise_for_status()
            
            uploaded += len(batch)
            progress = (uploaded / len(codes)) * 100
            print(f"\r  Batch {batch_num}/{total_batches}: {uploaded:,}/{len(codes):,} ({progress:.1f}%) ✅", end='', flush=True)
        
        except Exception as e:
            print(f"\n  ❌ Batch {batch_num} failed: {e}")
            if hasattr(e, 'response'):
                print(f"     Response: {e.response.text[:200]}")
    
    print(f"\n\n✅ Upload complete! Uploaded {uploaded:,} codes")

def verify_import():
    """Check database status"""
    print("\n🔍 Verifying database...")
    
    url = f"{SUPABASE_URL}/rest/v1/icd10_codes?select=code,short_title&limit=10"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    
    response = requests.get(url, headers=headers)
    data = response.json()
    
    # Get count
    count_url = f"{SUPABASE_URL}/rest/v1/icd10_codes?select=code"
    count_response = requests.head(count_url, headers=headers)
    total = count_response.headers.get('Content-Range', '*/0').split('/')[-1]
    
    print(f"✅ Total codes in database: {total}")
    print(f"\n📋 Sample codes:")
    for code in data[:10]:
        print(f"   {code['code']}: {code['short_title'][:60]}")

if __name__ == '__main__':
    print("=" * 60)
    print("ICD-10-CM Simple Importer")
    print("=" * 60)
    print()
    
    try:
        codes = fetch_sample_icd10()
        
        print(f"\n⚠️  About to upload {len(codes):,} codes to Supabase")
        confirm = input("Proceed? (yes/no): ").strip().lower()
        
        if confirm == 'yes':
            upload_to_supabase(codes)
            verify_import()
        else:
            print("❌ Upload cancelled")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
