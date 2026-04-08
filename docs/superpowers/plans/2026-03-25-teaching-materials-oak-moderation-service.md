# Teaching Materials: Oak Moderation Service Integration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the teaching materials LLM-based moderation with the Oak Moderation Service (same external service Aila uses), behind a feature flag so it can be tested before full rollover.

**Architecture:** Create a standalone `moderateWithOakService()` function in `packages/core` that encapsulates the HTTP call to the Oak Moderation Service. Teaching materials will call either this function or the existing LLM moderation based on the `OAK_MODERATION_V1_TEACHING_MATERIALS` env var. Both call sites (`generateTeachingMaterial` and `generatePartialLessonPlan`) will use the same switching logic.

**Tech Stack:** TypeScript, openapi-fetch (already a dependency of `packages/aila`), Vercel OIDC auth, Zod schemas from `packages/core`.

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `packages/core/src/utils/ailaModeration/oakModerationService.ts` | Standalone function to call the Oak Moderation Service HTTP API. Extracted from `OakModerationServiceModerator` so both Aila and teaching-materials can use it without depending on the Aila package. |
| Modify | `packages/core/package.json` | Add `openapi-fetch` and `@vercel/oidc` dependencies (currently only in `packages/aila`). |
| Create | `packages/core/src/utils/ailaModeration/oakModerationService.test.ts` | Unit tests for the new function (mocking HTTP). |
| Modify | `packages/api/src/router/teachingMaterials/generateTeachingMaterial.ts` | Check feature flag, call Oak service or legacy LLM moderation. |
| Modify | `packages/api/src/router/teachingMaterials/generatePartialLessonPlan.ts` | Same feature flag switch for partial lesson plan moderation. |
| Modify | `packages/api/src/router/teachingMaterials/generateTeachingMaterial.test.ts` | Add tests for the feature flag branching. |
| Modify | `packages/aila/src/features/moderation/moderators/OakModerationServiceModerator.ts` | Refactor to delegate to the shared `moderateWithOakService()` function. |

---

### Task 1: Create the shared Oak Moderation Service client in core

**Files:**
- Create: `packages/core/src/utils/ailaModeration/oakModerationService.ts`
- Modify: `packages/core/package.json`

- [ ] **Step 1: Add `openapi-fetch` and `@vercel/oidc` to `packages/core`**

```bash
cd packages/core && pnpm add openapi-fetch@^0.15.0 @vercel/oidc@^3.1.0
```

- [ ] **Step 2: Create the `moderateWithOakService` function**

Create `packages/core/src/utils/ailaModeration/oakModerationService.ts`:

```typescript
import type { paths } from "../../generated/moderation-api";
import type { ModerationResult } from "./moderationSchema";

import { aiLogger } from "@oakai/logger";
import { getVercelOidcToken } from "@vercel/oidc";
import createClient from "openapi-fetch";

const log = aiLogger("moderation:oak-service");

export interface OakModerationServiceConfig {
  baseUrl: string;
  timeoutMs?: number;
  protectionBypassSecret?: string;
}

export class OakModerationServiceError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OakModerationServiceError";
  }
}

/**
 * Calls the Oak AI Moderation Service HTTP API.
 * Returns flagged categories and per-category scores.
 *
 * Authentication uses Vercel OIDC tokens when available (serverless);
 * non-production environments can bypass auth.
 */
export async function moderateWithOakService(
  content: string,
  config: OakModerationServiceConfig,
): Promise<ModerationResult> {
  const { baseUrl, timeoutMs = 30_000, protectionBypassSecret } = config;

  const headers: Record<string, string> = {};
  try {
    const token = await getVercelOidcToken();
    headers["Authorization"] = `Bearer ${token}`;
  } catch {
    log.info("No Vercel OIDC token available, calling without auth");
  }
  if (protectionBypassSecret) {
    headers["x-vercel-protection-bypass"] = protectionBypassSecret;
  }

  const client = createClient<paths>({ baseUrl, headers });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { data, error, response } = await client.POST("/v1/moderate", {
      body: { content },
      signal: controller.signal,
    });

    if (error) {
      if (response.status === 401) {
        throw new OakModerationServiceError(
          "Authentication failed - OIDC token is invalid or expired",
        );
      }
      if (response.status === 403) {
        throw new OakModerationServiceError(
          "Project not authorized - ensure your Vercel project ID is in the moderation API allowlist",
        );
      }
      throw new OakModerationServiceError(
        `Oak Moderation Service returned ${response.status}: ${error.error}`,
      );
    }

    log.info("Oak Moderation Service response received", {
      categoriesCount: data.flagged_categories.length,
      moderationId: data.moderation_id,
    });

    return {
      scores: data.scores,
      categories: data.flagged_categories as ModerationResult["categories"],
    };
  } catch (err) {
    if (err instanceof OakModerationServiceError) throw err;
    throw new OakModerationServiceError("Oak Moderation Service failed", {
      cause: err,
    });
  } finally {
    clearTimeout(timeout);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/utils/ailaModeration/oakModerationService.ts packages/core/package.json pnpm-lock.yaml
git commit -m "feat: extract shared Oak Moderation Service client to packages/core"
```

