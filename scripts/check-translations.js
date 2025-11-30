#!/usr/bin/env node

/**
 * Translation Coverage Checker
 * 
 * This script checks translation coverage across all language files
 * and reports missing translations.
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const SOURCE_LANG = 'en';

function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return null;
  }
}

function flattenObject(obj, prefix = '') {
  const result = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  
  return result;
}

function checkTranslations() {
  console.log('🔍 Checking translation coverage...\n');
  
  // Load source language
  const sourcePath = path.join(LOCALES_DIR, `${SOURCE_LANG}.json`);
  const sourceData = loadJSON(sourcePath);
  
  if (!sourceData) {
    console.error('❌ Failed to load source language file');
    process.exit(1);
  }
  
  const sourceKeys = flattenObject(sourceData);
  const sourceKeysList = Object.keys(sourceKeys);
  const totalKeys = sourceKeysList.length;
  
  console.log(`📚 Source language (${SOURCE_LANG}): ${totalKeys} strings\n`);
  
  // Get all language files
  const langFiles = fs.readdirSync(LOCALES_DIR)
    .filter(file => file.endsWith('.json') && file !== `${SOURCE_LANG}.json`);
  
  const results = [];
  
  // Check each language
  for (const langFile of langFiles) {
    const langCode = langFile.replace('.json', '');
    const langPath = path.join(LOCALES_DIR, langFile);
    const langData = loadJSON(langPath);
    
    if (!langData) continue;
    
    const langKeys = flattenObject(langData);
    const translatedKeys = Object.keys(langKeys);
    const missingKeys = sourceKeysList.filter(key => !langKeys.hasOwnProperty(key));
    const coverage = ((translatedKeys.length / totalKeys) * 100).toFixed(1);
    
    results.push({
      code: langCode,
      translated: translatedKeys.length,
      missing: missingKeys.length,
      coverage: parseFloat(coverage),
      missingKeysList: missingKeys
    });
  }
  
  // Sort by coverage (descending)
  results.sort((a, b) => b.coverage - a.coverage);
  
  // Display results
  console.log('┌─────────────┬────────────┬─────────┬──────────┐');
  console.log('│ Language    │ Translated │ Missing │ Coverage │');
  console.log('├─────────────┼────────────┼─────────┼──────────┤');
  
  for (const result of results) {
    const statusIcon = result.coverage === 100 ? '✅' : 
                       result.coverage >= 80 ? '🟡' : '❌';
    const langName = result.code.padEnd(11);
    const translated = result.translated.toString().padStart(10);
    const missing = result.missing.toString().padStart(7);
    const coverage = `${result.coverage}%`.padStart(8);
    
    console.log(`│ ${statusIcon} ${langName} │ ${translated} │ ${missing} │ ${coverage} │`);
  }
  
  console.log('└─────────────┴────────────┴─────────┴──────────┘\n');
  
  // Show missing keys for incomplete languages
  for (const result of results) {
    if (result.coverage < 100 && result.missingKeysList.length > 0) {
      console.log(`\n⚠️  Missing keys in ${result.code} (${result.missing} keys):`);
      const preview = result.missingKeysList.slice(0, 10);
      preview.forEach(key => console.log(`   - ${key}`));
      
      if (result.missingKeysList.length > 10) {
        console.log(`   ... and ${result.missingKeysList.length - 10} more`);
      }
    }
  }
  
  // Summary
  const avgCoverage = (results.reduce((sum, r) => sum + r.coverage, 0) / results.length).toFixed(1);
  const complete = results.filter(r => r.coverage === 100).length;
  const partial = results.filter(r => r.coverage >= 50 && r.coverage < 100).length;
  const incomplete = results.filter(r => r.coverage < 50).length;
  
  console.log('\n📊 Summary:');
  console.log(`   Total languages: ${results.length + 1} (including source)`);
  console.log(`   Average coverage: ${avgCoverage}%`);
  console.log(`   ✅ Complete (100%): ${complete}`);
  console.log(`   🟡 Partial (50-99%): ${partial}`);
  console.log(`   ❌ Incomplete (<50%): ${incomplete}`);
  
  if (complete === results.length) {
    console.log('\n🎉 All translations are complete!');
  } else {
    console.log(`\n💡 Tip: Run "npm run crowdin:upload" to sync with Crowdin for community translation.`);
  }
  
  console.log('');
}

checkTranslations();
