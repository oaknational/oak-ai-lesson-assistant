# QA preview — Oak Moderation Service as primary moderator

This branch exists solely to provide a Vercel preview deployment that we can
attach branch-scoped environment variables to. Its purpose is to validate the
Oak AI Moderation Service running as Aila's **primary** chat moderator before
any wider rollout.

There are no behavioural code changes on this branch. Everything is driven by
environment variables already supported by `AilaFeatureFactory`.

## Required Vercel preview env vars (branch-scoped)

Set these on the Aila Vercel project, scoped to the **Preview** environment and
this branch (`test/moderation-v1-qa`):

| Variable                       | Value                                                |
| ------------------------------ | ---------------------------------------------------- |
| `OAK_MODERATION_V1_PRIMARY`    | `true`                                               |
| `MODERATION_API_URL`           | `https://moderation-api-preview.thenational.academy` |
| `MODERATION_API_BYPASS_SECRET` | _(preview deployment protection bypass secret)_      |

After setting the variables, redeploy this branch's preview — env var changes
do not apply to existing builds.

## Expected behaviour on this preview

- Aila chat moderation calls `POST /v1/moderate` on the preview moderation
  service.
- Oak Moderation Service is the primary moderator and controls the moderation
  result used by Aila.
- The existing OpenAI moderation path runs only as the shadow moderator.
- Shadow moderation errors remain non-fatal.
- Aila product behaviour and admin workflows are unchanged apart from the
  moderation backend being primary.
- Preview moderation traces appear in Braintrust project
  `Moderation - preview`.

## Out of scope

- Teaching materials moderation (`OAK_MODERATION_TEACHING_MATERIALS_V1_PRIMARY`)
  is not touched by this preview. Only Aila chat moderation is being validated.

## Lifecycle

This PR should remain a draft. Once QA is complete, delete this file and close
the PR — the branch-scoped env vars become inert when the branch is deleted.