---

### Task 2: Write tests for the shared client

**Files:**
- Create: `packages/core/src/utils/ailaModeration/oakModerationService.test.ts`

- [ ] **Step 1: Write the test file**

Create `packages/core/src/utils/ailaModeration/oakModerationService.test.ts`:

```typescript
import {
  moderateWithOakService,
  OakModerationServiceError,
} from "./oakModerationService";

// Mock openapi-fetch
const mockPost = jest.fn();
jest.mock("openapi-fetch", () => ({
  __esModule: true,
  default: () => ({ POST: mockPost }),
}));

// Mock Vercel OIDC
jest.mock("@vercel/oidc", () => ({
  getVercelOidcToken: jest.fn().mockRejectedValue(new Error("no token")),
}));

jest.mock("@oakai/logger", () => ({
  aiLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));

const baseConfig = { baseUrl: "https://moderation.test" };

describe("moderateWithOakService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns categories and scores on success", async () => {
    mockPost.mockResolvedValue({
      data: {
        flagged_categories: ["u/sensitive-content"],
        scores: { "u/sensitive-content": 3 },
        moderation_id: "mod-1",
        prompt_version: "v1",
      },
      error: undefined,
      response: { status: 200 },
    });

    const result = await moderateWithOakService("test content", baseConfig);

    expect(result.categories).toEqual(["u/sensitive-content"]);
    expect(result.scores).toEqual({ "u/sensitive-content": 3 });
  });

  it("returns empty categories for safe content", async () => {
    mockPost.mockResolvedValue({
      data: {
        flagged_categories: [],
        scores: {},
        moderation_id: "mod-2",
        prompt_version: "v1",
      },
      error: undefined,
      response: { status: 200 },
    });

    const result = await moderateWithOakService("safe content", baseConfig);

    expect(result.categories).toEqual([]);
  });

  it("throws OakModerationServiceError on 401", async () => {
    mockPost.mockResolvedValue({
      data: undefined,
      error: { error: "Unauthorized" },
      response: { status: 401 },
    });

    await expect(
      moderateWithOakService("test", baseConfig),
    ).rejects.toThrow(OakModerationServiceError);
    await expect(
      moderateWithOakService("test", baseConfig),
    ).rejects.toThrow("Authentication failed");
  });

  it("throws OakModerationServiceError on 403", async () => {
    mockPost.mockResolvedValue({
      data: undefined,
      error: { error: "Forbidden" },
      response: { status: 403 },
    });

    await expect(
      moderateWithOakService("test", baseConfig),
    ).rejects.toThrow("Project not authorized");
  });

  it("throws on generic API errors", async () => {
    mockPost.mockResolvedValue({
      data: undefined,
      error: { error: "Internal Server Error" },
      response: { status: 500 },
    });

    await expect(
      moderateWithOakService("test", baseConfig),
    ).rejects.toThrow("Oak Moderation Service returned 500");
  });

  it("passes protectionBypassSecret as header", async () => {
    mockPost.mockResolvedValue({
      data: {
        flagged_categories: [],
        scores: {},
        moderation_id: "mod-3",
        prompt_version: "v1",
      },
      error: undefined,
      response: { status: 200 },
    });

    await moderateWithOakService("test", {
      ...baseConfig,
      protectionBypassSecret: "secret-123",
    });

    // openapi-fetch is called with headers in the factory — we verify the call succeeds
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they pass**

```bash
cd packages/core && pnpm test -- --testPathPattern oakModerationService --verbose
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/utils/ailaModeration/oakModerationService.test.ts
git commit -m "test: add unit tests for shared Oak Moderation Service client"
```

---

### Task 3: Wire feature flag into `generateTeachingMaterial`

**Files:**
- Modify: `packages/api/src/router/teachingMaterials/generateTeachingMaterial.ts:130-133`

- [ ] **Step 1: Write a failing test for the feature flag**

Add to `packages/api/src/router/teachingMaterials/generateTeachingMaterial.test.ts`:

Add a new mock at the top (after existing mocks):

```typescript
jest.mock("@oakai/core/src/utils/ailaModeration/oakModerationService", () => ({
  moderateWithOakService: jest.fn(),
}));

