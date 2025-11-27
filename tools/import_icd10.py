#!/usr/bin/env python3
"""
ICD-10-CM Data Importer for Supabase
Zero-cost solution using free WHO/CDC datasets

Data Sources (ALL FREE):
1. WHO ICD-10: https://icd.who.int/browse10/Downloads
2. CDC ICD-10-CM: https://www.cdc.gov/nchs/icd/icd-10-cm.htm
3. CMS ICD-10-CM: https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/ICD10CM/

Usage:
    python import_icd10.py --dataset cdc --year 2024
    python import_icd10.py --dataset who --format xml
    python import_icd10.py --verify-only  # Check import status
"""

import os
import sys
import csv
import xml.etree.ElementTree as ET
import json
import requests
import argparse
from typing import List, Dict, Any
from dataclasses import dataclass, asdict
from pathlib import Path

# Supabase connection (from environment)
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://hwclojaalnzruviubxju.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

# Free dataset URLs
CDC_2024_URL = "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/ICD10CM/2024/icd10cm_tabular_2024.xml"
CDC_2024_CODES_TXT = "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/ICD10CM/2024/icd10cm_codes_2024.txt"

# WHO ICD-10 (requires manual download due to licensing acceptance)
WHO_DOWNLOAD_INFO = """
WHO ICD-10 Dataset (FREE but requires manual download):
1. Go to: https://icd.who.int/browse10/Downloads
2. Accept the license agreement
3. Download: "ICD-10 Version 2019" (LinearizationMiniOutput-MMS-en.zip)
4. Extract to: ./data/who_icd10/
5. Run this script again
"""


@dataclass
class ICD10Code:
    """ICD-10 code structure matching Supabase schema"""
    code: str
    short_title: str
    long_description: str
    chapter: str
    chapter_number: int = None
    is_billable: bool = True
    is_header: bool = False
    parent_code: str = None


