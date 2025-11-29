/**
 * Lab Results Interpreter
 * Interpret common lab values and provide clinical context
 */

export interface LabTest {
  name: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
}

export interface LabInterpretation {
  test: string;
  value: number;
  unit: string;
  status: 'low' | 'normal' | 'high' | 'critical';
  severity: 'mild' | 'moderate' | 'severe' | 'critical' | 'normal';
  interpretation: string;
  possibleCauses: string[];
  recommendations: string[];
  urgency: 'routine' | 'urgent' | 'emergent';
}

// Reference ranges for common lab tests
export const LAB_REFERENCE_RANGES: Record<string, {
  unit: string;
  normal: { min: number; max: number };
  critical?: { low: number; high: number };
  description: string;
}> = {
  'hemoglobin': {
    unit: 'g/dL',
    normal: { min: 12, max: 16 },
    critical: { low: 7, high: 20 },
    description: 'Oxygen-carrying protein in red blood cells'
  },
  'hematocrit': {
    unit: '%',
    normal: { min: 36, max: 48 },
    critical: { low: 20, high: 60 },
    description: 'Percentage of blood volume occupied by red cells'
  },
  'wbc': {
    unit: '×10³/μL',
    normal: { min: 4.5, max: 11 },
    critical: { low: 2, high: 30 },
    description: 'White blood cell count - immune system cells'
  },
  'platelets': {
    unit: '×10³/μL',
    normal: { min: 150, max: 400 },
    critical: { low: 20, high: 1000 },
    description: 'Blood clotting cells'
  },
  'glucose': {
    unit: 'mg/dL',
    normal: { min: 70, max: 100 },
    critical: { low: 40, high: 400 },
    description: 'Blood sugar level (fasting)'
  },
  'creatinine': {
    unit: 'mg/dL',
    normal: { min: 0.6, max: 1.2 },
    critical: { low: 0, high: 5 },
    description: 'Kidney function marker'
  },
  'bun': {
    unit: 'mg/dL',
    normal: { min: 7, max: 20 },
    critical: { low: 0, high: 100 },
    description: 'Blood urea nitrogen - kidney function'
  },
  'sodium': {
    unit: 'mEq/L',
    normal: { min: 135, max: 145 },
    critical: { low: 120, high: 160 },
    description: 'Electrolyte - regulates fluid balance'
  },
  'potassium': {
    unit: 'mEq/L',
    normal: { min: 3.5, max: 5.0 },
    critical: { low: 2.5, high: 6.5 },
    description: 'Electrolyte - critical for heart rhythm'
  },
  'alt': {
    unit: 'U/L',
    normal: { min: 7, max: 56 },
    critical: { low: 0, high: 1000 },
    description: 'Alanine aminotransferase - liver enzyme'
  },
  'ast': {
    unit: 'U/L',
    normal: { min: 10, max: 40 },
    critical: { low: 0, high: 1000 },
    description: 'Aspartate aminotransferase - liver enzyme'
  },
  'tsh': {
    unit: 'μIU/mL',
    normal: { min: 0.4, max: 4.0 },
    critical: { low: 0.01, high: 20 },
    description: 'Thyroid stimulating hormone'
  },
  'inr': {
    unit: 'ratio',
    normal: { min: 0.8, max: 1.2 },
    critical: { low: 0, high: 5 },
    description: 'International normalized ratio - blood clotting'
  }
};

/**
 * Interpret a single lab result
 */