import { moderateWithOakService } from "@oakai/core/src/utils/ailaModeration/oakModerationService";
const mockModerateWithOakService = moderateWithOakService as jest.MockedFunction<typeof moderateWithOakService>;
```

Add the test case inside the `describe` block:

```typescript
it("should use Oak Moderation Service when feature flag is enabled", async () => {
  process.env.OAK_MODERATION_V1_TEACHING_MATERIALS = "true";
  process.env.MODERATION_API_URL = "https://moderation.test";

  mockModerateWithOakService.mockResolvedValue(mockModerationResult);

  const params: GenerateTeachingMaterialParams = {
    prisma: mockPrisma,
    userId: "test-user",
    input: {
      documentType: "additional-glossary" as const,
      source: "aila",
      context: {
        lessonPlan: {
          title: "Test Lesson",
          topic: "Students will learn about mock terms",
          keyStage: "ks3",
          subject: "english",
        },
        refinement: [{ type: "custom" as const, payload: "test-refinement" }],
      },
    },
    auth: mockAuth,
    rateLimit: mockRateLimit,
  };

  const result = await generateTeachingMaterial(params);

  expect(mockModerateWithOakService).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ baseUrl: "https://moderation.test" }),
  );
  expect(mockGenerateTeachingMaterialModeration).not.toHaveBeenCalled();
  expect(result.moderation).toEqual(mockModerationResult);

  delete process.env.OAK_MODERATION_V1_TEACHING_MATERIALS;
  delete process.env.MODERATION_API_URL;
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd packages/api && pnpm test -- --testPathPattern generateTeachingMaterial.test --verbose
```

Expected: FAIL — `moderateWithOakService` is not called because the implementation hasn't been changed yet.

- [ ] **Step 3: Implement the feature flag in `generateTeachingMaterial.ts`**

In `packages/api/src/router/teachingMaterials/generateTeachingMaterial.ts`, add import at the top:

```typescript
import { moderateWithOakService } from "@oakai/core/src/utils/ailaModeration/oakModerationService";
```

Replace lines 130-133 (the moderation call):

```typescript
  const moderation = await generateTeachingMaterialModeration({
    input: JSON.stringify(result),
    provider: "openai",
  });
