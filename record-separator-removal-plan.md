# Record Separator Removal Implementation Plan

## Overview

Replace the record separator (␞) with newline-delimited JSON (NDJSON) format for cleaner message handling.

## Current Format Example

```
{"type":"llmMessage","patches":[...],"prompt":{...}}
␞
{"type":"moderation","categories":{...}}
␞
{"type":"id","value":"msg_123"}
␞
{"type":"state","value":{...}}
```

## New Format Example (NDJSON)

```
{"type":"llmMessage","patches":[...],"prompt":{...}}
{"type":"moderation","categories":{...}}
{"type":"id","value":"msg_123"}
{"type":"state","value":{...}}
```

## Implementation Steps

### Phase 1: Local Testing & Analysis

1. **Run app locally** to capture current network responses
2. **Document** the exact format of streamed responses
3. **Identify** all message types being sent

### Phase 2: Core Changes

#### 1. PatchEnqueuer.ts

```typescript
// OLD
private formatPatch(patch: JsonPatchDocumentOptional): string {
  return `\n␞\n${JSON.stringify(patch)}\n␞\n`;
}

// NEW
private formatPatch(patch: JsonPatchDocumentOptional): string {
  return `${JSON.stringify(patch)}\n`;
}
```

#### 2. jsonPatchProtocol.ts

```typescript
// OLD
export function parseMessageParts(content: string): MessagePart[] {
  const messageParts = content
    .split("␞")
    .map((r) => r.trim())
    .filter((r) => r.length > 5)
    .flatMap((row, index) => parseMessageRow(row, index))
    .filter((part) => part !== undefined)
    .flat();
  return messageParts;
}

// NEW
export function parseMessageParts(content: string): MessagePart[] {
  // Support both formats for backward compatibility
  if (content.includes("␞")) {
    // Legacy format
    return parseMessagePartsLegacy(content);
  }

  // New NDJSON format
  const messageParts = content
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r.length > 0)
    .flatMap((row, index) => parseMessageRow(row, index))
    .filter((part) => part !== undefined)
    .flat();
  return messageParts;
}

function parseMessagePartsLegacy(content: string): MessagePart[] {
  // Keep old logic for backward compatibility
  const messageParts = content
    .split("␞")
    .map((r) => r.trim())
    .filter((r) => r.length > 5)
    .flatMap((row, index) => parseMessageRow(row, index))
    .filter((part) => part !== undefined)
    .flat();
  return messageParts;
}
```

#### 3. AilaPromptBuilder.ts

```typescript
// OLD
public reduceMessagesForPrompt(messages: Message[]): Message[] {
  return messages.map((m) => {
    if (m.role === "assistant") {
      const content = m.content;
      const newAssistantMessage: Message = {
        id: m.id,
        role: "assistant",
        content: content
          .split("␞")
          .map((r) => r.trim())
          .map((row) => {
            // ... parsing logic
          })
          .filter((r) => r !== null)
          .filter((r) => r !== "")
          .join("␞\n"),
      };
      return newAssistantMessage;
    }
    return m;
  });
}

// NEW
public reduceMessagesForPrompt(messages: Message[]): Message[] {
  return messages.map((m) => {
    if (m.role === "assistant") {
      const content = m.content;
      const separator = content.includes("␞") ? "␞" : "\n";
      const joinSeparator = content.includes("␞") ? "␞\n" : "\n";

      const newAssistantMessage: Message = {
        id: m.id,
        role: "assistant",
        content: content
          .split(separator)
          .map((r) => r.trim())
          .map((row) => {
            // ... parsing logic remains the same
          })
          .filter((r) => r !== null)
          .filter((r) => r !== "")
          .join(joinSeparator),
      };
      return newAssistantMessage;
    }
    return m;
  });
}
```

#### 4. Client-side utils (apps/nextjs/src/components/AppComponents/Chat/Chat/utils/index.ts)

```typescript
// Update findMessageIdFromContent and findLatestServerSideState
// to support both formats

function splitMessageContent(content: string): string[] {
  // Support both formats
  if (content.includes("␞")) {
    return content.split("␞");
  }
  return content.split("\n").filter((s) => s.trim().length > 0);
}

export function findMessageIdFromContent({
  content,
}: {
  content: string;
}): string | undefined {
  return splitMessageContent(content)
    .map((s) => {
      try {
        return JSON.parse(s.trim()) as unknown;
      } catch {
        return null;
      }
    })
    .find(isIdPart)?.value;
}
```

#### 5. Remove deprecated function

- Remove `formatMessageWithRecordSeparators` from streamHandling.ts

### Phase 3: Testing Strategy

1. **Unit Tests**

   - Test both old and new format parsing
   - Test message generation with new format
   - Test streaming behavior

2. **Integration Tests**

   - Test full chat flow with new format
   - Test backward compatibility with old messages
   - Test mixed format handling

3. **Manual Testing**
   - Create new chat sessions
   - Load existing chat sessions
   - Test streaming responsiveness
   - Verify all message types work

### Phase 4: Rollout Strategy

1. **Feature Flag** (optional)

   ```typescript
   const USE_NDJSON_FORMAT =
     process.env.NEXT_PUBLIC_USE_NDJSON_FORMAT === "true";
   ```

2. **Gradual Migration**
   - Deploy with backward compatibility
   - Monitor for any parsing errors
   - Eventually remove legacy code

## Risk Assessment

### Low Risk

- Changes are isolated to message formatting
- Backward compatibility ensures no data loss
- NDJSON is a standard format

### Potential Issues

1. **Streaming behavior**: Need to ensure chunks still parse correctly
2. **Empty lines**: NDJSON typically ignores empty lines, but need to verify
3. **Performance**: Splitting by newline vs record separator should be tested

## Monitoring

1. **Add logging** for format detection
2. **Track metrics** on legacy vs new format usage
3. **Monitor** parsing errors in production

## Success Criteria

1. All existing functionality works without modification
2. New messages use NDJSON format
3. Old messages continue to parse correctly
4. No performance degradation
5. Cleaner, more standard protocol
