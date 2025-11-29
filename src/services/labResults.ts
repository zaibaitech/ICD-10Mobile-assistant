/**
 * Lab Results Interpretation Service
 * Interpret common lab values and flag abnormalities
 */

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

// Reference ranges for common lab tests
const LAB_REFERENCE_RANGES: Record<string, {
  unit: string;
  normal: { min: number; max: number };
  critical?: { low: number; high: number };
  interpretations: {
    low?: string;
    high?: string;
    criticalLow?: string;
    criticalHigh?: string;
  };
}> = {
  'hemoglobin': {
    unit: 'g/dL',
    normal: { min: 12, max: 16 },
    critical: { low: 7, high: 20 },
    interpretations: {
      low: 'Anemia - reduced oxygen-carrying capacity',
      high: 'Polycythemia - increased red blood cell mass',
      criticalLow: 'Severe anemia - immediate transfusion may be needed',
      criticalHigh: 'Severe polycythemia - risk of thrombosis',
    },
  },
  'wbc': {
    unit: '10^9/L',
    normal: { min: 4, max: 11 },
    critical: { low: 1, high: 30 },
    interpretations: {
      low: 'Leukopenia - increased infection risk',
      high: 'Leukocytosis - possible infection or inflammation',
      criticalLow: 'Severe leukopenia - neutropenic precautions needed',
      criticalHigh: 'Severe leukocytosis - possible leukemia or sepsis',
    },
  },
  'platelets': {
    unit: '10^9/L',
    normal: { min: 150, max: 400 },
    critical: { low: 20, high: 1000 },
    interpretations: {
      low: 'Thrombocytopenia - increased bleeding risk',
      high: 'Thrombocytosis - increased clotting risk',
      criticalLow: 'Severe thrombocytopenia - spontaneous bleeding risk',
      criticalHigh: 'Extreme thrombocytosis - thrombosis risk',
    },
  },
  'glucose': {
    unit: 'mg/dL',
    normal: { min: 70, max: 100 },
    critical: { low: 40, high: 400 },
    interpretations: {
      low: 'Hypoglycemia - may cause confusion, seizures',
      high: 'Hyperglycemia - possible diabetes or poor control',
      criticalLow: 'Severe hypoglycemia - immediate glucose needed',
      criticalHigh: 'Severe hyperglycemia - DKA/HHS risk',
    },
  },
  'creatinine': {
    unit: 'mg/dL',
    normal: { min: 0.6, max: 1.2 },
    critical: { low: 0, high: 5 },
    interpretations: {
      low: 'Low muscle mass or increased GFR',
      high: 'Renal impairment - reduced kidney function',
      criticalHigh: 'Severe renal failure - dialysis may be needed',
    },
  },
  'potassium': {
    unit: 'mmol/L',
    normal: { min: 3.5, max: 5.0 },
    critical: { low: 2.5, high: 6.5 },
    interpretations: {
      low: 'Hypokalemia - cardiac arrhythmia risk',
      high: 'Hyperkalemia - cardiac arrest risk',
      criticalLow: 'Severe hypokalemia - life-threatening arrhythmias',
      criticalHigh: 'Severe hyperkalemia - immediate treatment needed',
    },
  },
  'sodium': {
    unit: 'mmol/L',
    normal: { min: 135, max: 145 },
    critical: { low: 120, high: 160 },
    interpretations: {
      low: 'Hyponatremia - confusion, seizures possible',
      high: 'Hypernatremia - dehydration, altered mental status',
      criticalLow: 'Severe hyponatremia - seizure risk',
      criticalHigh: 'Severe hypernatremia - neurological damage risk',
    },
  },
  'alt': {
    unit: 'U/L',
    normal: { min: 7, max: 56 },
    critical: { low: 0, high: 1000 },
    interpretations: {
      high: 'Elevated liver enzymes - hepatocellular injury',
      criticalHigh: 'Severe hepatitis - acute liver failure possible',
    },
  },
  'ast': {
    unit: 'U/L',
    normal: { min: 10, max: 40 },
    critical: { low: 0, high: 1000 },
    interpretations: {
      high: 'Elevated AST - liver or cardiac injury',
      criticalHigh: 'Severe elevation - acute hepatic necrosis or MI',
    },
  },
  'inr': {
    unit: 'ratio',
    normal: { min: 0.8, max: 1.2 },
    critical: { low: 0, high: 5 },
    interpretations: {
      high: 'Prolonged INR - increased bleeding risk',
      criticalHigh: 'Severe coagulopathy - major bleeding risk',
    },
  },
  'hba1c': {
    unit: '%',
    normal: { min: 4, max: 5.6 },
    critical: { low: 0, high: 14 },
    interpretations: {
      high: 'Elevated HbA1c - poor glycemic control (>6.5% = diabetes)',
      criticalHigh: 'Severe hyperglycemia - very poor diabetes control',
    },
  },
  'tsh': {
    unit: 'mIU/L',
    normal: { min: 0.4, max: 4.0 },
    critical: { low: 0.01, high: 20 },
    interpretations: {
      low: 'Low TSH - possible hyperthyroidism',
      high: 'High TSH - possible hypothyroidism',
      criticalHigh: 'Severe hypothyroidism - myxedema coma risk',
    },
  },
};

