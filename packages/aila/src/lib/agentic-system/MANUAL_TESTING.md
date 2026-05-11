# Agentic Failure Injection

Use `AILA_AGENTIC_FORCE_FAIL` to force agentic failure paths during local manual testing.

## Commands

```bash
AILA_AGENTIC_FORCE_FAIL=planner pnpm dev
AILA_AGENTIC_FORCE_FAIL=planner_throw pnpm dev
AILA_AGENTIC_FORCE_FAIL=section pnpm dev
AILA_AGENTIC_FORCE_FAIL=section:keywords pnpm dev
AILA_AGENTIC_FORCE_FAIL=section_throw pnpm dev
AILA_AGENTIC_FORCE_FAIL=section_throw:keywords pnpm dev
AILA_AGENTIC_FORCE_FAIL=message_to_user pnpm dev
AILA_AGENTIC_FORCE_FAIL=message_to_user_throw pnpm dev
```

## Values

```text
planner
planner_throw
section
section:<sectionKey>
section_throw
section_throw:<sectionKey>
message_to_user
message_to_user_throw
```

This hook is enabled for non-production local/dev use only.

## Notes

- `message_to_user` and `message_to_user_throw` only trigger on turns that reach the message-to-user stage.
- They are bypassed on turns that end earlier, for example when relevant lessons are fetched and returned directly.
- On turns with no applied steps, these values surface the hard-failure message.
- On turns with applied steps, they surface the fallback partial-success summary message.