```

With:

```typescript
  const useOakService =
    process.env.OAK_MODERATION_V1_TEACHING_MATERIALS === "true";

  let moderation: ModerationResult;
  if (useOakService) {
    const baseUrl = process.env.MODERATION_API_URL;
    if (!baseUrl) {
      throw new Error(
        "MODERATION_API_URL is required when OAK_MODERATION_V1_TEACHING_MATERIALS is enabled",
      );
    }
    moderation = await moderateWithOakService(JSON.stringify(result), {
      baseUrl,
      protectionBypassSecret:
        process.env.MODERATION_API_BYPASS_SECRET ?? undefined,
    });
  } else {
    moderation = await generateTeachingMaterialModeration({
      input: JSON.stringify(result),
      provider: "openai",
    });
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
cd packages/api && pnpm test -- --testPathPattern generateTeachingMaterial.test --verbose
```

Expected: All tests pass (both old and new).

- [ ] **Step 5: Commit**

```bash
git add packages/api/src/router/teachingMaterials/generateTeachingMaterial.ts packages/api/src/router/teachingMaterials/generateTeachingMaterial.test.ts
git commit -m "feat: add Oak Moderation Service feature flag to generateTeachingMaterial"
```

---

### Task 4: Wire feature flag into `generatePartialLessonPlan`

**Files:**
- Modify: `packages/api/src/router/teachingMaterials/generatePartialLessonPlan.ts:70-73`

- [ ] **Step 1: Write a failing test for the feature flag**

In `packages/api/src/router/teachingMaterials/generatePartialLessonPlan.test.ts`, add the mock and test for the Oak Service path (same pattern as Task 3, Step 1 — mock `moderateWithOakService`, set env var, assert it's called instead of `generateTeachingMaterialModeration`).

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd packages/api && pnpm test -- --testPathPattern generatePartialLessonPlan.test --verbose
```

Expected: FAIL.

- [ ] **Step 3: Implement the feature flag in `generatePartialLessonPlan.ts`**

Add the same import and replace the moderation call at line 70-73 with the same feature-flag pattern used in Task 3:

```typescript
import { moderateWithOakService } from "@oakai/core/src/utils/ailaModeration/oakModerationService";
```

Replace:
```typescript
  const moderation = await generateTeachingMaterialModeration({
    input: JSON.stringify(lesson),
    provider: "openai",
  });
```

With:
```typescript
  const useOakService =
    process.env.OAK_MODERATION_V1_TEACHING_MATERIALS === "true";

  let moderation: ModerationResult;
  if (useOakService) {
    const baseUrl = process.env.MODERATION_API_URL;
    if (!baseUrl) {
      throw new Error(
        "MODERATION_API_URL is required when OAK_MODERATION_V1_TEACHING_MATERIALS is enabled",
      );
    }
    moderation = await moderateWithOakService(JSON.stringify(lesson), {
      baseUrl,
      protectionBypassSecret:
        process.env.MODERATION_API_BYPASS_SECRET ?? undefined,
    });
  } else {
    moderation = await generateTeachingMaterialModeration({
      input: JSON.stringify(lesson),
      provider: "openai",
    });
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
cd packages/api && pnpm test -- --testPathPattern generatePartialLessonPlan.test --verbose
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/api/src/router/teachingMaterials/generatePartialLessonPlan.ts packages/api/src/router/teachingMaterials/generatePartialLessonPlan.test.ts
git commit -m "feat: add Oak Moderation Service feature flag to generatePartialLessonPlan"
```

---

### Task 5: Refactor Aila's `OakModerationServiceModerator` to use the shared client

**Files:**
- Modify: `packages/aila/src/features/moderation/moderators/OakModerationServiceModerator.ts`

- [ ] **Step 1: Refactor `OakModerationServiceModerator` to delegate to `moderateWithOakService`**

Replace the body of the `moderate` method and remove duplicated HTTP logic. The class becomes a thin adapter:

```typescript
import {
  moderateWithOakService,
  OakModerationServiceError,
} from "@oakai/core/src/utils/ailaModeration/oakModerationService";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { aiLogger } from "@oakai/logger";

import { AilaModerationError, AilaModerator } from "./AilaModerator";

const log = aiLogger("aila:moderation");

export interface OakModerationServiceModeratorConfig {
  baseUrl: string;
  chatId: string;
  userId?: string;
  timeoutMs?: number;
  protectionBypassSecret?: string;
}

/**
 * Moderator implementation that calls the Oak AI Moderation Service.
 * Delegates to the shared moderateWithOakService() client in packages/core.
 */
export class OakModerationServiceModerator extends AilaModerator {
  private readonly config: OakModerationServiceModeratorConfig;

  constructor(config: OakModerationServiceModeratorConfig) {
    super({ userId: config.userId, chatId: config.chatId });
    this.config = config;
  }

  async moderate(input: string): Promise<ModerationResult> {
    log.info("Calling Oak Moderation Service", {
      contentLength: input.length,
    });

    try {
      return await moderateWithOakService(input, {
        baseUrl: this.config.baseUrl,
        timeoutMs: this.config.timeoutMs,
        protectionBypassSecret: this.config.protectionBypassSecret,
      });
    } catch (err) {
      if (err instanceof OakModerationServiceError) {
        throw new AilaModerationError(err.message, { cause: err });
      }
      throw new AilaModerationError("Oak Moderation Service failed", {
        cause: err,
      });
    }
  }
}
```

- [ ] **Step 2: Run existing Aila moderation tests to verify nothing broke**

```bash
cd packages/aila && pnpm test -- --testPathPattern moderation --verbose
```

Expected: All existing tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/aila/src/features/moderation/moderators/OakModerationServiceModerator.ts
git commit -m "refactor: delegate OakModerationServiceModerator to shared core client"
```

---

### Task 6: Run full test suite and type check

- [ ] **Step 1: Type check across affected packages**

```bash
pnpm turbo type-check --filter=@oakai/core --filter=@oakai/aila --filter=@oakai/api --filter=@oakai/teaching-materials
```

Expected: No type errors.

- [ ] **Step 2: Run all tests across affected packages**

```bash
pnpm turbo test --filter=@oakai/core --filter=@oakai/aila --filter=@oakai/api
```

Expected: All tests pass.

- [ ] **Step 3: Commit any fixups if needed, then final commit**

```bash
git add -A && git commit -m "chore: fixups from type-check and test run"
```

---

## Feature Flag Summary

| Flag | Value | Behaviour |
|------|-------|-----------|
| `OAK_MODERATION_V1_TEACHING_MATERIALS` | unset / `"false"` | Teaching materials uses existing LLM moderation (no change) |
| `OAK_MODERATION_V1_TEACHING_MATERIALS` | `"true"` | Teaching materials calls the Oak Moderation Service at `MODERATION_API_URL` |

This mirrors the pattern of `OAK_MODERATION_V1_PRIMARY` used by Aila. Both flags can be enabled independently.