/**
 * Normalize test name for matching
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
 * Interpret a lab result
 */
export function interpretLabResult(result: LabResult): LabInterpretation {
  const normalizedTest = normalizeTestName(result.test);
  const refData = LAB_REFERENCE_RANGES[normalizedTest];
  
  if (!refData) {
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
  
  const { normal, critical, interpretations } = refData;
  let status: LabInterpretation['status'] = 'normal';
  let interpretation = '';
  let clinicalSignificance = '';
  const recommendations: string[] = [];
  
  // Determine status
  if (critical && result.value <= critical.low) {
    status = 'critical-low';
    interpretation = interpretations.criticalLow || interpretations.low || 'Critically low';
    clinicalSignificance = 'CRITICAL - Immediate intervention may be required';
    recommendations.push('Notify physician immediately', 'Consider urgent treatment');
  } else if (critical && result.value >= critical.high) {
    status = 'critical-high';
    interpretation = interpretations.criticalHigh || interpretations.high || 'Critically high';
    clinicalSignificance = 'CRITICAL - Immediate intervention may be required';
    recommendations.push('Notify physician immediately', 'Consider urgent treatment');
  } else if (result.value < normal.min) {
    status = 'low';
    interpretation = interpretations.low || 'Below normal range';
    clinicalSignificance = 'Abnormal - clinical correlation recommended';
    recommendations.push('Repeat test if indicated', 'Evaluate for underlying cause');
  } else if (result.value > normal.max) {
    status = 'high';
    interpretation = interpretations.high || 'Above normal range';
    clinicalSignificance = 'Abnormal - clinical correlation recommended';
    recommendations.push('Repeat test if indicated', 'Evaluate for underlying cause');
  } else {
    status = 'normal';
    interpretation = 'Within normal limits';
    clinicalSignificance = 'Normal result';
    recommendations.push('Continue monitoring as clinically indicated');
  }
  
  return {
    test: result.test,
    value: result.value,
    unit: refData.unit,
    status,
    interpretation,
    clinicalSignificance,
    recommendations,
  };
}

/**
 * Interpret multiple lab results
 */
export function interpretLabPanel(results: LabResult[]) {
  const interpretations = results.map(interpretLabResult);
  
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
export function analyzeTrend(
  current: LabResult,
  previous: LabResult
): {
  trend: 'improving' | 'worsening' | 'stable';
  percentChange: number;
  interpretation: string;
} {
  const change = current.value - previous.value;
  const percentChange = (change / previous.value) * 100;
  
  const currentInterp = interpretLabResult(current);
  const previousInterp = interpretLabResult(previous);
  
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
