# Enhanced Lakera Threat Detection System

## Overview

The Lakera threat detection system has been enhanced to support multiple detectors with conditional logic and selective policy violation recording. This provides more robust threat detection while optimizing API usage and providing granular control over policy enforcement.

## Key Features

### Multiple Detectors

- **4 separate Lakera detectors** each with their own project ID
- **Conditional execution logic** to optimize API calls
- **Selective policy violation recording** per detector

### Conditional Logic

- **Primary detector** always runs first
- **Secondary detectors** run based on primary detector results
- **Smart optimization** to avoid unnecessary API calls

### Policy Violation Control

- **Primary detector** records policy violations
- **Secondary detectors** do not record violations (for validation only)
- **Configurable per detector**

## Detector Configuration

### 1. Quaternary Detector (First)

- **Project ID**: `LAKERA_GUARD_PROJECT_ID_4`
- **Behavior**: Always runs first
- **Policy Violations**: ❌ No violations recorded
- **Purpose**: Initial screening

### 2. Primary Detector

- **Project ID**: `LAKERA_GUARD_PROJECT_ID_1`
- **Behavior**: Runs only if quaternary finds threat
- **Policy Violations**: ✅ Records violations if threat detected
- **Purpose**: Primary threat assessment

### 3. Secondary Detector

- **Project ID**: `LAKERA_GUARD_PROJECT_ID_2`
- **Behavior**: Runs only if primary finds NO threat
- **Policy Violations**: ✅ Records violations if threat detected
- **Purpose**: Secondary validation

### 4. Tertiary Detector

- **Project ID**: `LAKERA_GUARD_PROJECT_ID_3`
- **Behavior**: Runs only if secondary finds NO threat
- **Policy Violations**: ❌ No violations recorded
- **Purpose**: Triggers extra step if threat detected

## Environment Variables

```bash
# Required
LAKERA_GUARD_API_KEY=your_api_key

# Primary detector (required)
LAKERA_GUARD_PROJECT_ID_1=project_id_1

# Secondary detectors (optional)
LAKERA_GUARD_PROJECT_ID_2=project_id_2
LAKERA_GUARD_PROJECT_ID_3=project_id_3
LAKERA_GUARD_PROJECT_ID_4=project_id_4

# Legacy support (fallback for primary)
LAKERA_GUARD_PROJECT_ID=legacy_project_id

# API URL (optional)
LAKERA_GUARD_URL=https://api.lakera.ai/v2/guard
```

## Execution Flow

### Scenario 1: Quaternary Detector Finds No Threat

```
1. Quaternary Detector (LAKERA_GUARD_PROJECT_ID_4) → NO THREAT
2. All other detectors → SKIPPED
3. Result: No threat detected, no policy violation
```

### Scenario 2: Quaternary Finds Threat, Primary Confirms

```
1. Quaternary Detector (LAKERA_GUARD_PROJECT_ID_4) → THREAT DETECTED
2. Primary Detector (LAKERA_GUARD_PROJECT_ID_1) → THREAT CONFIRMED
3. Secondary & Tertiary Detectors → SKIPPED
4. Result: Threat confirmed, policy violation recorded
```

### Scenario 3: Quaternary Finds Threat, Primary Finds No Threat, Secondary Confirms

```
1. Quaternary Detector (LAKERA_GUARD_PROJECT_ID_4) → THREAT DETECTED
2. Primary Detector (LAKERA_GUARD_PROJECT_ID_1) → NO THREAT
3. Secondary Detector (LAKERA_GUARD_PROJECT_ID_2) → THREAT CONFIRMED
4. Tertiary Detector → SKIPPED
5. Result: Threat confirmed, policy violation recorded
```

### Scenario 4: Quaternary Finds Threat, Primary & Secondary Find No Threat, Tertiary Finds Threat

```
1. Quaternary Detector (LAKERA_GUARD_PROJECT_ID_4) → THREAT DETECTED
2. Primary Detector (LAKERA_GUARD_PROJECT_ID_1) → NO THREAT
3. Secondary Detector (LAKERA_GUARD_PROJECT_ID_2) → NO THREAT
4. Tertiary Detector (LAKERA_GUARD_PROJECT_ID_3) → THREAT DETECTED
5. Result: Threat detected, extra step required (to be implemented)
```

