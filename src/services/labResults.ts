/**
 * Lab Results Interpretation Service
 * Interpret common lab values and flag abnormalities using Supabase database
 */

import { supabase } from './supabase';

export interface LabResult {
  test: string;
  value: number;
  unit: string;
  referenceRange?: { min: number; max: number };
}

export interface LabInterpretation {
  test: string;
  value: number;
  unit: string;
  status: 'normal' | 'high' | 'low' | 'critical-high' | 'critical-low';
  interpretation: string;
  clinicalSignificance: string;
  recommendations: string[];
}

// Database-backed lab reference ranges (no mock data needed)

/**
 * Normalize test name for database matching
 */
function normalizeTestName(name: string): string {
  return name.toLowerCase().trim()
    .replace(/[\s-_]/g, '')
    .replace(/white blood cell count/i, 'wbc')
    .replace(/hemoglobin a1c/i, 'hba1c')
    .replace(/thyroid stimulating hormone/i, 'tsh')
    .replace(/alanine aminotransferase/i, 'alt')
    .replace(/aspartate aminotransferase/i, 'ast')
    .replace(/international normalized ratio/i, 'inr');
}

/**
 * Interpret a lab result using Supabase database
 */
export async function interpretLabResult(result: LabResult): Promise<LabInterpretation> {
  try {
    // Use original test name (database has capitalized names like "Glucose", "Potassium")
    const testName = result.test.trim();
    
    // Call Supabase function to interpret the lab result
    // Note: Function parameters are test_name_input and value_input (not test_name/test_value)
    const { data, error } = await supabase
      .rpc('interpret_lab_result', {
        test_name_input: testName,
        value_input: result.value
      });

    if (error) {
      console.error('Error interpreting lab result:', error);
      return getFallbackInterpretation(result);
    }

    if (!data || data.length === 0) {
      return getFallbackInterpretation(result);
    }

    const interpretation = data[0];
    
    return {
      test: result.test,
      value: result.value,
      unit: result.unit,
      status: interpretation.status as 'normal' | 'high' | 'low' | 'critical-high' | 'critical-low',
      interpretation: interpretation.interpretation || '',
      clinicalSignificance: interpretation.clinical_significance || '',
      recommendations: [],
    };
  } catch (error) {
    console.error('Error in interpretLabResult:', error);
    return getFallbackInterpretation(result);
  }
}

/**
 * Fallback interpretation when database is unavailable
 */
function getFallbackInterpretation(result: LabResult): LabInterpretation {
  return {
    test: result.test,
    value: result.value,
    unit: result.unit,
    status: 'normal',
    interpretation: 'Reference range not available for this test',
    clinicalSignificance: 'Unable to interpret - consult laboratory reference ranges',
    recommendations: ['Review with clinical context', 'Check laboratory reference ranges'],
  };
}

/**
 * Interpret multiple lab results using database
 */
export async function interpretLabPanel(results: LabResult[]) {
  const interpretations = await Promise.all(results.map(interpretLabResult));
  
  const critical = interpretations.filter(i => i.status.startsWith('critical'));
  const abnormal = interpretations.filter(i => i.status === 'high' || i.status === 'low');
  const normal = interpretations.filter(i => i.status === 'normal');
  
  return {
    interpretations,
    summary: {
      total: interpretations.length,
      critical: critical.length,
      abnormal: abnormal.length,
      normal: normal.length,
    },
    criticalValues: critical,
    abnormalValues: abnormal,
    overallStatus: critical.length > 0 ? 'critical' : abnormal.length > 0 ? 'abnormal' : 'normal',
  };
}

/**
 * Get lab trend analysis (compare current vs previous)
 */
export async function analyzeTrend(
  current: LabResult,
  previous: LabResult
): Promise<{
  trend: 'improving' | 'worsening' | 'stable';
  percentChange: number;
  interpretation: string;
}> {
  const change = current.value - previous.value;
  const percentChange = (change / previous.value) * 100;
  
  const currentInterp = await interpretLabResult(current);
  const previousInterp = await interpretLabResult(previous);
  
  let trend: 'improving' | 'worsening' | 'stable' = 'stable';
  let interpretation = '';
  
  // Determine trend based on status changes
  if (currentInterp.status === previousInterp.status) {
    if (Math.abs(percentChange) < 5) {
      trend = 'stable';
      interpretation = `Stable ${currentInterp.test} - minimal change`;
    } else {
      trend = 'stable';
      interpretation = `${currentInterp.test} ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(1)}%`;
    }
  } else if (
    (currentInterp.status === 'normal' && previousInterp.status !== 'normal') ||
    (currentInterp.status === 'high' && previousInterp.status === 'critical-high') ||
    (currentInterp.status === 'low' && previousInterp.status === 'critical-low')
  ) {
    trend = 'improving';
    interpretation = `${currentInterp.test} improving - moving toward normal range`;
  } else {
    trend = 'worsening';
    interpretation = `${currentInterp.test} worsening - moving away from normal range`;
  }
  
  return {
    trend,
    percentChange,
    interpretation,
  };
}
