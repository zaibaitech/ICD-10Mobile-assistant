import { RuleSuggestion, Rule, Icd10Code, SuggestedCode } from '../types';

// Define clinical reminder rules
const RULES: Rule[] = [
  {
    id: 'hypertension-secondary',
    trigger: { codePrefix: 'I10' },
    suggestion: {
      message: 'Is this essential hypertension or secondary? Consider I15.x for secondary causes.',
      relatedCodes: [
        { id: 'r1', code: 'I15.9', short_title: 'Secondary hypertension', confidence: 'medium' },
        { id: 'r2', code: 'I15.0', short_title: 'Renovascular hypertension', confidence: 'low' }
      ],
      priority: 'info'
    }
  },
  {
    id: 'diabetes-complications',
    trigger: { codePrefix: 'E11' },
    suggestion: {
      message: 'Any diabetic complications? Consider documenting neuropathy, nephropathy, or retinopathy.',
      relatedCodes: [
        { id: 'r3', code: 'E11.40', short_title: 'Type 2 DM with neuropathy', confidence: 'medium' },
        { id: 'r4', code: 'E11.21', short_title: 'Type 2 DM with nephropathy', confidence: 'medium' },
        { id: 'r5', code: 'E11.319', short_title: 'Type 2 DM with retinopathy', confidence: 'medium' }
      ],
      priority: 'warning'
    }
  },
  {
    id: 'type1-diabetes-complications',
    trigger: { codePrefix: 'E10' },
    suggestion: {
      message: 'Type 1 diabetes documented. Any complications present?',
      relatedCodes: [
        { id: 'r6', code: 'E10.40', short_title: 'Type 1 DM with neuropathy', confidence: 'medium' },
        { id: 'r7', code: 'E10.21', short_title: 'Type 1 DM with nephropathy', confidence: 'medium' }
      ],
      priority: 'warning'
    }
  },
  {
    id: 'infection-specificity',
    trigger: { keyword: 'infection' },
    suggestion: {
      message: 'Is this acute or chronic? Site-specific codes may be more accurate.',
      priority: 'info'
    }
  },
  {
    id: 'chest-pain-cardiac',
    trigger: { codePrefix: 'R07' },
    suggestion: {
      message: 'Chest pain documented. Has cardiac cause been ruled out? Consider I20-I25 codes if cardiac origin.',
      relatedCodes: [
        { id: 'r8', code: 'I20.9', short_title: 'Angina pectoris', confidence: 'low' },
        { id: 'r9', code: 'I25.10', short_title: 'Coronary artery disease', confidence: 'low' }
      ],
      priority: 'warning'
    }
  },
  {
    id: 'back-pain-specificity',
    trigger: { codePrefix: 'M54' },
    suggestion: {
      message: 'Back pain location documented. Any radiculopathy or sciatica present?',
      relatedCodes: [
        { id: 'r10', code: 'M54.16', short_title: 'Radiculopathy, lumbar', confidence: 'medium' },
        { id: 'r11', code: 'M54.40', short_title: 'Lumbago with sciatica', confidence: 'medium' }
      ],
      priority: 'info'
    }
  },
  {
    id: 'copd-specificity',
    trigger: { codePrefix: 'J44' },
    suggestion: {
      message: 'COPD documented. Is there an acute exacerbation?',
      relatedCodes: [
        { id: 'r12', code: 'J44.1', short_title: 'COPD with acute exacerbation', confidence: 'medium' }
      ],
      priority: 'warning'
    }
  },
  {
    id: 'asthma-severity',
    trigger: { codePrefix: 'J45' },
    suggestion: {
      message: 'Asthma documented. Specify severity and exacerbation status.',
      relatedCodes: [
        { id: 'r13', code: 'J45.40', short_title: 'Moderate persistent asthma', confidence: 'medium' },
        { id: 'r14', code: 'J45.901', short_title: 'Asthma, mild intermittent', confidence: 'medium' }
      ],
      priority: 'info'
    }
  },
  {
    id: 'anemia-type',
    trigger: { codePrefix: 'D50' },
    suggestion: {
      message: 'Anemia documented. Is the type and cause specified?',
      priority: 'info'
    }
  },
  {
    id: 'fracture-laterality',
    trigger: { codePrefix: 'S' },
    suggestion: {
      message: 'Injury code documented. Ensure laterality (left/right) is specified.',
      priority: 'warning'
    }
  }
];

/**
 * Get rule-based suggestions based on current codes and context
 */
export const getRuleSuggestions = (params: {
  codes: Icd10Code[];
  lastMessageText?: string;
}): RuleSuggestion[] => {
  const { codes, lastMessageText } = params;
  const suggestions: RuleSuggestion[] = [];
  const seenRules = new Set<string>();
  
  // Check code-based triggers
  codes.forEach(code => {
    RULES.forEach(rule => {
      if (seenRules.has(rule.id)) return;
      
      // Check code prefix trigger
      if (rule.trigger.codePrefix && code.code.startsWith(rule.trigger.codePrefix)) {
        suggestions.push({
          id: `${rule.id}-${code.id}`,
          message: rule.suggestion.message,
          relatedCodes: rule.suggestion.relatedCodes,
          priority: rule.suggestion.priority || 'info'
        });
        seenRules.add(rule.id);
      }
      
      // Check code ID trigger
      if (rule.trigger.codeIds && rule.trigger.codeIds.includes(code.id)) {
        suggestions.push({
          id: `${rule.id}-${code.id}`,
          message: rule.suggestion.message,
          relatedCodes: rule.suggestion.relatedCodes,
          priority: rule.suggestion.priority || 'info'
        });
        seenRules.add(rule.id);
      }
    });
  });
  
  // Check keyword-based triggers
  if (lastMessageText) {
    const lowerText = lastMessageText.toLowerCase();
    RULES.forEach(rule => {
      if (seenRules.has(rule.id)) return;
      
      if (rule.trigger.keyword && lowerText.includes(rule.trigger.keyword.toLowerCase())) {
        suggestions.push({
          id: rule.id,
          message: rule.suggestion.message,
          relatedCodes: rule.suggestion.relatedCodes,
          priority: rule.suggestion.priority || 'info'
        });
        seenRules.add(rule.id);
      }
    });
  }
  
  return suggestions;
};

/**
 * Add a new custom rule (for future extensibility)
 */
export const addCustomRule = (rule: Rule): void => {
  RULES.push(rule);
};

/**
 * Get all available rules (for debugging/admin)
 */
export const getAllRules = (): Rule[] => {
  return [...RULES];
};