export function interpretLabResult(test: LabTest): LabInterpretation {
  const testName = test.name.toLowerCase();
  const reference = LAB_REFERENCE_RANGES[testName];

  if (!reference) {
    return {
      test: test.name,
      value: test.value,
      unit: test.unit,
      status: 'normal',
      severity: 'normal',
      interpretation: 'Reference range not available for this test',
      possibleCauses: [],
      recommendations: ['Consult with healthcare provider for interpretation'],
      urgency: 'routine'
    };
  }

  const { normal, critical } = reference;
  let status: 'low' | 'normal' | 'high' | 'critical';
  let severity: 'mild' | 'moderate' | 'severe' | 'critical' | 'normal';
  let urgency: 'routine' | 'urgent' | 'emergent';

  // Determine status and severity
  if (test.value < normal.min) {
    if (critical && test.value < critical.low) {
      status = 'critical';
      severity = 'critical';
      urgency = 'emergent';
    } else {
      status = 'low';
      const deviation = ((normal.min - test.value) / normal.min) * 100;
      if (deviation > 30) {
        severity = 'severe';
        urgency = 'urgent';
      } else if (deviation > 15) {
        severity = 'moderate';
        urgency = 'urgent';
      } else {
        severity = 'mild';
        urgency = 'routine';
      }
    }
  } else if (test.value > normal.max) {
    if (critical && test.value > critical.high) {
      status = 'critical';
      severity = 'critical';
      urgency = 'emergent';
    } else {
      status = 'high';
      const deviation = ((test.value - normal.max) / normal.max) * 100;
      if (deviation > 30) {
        severity = 'severe';
        urgency = 'urgent';
      } else if (deviation > 15) {
        severity = 'moderate';
        urgency = 'urgent';
      } else {
        severity = 'mild';
        urgency = 'routine';
      }
    }
  } else {
    status = 'normal';
    severity = 'normal';
    urgency = 'routine';
  }

  // Get interpretation based on test type and status
  const interpretation = getInterpretation(testName, status, test.value, reference);

  return {
    test: test.name,
    value: test.value,
    unit: test.unit,
    status,
    severity,
    interpretation: interpretation.description,
    possibleCauses: interpretation.causes,
    recommendations: interpretation.recommendations,
    urgency
  };
}

/**
 * Get detailed interpretation for specific test
 */