### Scenario 5: Quaternary Finds Threat, All Others Find No Threat

```
1. Quaternary Detector (LAKERA_GUARD_PROJECT_ID_4) → THREAT DETECTED
2. Primary Detector (LAKERA_GUARD_PROJECT_ID_1) → NO THREAT
3. Secondary Detector (LAKERA_GUARD_PROJECT_ID_2) → NO THREAT
4. Tertiary Detector (LAKERA_GUARD_PROJECT_ID_3) → NO THREAT
5. Result: No threat confirmed, no policy violation
```

## API Usage Optimization

### Before (Single Detector)

- Every request: 1 API call
- No validation or redundancy

### After (Multiple Detectors)

- **No threat detected**: 1 API call (quaternary only)
- **Threat detected early**: 2 API calls (quaternary + primary)
- **Threat detected late**: 3-4 API calls (quaternary + primary + secondary + tertiary)
- **Error handling**: 1 API call (quaternary only)

## Policy Violation Recording

### Primary & Secondary Detectors

- ✅ Records policy violations in database
- ✅ Triggers user banning logic
- ✅ Sends analytics events
- ✅ Logs detailed threat information

### Quaternary & Tertiary Detectors

- ❌ No policy violations recorded
- ❌ No user banning
- ❌ No analytics events
- ✅ Logs validation results
- 🔄 Tertiary detector triggers extra step when threat detected

## Error Handling

### Graceful Degradation

- If primary detector fails, assume no threat
- If secondary detectors fail, continue with primary result
- Comprehensive error logging for debugging

### Fallback Behavior

- Missing project IDs are filtered out
- Legacy project ID support for backward compatibility
- Minimum 1 detector required for operation

## Logging

### Enhanced Logging

- Detector name and project ID in all logs
- Conditional logic decisions logged
- API request/response details per detector
- Error context for debugging

### Example Log Output

```
[INFO] Running Lakera detector { detectorName: "Primary Detector", projectId: "project-1", index: 0 }
[INFO] Detector completed { detectorName: "Primary Detector", isThreat: true, severity: "critical" }
[INFO] Running Lakera detector { detectorName: "Secondary Detector", projectId: "project-2", index: 1 }
[INFO] Detector completed { detectorName: "Secondary Detector", isThreat: true, severity: "critical" }
```

## Testing

### Test Coverage

- ✅ Initialization with multiple detectors
- ✅ Conditional logic validation
- ✅ Policy violation configuration
- ✅ Error handling scenarios
- ✅ Environment variable fallbacks

### Running Tests

```bash
# Run Lakera detector tests
pnpm test -- --testPathPattern=LakeraThreatDetector

# Run specific multi-detector tests
pnpm test -- --testPathPattern=MultiDetectorLakeraThreatDetector
```

## Migration Guide

### From Single Detector

1. **Add new environment variables** for additional project IDs
2. **Configure Lakera projects** in your Lakera dashboard
3. **Update deployment scripts** to include new environment variables
4. **Monitor logs** to ensure proper detector initialization

### Backward Compatibility

- Legacy `LAKERA_GUARD_PROJECT_ID` still supported as fallback
- Single detector mode still works if only primary is configured
- No breaking changes to existing API

## Performance Considerations

### API Rate Limits

- Monitor Lakera API rate limits across multiple detectors
- Consider implementing rate limiting if needed
- Optimize conditional logic to minimize API calls

### Response Times

- Sequential execution may increase response time
- Consider parallel execution for secondary detectors (future enhancement)
- Monitor and log performance metrics

## Security Considerations

### API Key Management

- Single API key shared across all detectors
- Ensure proper key rotation and access controls
- Monitor API usage per project ID

### Threat Detection Accuracy

- Multiple detectors provide redundancy
- Reduces false positives and false negatives
- Validates threat detection across different models

## Future Enhancements

### Potential Improvements

- **Parallel execution** of secondary detectors
- **Dynamic detector selection** based on threat type
- **Custom conditional logic** per detector
- **Performance metrics** and monitoring
- **A/B testing** different detector configurations
