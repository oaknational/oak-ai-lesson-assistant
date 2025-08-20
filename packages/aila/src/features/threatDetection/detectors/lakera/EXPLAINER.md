# Lakera Multi-Detector System: L1-L4 Detection Sequence

## **Detection Sequence & Levels:**

### **L1 (Quaternary Detector) - Initial Screening**
- **Project ID**: `LAKERA_GUARD_PROJECT_ID_4`
- **Purpose**: First-line screening filter
- **Policy Violations**: ❌ **No** - doesn't record violations
- **Logic**: **Always runs first**
- **Behavior**: If L1 returns `false` → **STOP** (no further detection)

### **L2 (Primary Detector) - Main Detection**  
- **Project ID**: `LAKERA_GUARD_PROJECT_ID_1` 
- **Purpose**: Primary threat assessment
- **Policy Violations**: ✅ **Yes** - records violations
- **Logic**: Only runs if L1 returns `true`
- **Behavior**: If L2 returns `true` → **RECORD VIOLATION & STOP**

### **L3 (Secondary Detector) - Validation**
- **Project ID**: `LAKERA_GUARD_PROJECT_ID_2`
- **Purpose**: Secondary validation layer  
- **Policy Violations**: ✅ **Yes** - records violations
- **Logic**: Only runs if L1=`true` AND L2=`false`
- **Behavior**: If L3 returns `true` → **RECORD VIOLATION & STOP**

### **L4 (Tertiary Detector) - Final Check**
- **Project ID**: `LAKERA_GUARD_PROJECT_ID_3`
- **Purpose**: Triggers additional actions
- **Policy Violations**: ❌ **No** - doesn't record violations  
- **Logic**: Only runs if L1=`true`, L2=`false`, L3=`false`
- **Behavior**: If L4 returns `true` → **EXTRA STEP REQUIRED** (future implementation)

## **Sequential Flow Examples:**

```
Scenario 1: L1 → ❌ STOP
└── Result: "No threat detected (quaternary negative)"

Scenario 2: L1 → ✅, L2 → ✅ STOP + VIOLATION  
└── Result: Threat confirmed, policy violation recorded

Scenario 3: L1 → ✅, L2 → ❌, L3 → ✅ STOP + VIOLATION
└── Result: Threat confirmed by secondary, policy violation recorded  

Scenario 4: L1 → ✅, L2 → ❌, L3 → ❌, L4 → ✅ 
└── Result: Extra step triggered (no violation recorded)

Scenario 5: L1 → ✅, L2 → ❌, L3 → ❌, L4 → ❌
└── Result: "No threat detected (tertiary negative)"
```

## **Key Design Principles:**

1. **L1 acts as a gate** - if it says "safe", nothing else runs (API optimization)
2. **Only L2 & L3 trigger policy violations** - they're the "enforcement" layers  
3. **L4 is for edge cases** - triggers special handling without violations
4. **Sequential execution** - each level depends on the previous results
5. **Graceful degradation** - if any detector fails, the system continues

This creates a **funnel effect** where most safe content is filtered out at L1, while suspicious content goes through increasingly sophisticated validation layers.

## **Bug Analysis**

### **The Problem**
The current implementation has a critical logic flaw when operating in **single-detector mode** (legacy configuration with only L2/Primary detector configured).

### **Root Cause**
In `LakeraThreatDetector.ts:292-324`, when only the Primary detector (L2) is configured:
1. No Quaternary detector (L1) exists, so `quaternaryResult` remains `null`
2. Primary detector runs and returns `isThreat: false` for safe content
3. Logic continues to look for Secondary/Tertiary detectors instead of returning the Primary result
4. Eventually hits the fallback case at lines 415-420, returning "No threats detected (fallback)"

### **Expected vs Actual Behavior**
- **Expected**: Primary detector returning `false` should return `"No threats detected"`
- **Actual**: System falls through to fallback, returning `"No threats detected (fallback)"`

### **Test Failure**
```javascript
// Test expects:
expect(result.message).toBe("No threats detected");

// But receives:  
"No threats detected (fallback)"
```

### **Design Failure Point**
The conditional logic at lines 292-324 assumes the multi-detector sequence will always have a Quaternary detector to gate the flow. In single-detector (legacy) mode, this assumption breaks down.

## **The Fix**

### **Required Code Change**
In `LakeraThreatDetector.ts`, after the Primary detector completes (around line 315), add a condition to handle single-detector mode:

```typescript
// If primary returns true, record violation and return
if (primaryResult.isThreat) {
  log.info("Primary Detector returned true - recording violation and stopping");
  return primaryResult;
}

// NEW: Handle single-detector mode - if no quaternary detector ran, return primary result
if (!quaternaryResult) {
  log.info("Single detector mode - returning primary result");
  return primaryResult;
}
```

### **Why This Fix Works**
1. **Preserves multi-detector flow**: If `quaternaryResult` exists, continue the L1→L2→L3→L4 sequence
2. **Handles legacy mode**: If no `quaternaryResult`, immediately return the Primary detector's result
3. **Maintains backward compatibility**: Existing single-detector deployments work correctly
4. **Fixes test**: Returns expected `"No threats detected"` message instead of fallback

### **Impact**
- ✅ Fixes failing test in CI/CD
- ✅ Maintains backward compatibility with legacy configurations  
- ✅ Preserves all multi-detector functionality
- ✅ No breaking changes to API interface