class ICD10Importer:
    """Zero-cost ICD-10 data importer"""
    
    def __init__(self, supabase_url: str, service_key: str):
        self.supabase_url = supabase_url
        self.service_key = service_key
        self.headers = {
            'apikey': service_key,
            'Authorization': f'Bearer {service_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
        self.data_dir = Path('./data')
        self.data_dir.mkdir(exist_ok=True)
    
    def download_cdc_dataset(self, year: int = 2024) -> Path:
        """Download CDC ICD-10-CM dataset (FREE, no API key needed)"""
        print(f"📥 Downloading CDC ICD-10-CM {year} dataset...")
        
        url = f"https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/ICD10CM/{year}/icd10cm_tabular_{year}.xml"
        output_file = self.data_dir / f"cdc_icd10cm_{year}.xml"
        
        if output_file.exists():
            print(f"✅ Dataset already downloaded: {output_file}")
            return output_file
        
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            total_size = int(response.headers.get('content-length', 0))
            downloaded = 0
            
            with open(output_file, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        progress = (downloaded / total_size) * 100
                        print(f"\r  Progress: {progress:.1f}%", end='', flush=True)
            
            print(f"\n✅ Downloaded {total_size / 1024 / 1024:.1f} MB")
            return output_file
        
        except Exception as e:
            print(f"❌ Error downloading: {e}")
            print(f"\nManual download option:")
            print(f"1. Go to: {url}")
            print(f"2. Save as: {output_file}")
            sys.exit(1)
    
    def parse_cdc_xml(self, xml_file: Path) -> List[ICD10Code]:
        """Parse CDC ICD-10-CM XML format"""
        print(f"📖 Parsing {xml_file.name}...")
        
        codes: List[ICD10Code] = []
        tree = ET.parse(xml_file)
        root = tree.getroot()
        
        # CDC XML structure: <ICD10CM.tabular> -> <chapter> -> <section> -> <diag>
        for chapter_num, chapter in enumerate(root.findall('.//chapter'), start=1):
            chapter_title = chapter.find('desc').text if chapter.find('desc') is not None else f"Chapter {chapter_num}"
            
            print(f"  Chapter {chapter_num:02d}: {chapter_title}")
            
            # Process all diagnosis codes in this chapter
            for diag in chapter.findall('.//diag'):
                code_elem = diag.find('name')
                desc_elem = diag.find('desc')
                
                if code_elem is None or desc_elem is None:
                    continue
                
                code = code_elem.text.strip()
                long_desc = desc_elem.text.strip()
                
                # Generate short description (first 60 chars)
                short_desc = long_desc[:60] + '...' if len(long_desc) > 60 else long_desc
                
                # Check if it's a header (category) or billable code
                is_header = len(code) == 3  # 3-char codes are usually headers
                is_billable = not is_header
                
                # Determine parent code (for hierarchical structure)
                parent_code = None
                if len(code) > 3:
                    parent_code = code[:3]
                
                icd_code = ICD10Code(
                    code=code,
                    short_title=short_desc,
                    long_description=long_desc,
                    chapter=chapter_title,
                    chapter_number=chapter_num,
                    is_billable=is_billable,
                    is_header=is_header,
                    parent_code=parent_code
                )
                
                codes.append(icd_code)
        
        print(f"✅ Parsed {len(codes):,} ICD-10 codes from {len(root.findall('.//chapter'))} chapters")
        return codes
    
    def parse_cdc_txt(self, txt_file: Path) -> List[ICD10Code]:
        """Parse CDC ICD-10-CM TXT format (simpler, faster)"""
        print(f"📖 Parsing {txt_file.name}...")
        
        codes: List[ICD10Code] = []
        
        # TXT format: CODE    DESCRIPTION
        # Example: A00.0   Cholera due to Vibrio cholerae 01, biovar cholerae
        
        with open(txt_file, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, start=1):
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                
                # Split on multiple spaces or tab
                parts = line.split(maxsplit=1)
                if len(parts) < 2:
                    continue
                
                code, description = parts[0], parts[1]
                
                # Determine chapter from code (A00-B99 = Chapter 1, etc.)
                chapter_num, chapter_title = self._get_chapter_from_code(code)
                
                # Generate short description
                short_desc = description[:60] + '...' if len(description) > 60 else description
                
                is_header = len(code) == 3
                is_billable = not is_header
                parent_code = code[:3] if len(code) > 3 else None
                
                icd_code = ICD10Code(
                    code=code,
                    short_title=short_desc,
                    long_description=description,
                    chapter=chapter_title,
                    chapter_number=chapter_num,
                    is_billable=is_billable,
                    is_header=is_header,
                    parent_code=parent_code
                )
                
                codes.append(icd_code)
        
        print(f"✅ Parsed {len(codes):,} ICD-10 codes")
        return codes
    
    def _get_chapter_from_code(self, code: str) -> tuple[int, str]:
        """Map ICD-10 code to chapter (based on code prefix)"""
        
        # ICD-10 Chapter mappings (simplified)
        chapters = {
            'A': (1, "Certain infectious and parasitic diseases"),
            'B': (1, "Certain infectious and parasitic diseases"),
            'C': (2, "Neoplasms"),
            'D0': (2, "Neoplasms"),
            'D1': (2, "Neoplasms"),
            'D2': (2, "Neoplasms"),
            'D3': (2, "Neoplasms"),
            'D4': (2, "Neoplasms"),
            'D5': (3, "Diseases of the blood and immune system"),
            'D6': (3, "Diseases of the blood and immune system"),
            'D7': (3, "Diseases of the blood and immune system"),
            'D8': (3, "Diseases of the blood and immune system"),
            'E': (4, "Endocrine, nutritional and metabolic diseases"),
            'F': (5, "Mental and behavioral disorders"),
            'G': (6, "Diseases of the nervous system"),
            'H0': (7, "Diseases of the eye and adnexa"),
            'H1': (7, "Diseases of the eye and adnexa"),
            'H2': (7, "Diseases of the eye and adnexa"),
            'H3': (7, "Diseases of the eye and adnexa"),
            'H4': (7, "Diseases of the eye and adnexa"),
            'H5': (7, "Diseases of the eye and adnexa"),
            'H6': (8, "Diseases of the ear and mastoid process"),
            'H7': (8, "Diseases of the ear and mastoid process"),
            'H8': (8, "Diseases of the ear and mastoid process"),
            'H9': (8, "Diseases of the ear and mastoid process"),
            'I': (9, "Diseases of the circulatory system"),
            'J': (10, "Diseases of the respiratory system"),
            'K': (11, "Diseases of the digestive system"),
            'L': (12, "Diseases of the skin and subcutaneous tissue"),
            'M': (13, "Diseases of the musculoskeletal system"),
            'N': (14, "Diseases of the genitourinary system"),
            'O': (15, "Pregnancy, childbirth and the puerperium"),
            'P': (16, "Certain conditions originating in the perinatal period"),
            'Q': (17, "Congenital malformations and chromosomal abnormalities"),
            'R': (18, "Symptoms, signs and abnormal findings"),
            'S': (19, "Injury, poisoning and external causes"),
            'T': (19, "Injury, poisoning and external causes"),
            'V': (20, "External causes of morbidity"),
            'W': (20, "External causes of morbidity"),
            'X': (20, "External causes of morbidity"),
            'Y': (20, "External causes of morbidity"),
            'Z': (21, "Factors influencing health status"),
        }
        
        # Try matching by first 2 chars, then first char
        prefix = code[:2] if len(code) >= 2 else code[:1]
        if prefix in chapters:
            return chapters[prefix]
        
        prefix = code[:1]
        if prefix in chapters:
            return chapters[prefix]
        
        return (99, "Unknown chapter")
    
    def bulk_insert_supabase(self, codes: List[ICD10Code], batch_size: int = 500):
        """Insert codes into Supabase in batches (free tier limit-aware)"""
        print(f"\n📤 Uploading {len(codes):,} codes to Supabase...")
        print(f"   Batch size: {batch_size} (optimized for free tier)")
        
        url = f"{self.supabase_url}/rest/v1/icd10_codes"
        
        total_batches = (len(codes) + batch_size - 1) // batch_size
        uploaded = 0
        failed = 0
        
        for i in range(0, len(codes), batch_size):
            batch = codes[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            
            # Convert to dict for JSON
            payload = [asdict(code) for code in batch]
            
            try:
                response = requests.post(url, headers=self.headers, json=payload)
                response.raise_for_status()
                
                uploaded += len(batch)
                progress = (uploaded / len(codes)) * 100
                print(f"\r  Batch {batch_num}/{total_batches}: {uploaded:,}/{len(codes):,} ({progress:.1f}%) ✅", end='', flush=True)
            
            except requests.exceptions.HTTPError as e:
                failed += len(batch)
                print(f"\n  ❌ Batch {batch_num} failed: {e}")
                print(f"     Response: {e.response.text[:200]}")
                
                # If conflict (duplicate), try upsert instead
                if e.response.status_code == 409:
                    print(f"     Attempting upsert...")
                    self.headers['Prefer'] = 'resolution=merge-duplicates'
                    try:
                        response = requests.post(url, headers=self.headers, json=payload)
                        response.raise_for_status()
                        uploaded += len(batch)
                        failed -= len(batch)
                        print(f"     ✅ Upsert successful")
                    except Exception as upsert_error:
                        print(f"     ❌ Upsert failed: {upsert_error}")
        
        print(f"\n\n✅ Upload complete!")
        print(f"   Uploaded: {uploaded:,}")
        print(f"   Failed: {failed:,}")
        print(f"   Success rate: {(uploaded / len(codes)) * 100:.1f}%")
    
    def verify_import(self):
        """Verify ICD-10 codes in Supabase"""
        print("\n🔍 Verifying import...")
        
        url = f"{self.supabase_url}/rest/v1/icd10_codes?select=count"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            # Count total codes
            count_url = f"{self.supabase_url}/rest/v1/icd10_codes?select=code&limit=1"
            count_response = requests.head(count_url, headers=self.headers)
            
            total = count_response.headers.get('Content-Range', '0-0/*').split('/')[-1]
            
            print(f"✅ Total ICD-10 codes in database: {total}")
            
            # Sample some codes
            sample_url = f"{self.supabase_url}/rest/v1/icd10_codes?select=code,short_title,chapter&limit=5"
            sample_response = requests.get(sample_url, headers=self.headers)
            sample_data = sample_response.json()
            
            print(f"\n📋 Sample codes:")
            if isinstance(sample_data, list):
                for code in sample_data:
                    desc = code.get('short_title', 'No description')
                    print(f"   {code['code']}: {desc[:60]}...")
            else:
                print(f"   {sample_data}")
        
        except Exception as e:
            print(f"❌ Verification failed: {e}")
    
    def export_to_json(self, codes: List[ICD10Code], output_file: str = 'icd10_export.json'):
        """Export codes to JSON (for backup or offline use)"""
        output_path = self.data_dir / output_file
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump([asdict(code) for code in codes], f, indent=2, ensure_ascii=False)
        
        print(f"💾 Exported {len(codes):,} codes to {output_path}")


def main():
    parser = argparse.ArgumentParser(description='Import ICD-10-CM data to Supabase (FREE)')
    parser.add_argument('--dataset', choices=['cdc', 'who'], default='cdc', help='Dataset source')
    parser.add_argument('--year', type=int, default=2024, help='CDC dataset year')
    parser.add_argument('--format', choices=['xml', 'txt'], default='xml', help='File format')
    parser.add_argument('--verify-only', action='store_true', help='Only verify existing data')
    parser.add_argument('--export-json', action='store_true', help='Export to JSON file')
    parser.add_argument('--batch-size', type=int, default=500, help='Batch size for upload')
    
    args = parser.parse_args()
    
    # Check environment variables
    if not SUPABASE_SERVICE_KEY and not args.verify_only:
        print("❌ Error: SUPABASE_SERVICE_KEY environment variable not set")
        print("\nSet it with:")
        print("  export SUPABASE_SERVICE_KEY='your-service-role-key'")
        print("\nGet your service key from:")
        print("  https://supabase.com/dashboard/project/hwclojaalnzruviubxju/settings/api")
        sys.exit(1)
    
    importer = ICD10Importer(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    # Verify only mode
    if args.verify_only:
        importer.verify_import()
        return
    
    # Download and parse dataset
    if args.dataset == 'cdc':
        xml_file = importer.download_cdc_dataset(args.year)
        codes = importer.parse_cdc_xml(xml_file)
    
    elif args.dataset == 'who':
        print(WHO_DOWNLOAD_INFO)
        who_file = importer.data_dir / 'who_icd10' / 'LinearizationMiniOutput-MMS-en.txt'
        if not who_file.exists():
            print(f"❌ WHO dataset not found at {who_file}")
            sys.exit(1)
        codes = importer.parse_cdc_txt(who_file)  # WHO uses similar format
    
    # Export to JSON if requested
    if args.export_json:
        importer.export_to_json(codes)
    
    # Upload to Supabase
    print(f"\n⚠️  About to upload {len(codes):,} codes to Supabase")
    print(f"   This will use ~{len(codes) * 0.5 / 1024:.1f} MB of your free tier (500 MB limit)")
    
    confirm = input("\nProceed? (yes/no): ").strip().lower()
    if confirm == 'yes':
        importer.bulk_insert_supabase(codes, batch_size=args.batch_size)
        importer.verify_import()
    else:
        print("❌ Upload cancelled")
        print(f"💾 {len(codes):,} codes parsed but not uploaded")


if __name__ == '__main__':
    print("=" * 60)
    print("ICD-10-CM Data Importer (Zero-Cost)")
    print("=" * 60)
    print()
    main()