function getInterpretation(testName: string, status: string, value: number, reference: any): {
  description: string;
  causes: string[];
  recommendations: string[];
} {
  const interpretations: Record<string, any> = {
    'hemoglobin': {
      low: {
        description: 'Anemia detected - reduced oxygen-carrying capacity',
        causes: ['Iron deficiency', 'Vitamin B12 deficiency', 'Chronic disease', 'Blood loss', 'Hemolysis'],
        recommendations: ['Check iron studies', 'Evaluate for bleeding source', 'Consider B12/folate levels', 'Assess for chronic diseases']
      },
      high: {
        description: 'Elevated hemoglobin - possible polycythemia',
        causes: ['Dehydration', 'Chronic lung disease', 'Smoking', 'Polycythemia vera', 'High altitude'],
        recommendations: ['Check hydration status', 'Evaluate oxygen levels', 'Consider hematology consult if persistently elevated']
      },
      critical: {
        description: value < 7 ? 'CRITICAL: Severe anemia - transfusion may be needed' : 'CRITICAL: Severe polycythemia',
        causes: value < 7 ? ['Acute blood loss', 'Severe hemolysis', 'Bone marrow failure'] : ['Polycythemia vera', 'Severe dehydration'],
        recommendations: value < 7 ? ['URGENT: Consider blood transfusion', 'Hospitalize', 'Find bleeding source'] : ['URGENT: Phlebotomy may be needed', 'Hematology consult']
      }
    },
    'wbc': {
      low: {
        description: 'Leukopenia - reduced white blood cell count',
        causes: ['Viral infection', 'Medication side effect', 'Bone marrow disorders', 'Autoimmune disease'],
        recommendations: ['Review medications', 'Check for infection', 'Consider immune workup', 'Avoid sick contacts if severe']
      },
      high: {
        description: 'Leukocytosis - elevated white blood cell count',
        causes: ['Infection', 'Inflammation', 'Stress', 'Medications (steroids)', 'Leukemia'],
        recommendations: ['Evaluate for infection', 'Check differential count', 'Consider inflammatory markers', 'If very high, rule out leukemia']
      },
      critical: {
        description: value < 2 ? 'CRITICAL: Severe leukopenia - high infection risk' : 'CRITICAL: Severe leukocytosis',
        causes: value < 2 ? ['Chemotherapy', 'Severe infection', 'Bone marrow failure'] : ['Leukemia', 'Severe infection', 'Leukemoid reaction'],
        recommendations: value < 2 ? ['URGENT: Neutropenic precautions', 'Consider G-CSF', 'Hematology consult'] : ['URGENT: Rule out leukemia', 'Immediate hematology consult']
      }
    },
    'glucose': {
      low: {
        description: 'Hypoglycemia - low blood sugar',
        causes: ['Excessive insulin/medications', 'Missed meal', 'Excess exercise', 'Insulinoma (rare)'],
        recommendations: ['Immediate glucose administration', 'Adjust diabetes medications', 'Check insulin dosing', 'Frequent monitoring']
      },
      high: {
        description: 'Hyperglycemia - elevated blood sugar',
        causes: ['Diabetes mellitus', 'Stress', 'Medications (steroids)', 'Infection', 'Pancreatitis'],
        recommendations: ['Check HbA1c', 'Diabetes screening', 'Dietary modifications', 'Consider medications if persistent']
      },
      critical: {
        description: value < 40 ? 'CRITICAL: Severe hypoglycemia' : 'CRITICAL: Severe hyperglycemia - DKA/HHS risk',
        causes: value < 40 ? ['Insulin overdose', 'Severe illness', 'Adrenal insufficiency'] : ['Uncontrolled diabetes', 'DKA', 'HHS'],
        recommendations: value < 40 ? ['URGENT: IV dextrose', 'Continuous monitoring', 'Find cause'] : ['URGENT: Check for DKA/HHS', 'IV fluids', 'Insulin drip', 'Hospitalize']
      }
    },
    'potassium': {
      low: {
        description: 'Hypokalemia - low potassium',
        causes: ['Diuretics', 'Vomiting/diarrhea', 'Alkalosis', 'Hyperaldosteronism'],
        recommendations: ['Potassium supplementation', 'Check magnesium', 'ECG if severe', 'Adjust diuretics']
      },
      high: {
        description: 'Hyperkalemia - high potassium',
        causes: ['Kidney disease', 'ACE inhibitors/ARBs', 'Potassium supplements', 'Hemolysis (spurious)'],
        recommendations: ['Repeat to confirm', 'ECG', 'Stop potassium sources', 'Consider kayexalate/insulin+glucose if high']
      },
      critical: {
        description: value < 2.5 ? 'CRITICAL: Severe hypokalemia - arrhythmia risk' : 'CRITICAL: Severe hyperkalemia - life-threatening',
        causes: value < 2.5 ? ['Severe GI losses', 'Diuretic abuse', 'Renal tubular acidosis'] : ['Acute kidney injury', 'Medication accumulation', 'Tumor lysis'],
        recommendations: value < 2.5 ? ['URGENT: IV potassium', 'Cardiac monitor', 'Frequent recheck'] : ['URGENT: Calcium gluconate', 'Insulin+glucose', 'Dialysis may be needed', 'ECG']
      }
    },
    'creatinine': {
      low: {
        description: 'Low creatinine - usually benign',
        causes: ['Low muscle mass', 'Malnutrition', 'Pregnancy'],
        recommendations: ['Generally no action needed', 'Assess nutritional status if very low']
      },
      high: {
        description: 'Elevated creatinine - impaired kidney function',
        causes: ['Acute kidney injury', 'Chronic kidney disease', 'Dehydration', 'Medications', 'Rhabdomyolysis'],
        recommendations: ['Calculate eGFR', 'Check previous values', 'Renal ultrasound', 'Review nephrotoxic medications', 'Urine studies']
      },
      critical: {
        description: 'CRITICAL: Severe renal impairment',
        causes: ['Acute kidney injury', 'End-stage renal disease', 'Severe dehydration', 'Urinary obstruction'],
        recommendations: ['URGENT: Nephrology consult', 'Consider dialysis', 'Check for obstruction', 'IV fluids if volume depleted']
      }
    }
  };

  const testInterpretation = interpretations[testName];
  if (!testInterpretation) {
    return {
      description: `${status.toUpperCase()} value detected`,
      causes: ['Multiple possible causes'],
      recommendations: ['Consult healthcare provider for interpretation']
    };
  }

  return testInterpretation[status] || testInterpretation.normal || {
    description: 'Value within normal range',
    causes: [],
    recommendations: ['Continue routine monitoring']
  };
}

/**
 * Interpret multiple lab results together
 */
export function interpretLabPanel(tests: LabTest[]): {
  interpretations: LabInterpretation[];
  summary: string;
  urgentFindings: LabInterpretation[];
} {
  const interpretations = tests.map(test => interpretLabResult(test));
  
  const urgentFindings = interpretations.filter(
    interp => interp.urgency === 'urgent' || interp.urgency === 'emergent'
  );

  const criticalCount = interpretations.filter(i => i.severity === 'critical').length;
  const abnormalCount = interpretations.filter(i => i.status !== 'normal').length;

  let summary = '';
  if (criticalCount > 0) {
    summary = `⚠️ CRITICAL: ${criticalCount} critical finding(s) requiring immediate attention`;
  } else if (urgentFindings.length > 0) {
    summary = `⚠️ ${urgentFindings.length} urgent finding(s) requiring prompt evaluation`;
  } else if (abnormalCount > 0) {
    summary = `${abnormalCount} abnormal finding(s) - routine follow-up recommended`;
  } else {
    summary = '✓ All values within normal range';
  }

  return {
    interpretations,
    summary,
    urgentFindings
  };
}
