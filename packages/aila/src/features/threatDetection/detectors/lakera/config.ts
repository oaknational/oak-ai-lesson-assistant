/**
 * Configuration for multiple Lakera threat detectors
 * 
 * This file documents the environment variables needed for the enhanced
 * Lakera threat detection system with multiple detectors and conditional logic.
 */

export interface LakeraEnvironmentConfig {
  // Primary API key (shared across all detectors)
  LAKERA_GUARD_API_KEY: string;
  
  // API URL (shared across all detectors)
  LAKERA_GUARD_URL?: string;
  
  // Project IDs for different detectors
  LAKERA_GUARD_PROJECT_ID_1: string;  // Primary detector (always runs, records violations)
  LAKERA_GUARD_PROJECT_ID_2: string;  // Secondary detector (runs on first positive, no violations)
  LAKERA_GUARD_PROJECT_ID_3: string;  // Tertiary detector (runs on first positive, no violations)
  LAKERA_GUARD_PROJECT_ID_4: string;  // Quaternary detector (runs on first negative, no violations)
  
  // Legacy support
  LAKERA_GUARD_PROJECT_ID?: string;   // Fallback for primary detector
}

/**
 * Detector Configuration Summary:
 * 
 * 1. Quaternary Detector (LAKERA_GUARD_PROJECT_ID_4) - FIRST
 *    - Always runs first
 *    - Does not record policy violations
 *    - Used for initial screening
 * 
 * 2. Primary Detector (LAKERA_GUARD_PROJECT_ID_1)
 *    - Runs only if quaternary detector finds a threat
 *    - Records policy violations if threat detected
 *    - Used for primary threat assessment
 * 
 * 3. Secondary Detector (LAKERA_GUARD_PROJECT_ID_2)
 *    - Runs only if primary detector finds NO threat
 *    - Records policy violations if threat detected
 *    - Used for secondary validation
 * 
 * 4. Tertiary Detector (LAKERA_GUARD_PROJECT_ID_3)
 *    - Runs only if secondary detector finds NO threat
 *    - Does not record policy violations
 *    - Triggers extra step if threat detected
 * 
 * Conditional Logic:
 * - Step 1: Run quaternary detector → if false, stop
 * - Step 2: Run primary detector → if true, record violation and stop
 * - Step 3: Run secondary detector → if true, record violation and stop
 * - Step 4: Run tertiary detector → if false, do nothing; if true, extra step needed
 */

export const LAKERA_DETECTOR_CONFIG = {
  QUATERNARY: {
    name: 'Quaternary Detector (First)',
    recordPolicyViolation: false,
    runCondition: 'always' as const,
    envVar: 'LAKERA_GUARD_PROJECT_ID_4'
  },
  PRIMARY: {
    name: 'Primary Detector',
    recordPolicyViolation: true,
    runCondition: 'on_quaternary_positive' as const,
    envVar: 'LAKERA_GUARD_PROJECT_ID_1'
  },
  SECONDARY: {
    name: 'Secondary Detector',
    recordPolicyViolation: true,
    runCondition: 'on_primary_negative' as const,
    envVar: 'LAKERA_GUARD_PROJECT_ID_2'
  },
  TERTIARY: {
    name: 'Tertiary Detector',
    recordPolicyViolation: false,
    runCondition: 'on_secondary_negative' as const,
    envVar: 'LAKERA_GUARD_PROJECT_ID_3'
  }
} as const;
