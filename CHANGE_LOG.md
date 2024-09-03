## [1.3.3](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.3.2...v1.3.3) (2024-09-03)


### Bug Fixes

* revert onboarding redirect fix now we've updated clerk session claims ([0363334](https://github.com/oaknational/oak-ai-lesson-assistant/commit/0363334b7629e0c4a56feab6b5c693758d606750))

# [1.3.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.2.2...v1.3.0) (2024-09-02)


### Bug Fixes

* address sonarcloud warnings ([07fc896](https://github.com/oaknational/oak-ai-lesson-assistant/commit/07fc896caca310c4b14b8c1451499e7acdf987d2))
* aila chat e2e test to handle 10 sections instead of 12 ([f0c6899](https://github.com/oaknational/oak-ai-lesson-assistant/commit/f0c689917012b1af5acc248590b6f1d895e23211))
* Continue missing closing stars ([2944c0f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/2944c0ffee6e0b9118941e7804541f8d7352ce85))
* doppler project name ([1a80404](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1a80404b2932e87bfd00c32c92d3f7cd75debaef))
* prompt version hash ([#27](https://github.com/oaknational/oak-ai-lesson-assistant/issues/27)) ([2a15947](https://github.com/oaknational/oak-ai-lesson-assistant/commit/2a159471b0b2332bb3ab50b621087f7c3a797f9f))
* remove workspace colour overrides ([#15](https://github.com/oaknational/oak-ai-lesson-assistant/issues/15)) ([06b6ac2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/06b6ac2998134f8b2a1d18351ee1f4404a57faf2))
* update terms and conditions link ([#32](https://github.com/oaknational/oak-ai-lesson-assistant/issues/32)) ([79df249](https://github.com/oaknational/oak-ai-lesson-assistant/commit/79df2492751631ee0a79e10292bf9614245c183a))


### Features

* add Prisma Accelerate caching to some of our queries ([#22](https://github.com/oaknational/oak-ai-lesson-assistant/issues/22)) ([7a797ac](https://github.com/oaknational/oak-ai-lesson-assistant/commit/7a797ac1b41cc790b2e7927cc44292e4c16000c4))
* add telemetry to the chat API route ([#26](https://github.com/oaknational/oak-ai-lesson-assistant/issues/26)) ([936641a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/936641aefb3952db5d9076735fa5c25d73c5e2f5))
* add users to hubspot on creation ([19e5854](https://github.com/oaknational/oak-ai-lesson-assistant/commit/19e58540cbab4ba6a5a7df459fe81f71f86e66ca))
* aila categoriser feature with chat ID and user ID ([#12](https://github.com/oaknational/oak-ai-lesson-assistant/issues/12)) ([6b0839c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/6b0839c4b6e068a01e349e5e20a3d136175022d8))
* Detect and upgrade users with lissing metadata ([c158f3d](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c158f3da7541c32371d86959500ab79c89d879ec))
* detect and upgrade users with missing metadata ([#18](https://github.com/oaknational/oak-ai-lesson-assistant/issues/18)) ([c4a0a3e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c4a0a3efd12211a0cb8612a090d6fc96e4d452aa))
* pass a mocked LLM Service to Aila via the new services object ([#25](https://github.com/oaknational/oak-ai-lesson-assistant/issues/25)) ([78a9a59](https://github.com/oaknational/oak-ai-lesson-assistant/commit/78a9a5952e24a19a0c5494ace16a2885f04c573b))
* prompt versioning ([#19](https://github.com/oaknational/oak-ai-lesson-assistant/issues/19)) ([7629ac9](https://github.com/oaknational/oak-ai-lesson-assistant/commit/7629ac9d90549f112007c4754b5ae720a00b0f33))
* remove feedback message from header ([d22c28a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d22c28a576e8231c50c6c34fb889ba7f459bd55f))
* update prompt with distractor, practice task and grammar improvements ([#23](https://github.com/oaknational/oak-ai-lesson-assistant/issues/23)) ([cb65f9c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/cb65f9cead7c205fad2aa09a8c60b5b47a23eada))
* updates to download resources page ([#17](https://github.com/oaknational/oak-ai-lesson-assistant/issues/17)) ([4f55547](https://github.com/oaknational/oak-ai-lesson-assistant/commit/4f555478575bc5215d64a9d73eb8ddd4e13c81a6))

## [1.2.2](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.2.1...v1.2.2) (2024-08-30)


### Bug Fixes

* replace Inngest app/generation.requested with an async worker function ([#34](https://github.com/oaknational/oak-ai-lesson-assistant/issues/34)) ([eee2b1e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/eee2b1efff8aa71e59333b3d0780a826286c34d5))

## [1.2.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.2.0...v1.2.1) (2024-08-29)


### Bug Fixes

* user feedback on selection in the feedback dialog and mapping responses in posthog correctly ([#13](https://github.com/oaknational/oak-ai-lesson-assistant/issues/13)) ([0d9b6bc](https://github.com/oaknational/oak-ai-lesson-assistant/commit/0d9b6bcfb1760447b3950e2bb1f349ad24061d82))

# [1.2.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.1.42...v1.2.0) (2024-08-28)


### Bug Fixes

* quoting of moderation categories ([5dcf4df](https://github.com/oaknational/oak-ai-lesson-assistant/commit/5dcf4df9c986e3b1594575041a0c70ff54088a6b))


### Features

* end of session survey ([ac9bbc0](https://github.com/oaknational/oak-ai-lesson-assistant/commit/ac9bbc00fe76a705715a0f80abb972fda1ef0ae5))
* send quiz designer langchain ChatOpenAI calls through helicone ([5a798fa](https://github.com/oaknational/oak-ai-lesson-assistant/commit/5a798fa7bed2cba51a29c37f6027bcd5c1c46a47))
* start populating metadata under labs prefix ([efffd02](https://github.com/oaknational/oak-ai-lesson-assistant/commit/efffd02fff380c1df2854dddf8cc68b1a5ff02fd))

## [1.1.42](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.1.41...v1.1.42) (2024-08-22)


### Bug Fixes

* job summary link ([01c65e2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/01c65e2e702e4e4afbcf6e9d6f1ab2ad7744abe5))
* playwright tests for e2e ([3188b52](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3188b52441fb8078a81bfad055bc9b179db8a4d3))
* remove seed lessons script ([f581609](https://github.com/oaknational/oak-ai-lesson-assistant/commit/f5816097717c08f9356fbae6e868ebded1567f49))
* run e2e tests on merge into production and update deployment url to match new repo ([aad171f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/aad171fdd97fcdb9397b6bae6a36d574128d08b0))
* semantic release branch and doppler staging pull ([53be0b8](https://github.com/oaknational/oak-ai-lesson-assistant/commit/53be0b814c3ef4d039c6c83f5e989361a43dc7c2))
* sonarcloud properties and pnpm on post-deployment workflow ([93b8df1](https://github.com/oaknational/oak-ai-lesson-assistant/commit/93b8df11ba353b9954f1cf1ac75ac850024b60c5))
* use vercel automation bypass from repo secrets ([0be4f78](https://github.com/oaknational/oak-ai-lesson-assistant/commit/0be4f780ec61ba0f70dec2d9926e1c972df3d11f))

## Version v1.1.41
## What's Changed\r\n* Fix retry wording in system prompt by @codeincontext in https://github.com/oaknational/ai-beta/pull/740\r\n* Fix upgrade-insecure dev warning by @codeincontext in https://github.com/oaknational/ai-beta/pull/739\r\n* Lesson progress dropdown logic by @stefl in https://github.com/oaknational/ai-beta/pull/761\r\n* Add dialog if demo sharing is disabled by @codeincontext in https://github.com/oaknational/ai-beta/pull/736\r\n* Send user demo status to analytics by @codeincontext in https://github.com/oaknational/ai-beta/pull/733\r\n* Script: Set existing pre-release users to non-demo by @codeincontext in https://github.com/oaknational/ai-beta/pull/770\r\n* Demo accounts: Limit messages after lesson complete - main branch by @codeincontext in https://github.com/oaknational/ai-beta/pull/772\r\n* Demo chat creation dialog by @codeincontext in https://github.com/oaknational/ai-beta/pull/732\r\n* Dual trpc routers using a link by @codeincontext in https://github.com/oaknational/ai-beta/pull/774\r\n* Show mobile blocker on /aila page by @codeincontext in https://github.com/oaknational/ai-beta/pull/775\r\n* Simplify server side feature flags and use KV by @stefl in https://github.com/oaknational/ai-beta/pull/760\r\n* Wait for clerk client to load before detecting stuck user by @codeincontext in https://github.com/oaknational/ai-beta/pull/771\r\n* Fix demo check for interstitial by @codeincontext in https://github.com/oaknational/ai-beta/pull/777\r\n* Don't check ban status or increment rate limit for queries by @codeincontext in https://github.com/oaknational/ai-beta/pull/779\r\n* docs: readme by @mantagen in https://github.com/oaknational/ai-beta/pull/762\r\n* Extract chat logic to ChatProvider by @codeincontext in https://github.com/oaknational/ai-beta/pull/782\r\n* Fix "1-3 Cycles" error + setup jest tests for storybook files by @stefl in https://github.com/oaknational/ai-beta/pull/787\r\n* bug: change back to server side feature flags by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/788\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.40...v1.1.41-rc4

## Version v1.1.40
## What's Changed\r\n* Fix demo region check in dev by @codeincontext in https://github.com/oaknational/ai-beta/pull/767\r\n* Bug/trpc provider conflicts by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/768\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.40-rc2...v1.1.40-rc3

## Version v1.1.39
## What's Changed\r\n* Bug/ensure no null on share by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/746\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.39-rc1...v1.1.39-rc2

## Version v1.1.38
## What's Changed\r\n* Security fixes (including 'share' logic) by @mantagen in https://github.com/oaknational/ai-beta/pull/711\r\n* Simplify usage of rate limits and georestriction by @codeincontext in https://github.com/oaknational/ai-beta/pull/721\r\n* Add demo account banner to Aila pages by @codeincontext in https://github.com/oaknational/ai-beta/pull/720\r\n* bug: hide the placeholder text from safari by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/724\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.38-rc3...v1.1.38-rc4

## Version v1.1.37
## What's Changed\r\n* Correctly sample uri error by @mantagen in https://github.com/oaknational/ai-beta/pull/684\r\n* Set sentry user on login by @mantagen in https://github.com/oaknational/ai-beta/pull/681\r\n* Send sourcemaps to sentry by @mantagen in https://github.com/oaknational/ai-beta/pull/676\r\n* Only track refinement if it's not the first message by @mantagen in https://github.com/oaknational/ai-beta/pull/690\r\n* fix: next config devtool by @mantagen in https://github.com/oaknational/ai-beta/pull/695\r\n* Use full aila e2e tests on RC pull requests by @codeincontext in https://github.com/oaknational/ai-beta/pull/687\r\n* Clearer error reporting from HubspotLoader by @mantagen in https://github.com/oaknational/ai-beta/pull/696\r\n* Add include_usage to openai stream calls by @mantagen in https://github.com/oaknational/ai-beta/pull/694\r\n* Put moderation calls through helicone by @codeincontext in https://github.com/oaknational/ai-beta/pull/692\r\n* Require helicone env vars for openai calls by @codeincontext in https://github.com/oaknational/ai-beta/pull/691\r\n* Require helicone for runtime LLM calls in vercel production by @codeincontext in https://github.com/oaknational/ai-beta/pull/693\r\n\r\n## Excluded from this release\r\n* Refactor front end by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/667\r\n* Remove next-themes by @codeincontext in https://github.com/oaknational/ai-beta/pull/697\r\n* HOTFIX: Move clear history button back to right side by @codeincontext in https://github.com/oaknational/ai-beta/pull/698\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.36...v1.1.37-rc2

## Version v1.1.36
## What's Changed\r\n* Change avo debugger position, fixing e2e tests by @mantagen in https://github.com/oaknational/ai-beta/pull/671\r\n* Page navigation tracking by @codeincontext in https://github.com/oaknational/ai-beta/pull/673\r\n* Save playwright traces in GH artifacts by @codeincontext in https://github.com/oaknational/ai-beta/pull/672\r\n* fix: fix json before attempt parsing by @mantagen in https://github.com/oaknational/ai-beta/pull/674\r\n* Add sentry tracesSampler for URIError by @mantagen in https://github.com/oaknational/ai-beta/pull/680\r\n* Use gpt-4o for the categorise requests by @mantagen in https://github.com/oaknational/ai-beta/pull/678\r\n* Queue initial page URL to hubspot by @codeincontext in https://github.com/oaknational/ai-beta/pull/675\r\n* Use env vars for posthog and clerk slack buttons by @codeincontext in https://github.com/oaknational/ai-beta/pull/677\r\n* Update sentry to v8 by @mantagen in https://github.com/oaknational/ai-beta/pull/683\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.35-rc1...v1.1.36-rc1

## Version v1.1.35
## What's Changed\r\n* Add human-recognisable IDs to slack notifications by @codeincontext in https://github.com/oaknational/ai-beta/pull/661\r\n* Fix 404 page rendering for static paths by @codeincontext in https://github.com/oaknational/ai-beta/pull/655\r\n* chore: add avo api url to csp by @mantagen in https://github.com/oaknational/ai-beta/pull/664\r\n* Add e2e aila flow and reorganise playwright tests by @codeincontext in https://github.com/oaknational/ai-beta/pull/646\r\n* feat: update oak-consent-client by @simonrose121 in https://github.com/oaknational/ai-beta/pull/662\r\n* Fetch doppler env vars on-demand in github workflows by @codeincontext in https://github.com/oaknational/ai-beta/pull/666\r\n* feat: adds a report content button in the chat area by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/652\r\n* Set up native hubspot integration by @codeincontext in https://github.com/oaknational/ai-beta/pull/663\r\n* Avo event tracking event implementation by @mantagen in https://github.com/oaknational/ai-beta/pull/638\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.34...v1.1.35-rc1

## Version v1.1.34
## What's Changed\r\n* Add jest github action by @codeincontext in https://github.com/oaknational/ai-beta/pull/645\r\n* From RC branch: Swap rate limit value and message fields by @codeincontext in https://github.com/oaknational/ai-beta/pull/648\r\n* Fixs the order of the lesson history In the side bar by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/654\r\n* Slack notifications for naughty behaviour by @codeincontext in https://github.com/oaknational/ai-beta/pull/653\r\n* ci: use temporary PAT with workflow permissions to allow new workflows to be pushed by @simonrose121 in https://github.com/oaknational/ai-beta/pull/656\r\n* Fix/id posthog by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/657\r\n* Reverting using PAT to allow workflow push on pre-release by @simonrose121 in https://github.com/oaknational/ai-beta/pull/658\r\n* Add stray workflow commit on production back to main branch by @codeincontext in https://github.com/oaknational/ai-beta/pull/659\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.33...v1.1.34-rc4

## Version v1.1.33
## What's Changed\r\n* Add workarounds for now to catch invalid message parts by @stefl in https://github.com/oaknational/ai-beta/pull/643\r\n* Aila plugins: Extract web application behaviour from Aila package by @codeincontext in https://github.com/oaknational/ai-beta/pull/633\r\n* chore: update og image by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/644\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.32...v1.1.33-rc1

## Version v1.1.32
## What's Changed\r\n* Refactor client-side analytics setup and initialise avo by @simonrose121 in https://github.com/oaknational/ai-beta/pull/611\r\n* fix: add posthog identify before feature flag check by @simonrose121 in https://github.com/oaknational/ai-beta/pull/639\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.31...v1.1.32-rc2

## Version v1.1.31
## What's Changed\r\n* Remove unused files found with knip by @codeincontext in https://github.com/oaknational/ai-beta/pull/624\r\n* feat: Working e2e playwright setup by @codeincontext in https://github.com/oaknational/ai-beta/pull/563\r\n* Detect when a banned Clerk user is stuck with a loading spinner by @codeincontext in https://github.com/oaknational/ai-beta/pull/619\r\n* Clear local state on toxic moderation by @mantagen in https://github.com/oaknational/ai-beta/pull/630\r\n* Tweak moderation styles by @mantagen in https://github.com/oaknational/ai-beta/pull/636\r\n* Handle user bans natively in aila package by @codeincontext in https://github.com/oaknational/ai-beta/pull/631\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.30...v1.1.31-rc1

## Version v1.1.30
## What's Changed\r\n* feat: replace civic with oak consent app by @simonrose121 in https://github.com/oaknational/ai-beta/pull/553\r\n* Make share page publicly accessible by @codeincontext in https://github.com/oaknational/ai-beta/pull/612\r\n* Add 404 page by @codeincontext in https://github.com/oaknational/ai-beta/pull/616\r\n* V1 1 29 rc2/rc fixes by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/614\r\n* Add node types to tsconfig by @codeincontext in https://github.com/oaknational/ai-beta/pull/620\r\n* feat: marketing survey by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/625\r\n* WIP: Aila CLI part two by @stefl in https://github.com/oaknational/ai-beta/pull/613\r\n* WIP: CLI: Remove oclif and just use a script for now by @stefl in https://github.com/oaknational/ai-beta/pull/628\r\n* new lesson button by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/604\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.29...v1.1.30-rc1

## Version v1.1.29
## What's Changed\r\n* Make share page publicly accessible by @codeincontext in https://github.com/oaknational/ai-beta/pull/612\r\n* V1 1 29 rc2/rc fixes by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/614\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.29-rc2...v1.1.29-rc4

## Version v1.1.28
**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.27...v1.1.28-rc1

## Version v1.1.27
**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.26-rc1...v1.1.27-rc2

## Version v1.1.26
## What's Changed\r\n* bug: align icons by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/589\r\n* style: fix ordered list styles in markdown by @mantagen in https://github.com/oaknational/ai-beta/pull/595\r\n* fix: dependabot alerts by @simonrose121 in https://github.com/oaknational/ai-beta/pull/594\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.25...v1.1.26-rc1

## Version v1.1.25
## What's Changed\r\n* Handle helicone threat detections by @mantagen in https://github.com/oaknational/ai-beta/pull/568\r\n* Suspending users after safety violations by @codeincontext in https://github.com/oaknational/ai-beta/pull/570\r\n* chore: Capture TRPC exceptions properly in sentry by @codeincontext in https://github.com/oaknational/ai-beta/pull/547\r\n* Feedback survey: fix hook to return correct survey by @mantagen in https://github.com/oaknational/ai-beta/pull/569\r\n* Red team testing: Don't ban users with the safety-testing feature flag by @codeincontext in https://github.com/oaknational/ai-beta/pull/578\r\n* User blocking: Add Action message type by @codeincontext in https://github.com/oaknational/ai-beta/pull/573\r\n* Add /api/health to clerk public pages by @codeincontext in https://github.com/oaknational/ai-beta/pull/580\r\n* bugs: cross browser bugs by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/575\r\n* Fix: Add CSP headers to all next.js requests by @codeincontext in https://github.com/oaknational/ai-beta/pull/579\r\n* Add __session to known CookieControl cookies by @codeincontext in https://github.com/oaknational/ai-beta/pull/584\r\n* Output moderation  by @mantagen in https://github.com/oaknational/ai-beta/pull/576\r\n* Update helicone headers by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/585\r\n* Revert "Update helicone headers" by @mantagen in https://github.com/oaknational/ai-beta/pull/587\r\n* Update/helicone envs by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/588\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.24...v1.1.25-rc1

## Version v1.1.24
Hotfix/healthcheck datadog release by @codeincontext in #581\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.22...v1.1.24-rc1

## Version v1.1.22
## What's Changed\r\n* Update to Clerk 5.1 by @codeincontext in https://github.com/oaknational/ai-beta/pull/554\r\n* feat: add text search snippet migration by @remy in https://github.com/oaknational/ai-beta/pull/560\r\n* Voice improvements plus prompt quality tweaks by @stefl in https://github.com/oaknational/ai-beta/pull/559\r\n* fix: dependabot alerts by @simonrose121 in https://github.com/oaknational/ai-beta/pull/561\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.21...v1.1.22-rc1

## Version v1.1.21
## What's Changed\r\n* hotfix: nonce header key by @codeincontext in https://github.com/oaknational/ai-beta/pull/555\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.20...v1.1.21-rc1

## Version v1.1.20
## What's Changed\r\n* fix: properly read x-oai-api-key and expose transcript trpc endpoint by @remy in https://github.com/oaknational/ai-beta/pull/545\r\n* chore: Add google fonts to CSP by @codeincontext in https://github.com/oaknational/ai-beta/pull/548\r\n* fix: Log missing nonce error client side to help debug by @codeincontext in https://github.com/oaknational/ai-beta/pull/550\r\n* Fix: Use OpenAI directly for moderations endpoint (not helicone) by @codeincontext in https://github.com/oaknational/ai-beta/pull/551\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.19...v1.1.20-rc1

## Version v1.1.19
## What's Changed\r\n* fix(csp) add fake nonce directive to legacy header for next.js injection by @codeincontext in https://github.com/oaknational/ai-beta/pull/513\r\n* Feat/lesson snapshots + exports in db by @mantagen in https://github.com/oaknational/ai-beta/pull/514\r\n* fix(exports): fire and forget download event, and use shortId for filename by @mantagen in https://github.com/oaknational/ai-beta/pull/518\r\n* Adding Aila to the prompt by @stefl in https://github.com/oaknational/ai-beta/pull/510\r\n* fix(csp): add worker-src configuration for blob (attempt 2) by @simonrose121 in https://github.com/oaknational/ai-beta/pull/523\r\n* fix(csp): add cloudflare challenge url to frame-src by @simonrose121 in https://github.com/oaknational/ai-beta/pull/525\r\n* home page by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/517\r\n* Exports documentation: changing a template by @mantagen in https://github.com/oaknational/ai-beta/pull/521\r\n* Chore/home page by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/531\r\n* Disable Sentry replays and reduce general sample rate to 0.2 by @stefl in https://github.com/oaknational/ai-beta/pull/528\r\n* chore(csp) Add CSP report sample rate by @codeincontext in https://github.com/oaknational/ai-beta/pull/520\r\n* chore(security): package update by @mantagen in https://github.com/oaknational/ai-beta/pull/503\r\n* Add error breadcrumbs to exports routes by @mantagen in https://github.com/oaknational/ai-beta/pull/534\r\n* fix: omit download from button attribute by @mantagen in https://github.com/oaknational/ai-beta/pull/536\r\n* Update Aila 'coming soon' copy by @mantagen in https://github.com/oaknational/ai-beta/pull/538\r\n* Coming soon on 'feature flag' by @mantagen in https://github.com/oaknational/ai-beta/pull/540\r\n* Block menu and faqs to non feature flag by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/542\r\n\r\n## New Contributors\r\n* @simonrose121 made their first contribution in https://github.com/oaknational/ai-beta/pull/523\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.11...v1.1.19

## Version v1.1.18
## What's Changed\r\n* Coming soon on 'feature flag' by @mantagen in https://github.com/oaknational/ai-beta/pull/540\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.17-rc1...v1.1.18-rc1

## Version v1.1.17
## What's Changed\r\n* Update Aila 'coming soon' copy by @mantagen in https://github.com/oaknational/ai-beta/pull/538\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.16...v1.1.17-rc1

## Version v1.1.16
## What's Changed\r\n* Disable Sentry replays and reduce general sample rate to 0.2 by @stefl in https://github.com/oaknational/ai-beta/pull/528\r\n* chore(csp) Add CSP report sample rate by @codeincontext in https://github.com/oaknational/ai-beta/pull/520\r\n* chore(security): package update by @mantagen in https://github.com/oaknational/ai-beta/pull/503\r\n* Add error breadcrumbs to exports routes by @mantagen in https://github.com/oaknational/ai-beta/pull/534\r\n* fix: omit download from button attribute by @mantagen in https://github.com/oaknational/ai-beta/pull/536\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.15...v1.1.16-rc2

## Version v1.1.15
## What's Changed\r\n* home page by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/517\r\n* Exports documentation: changing a template by @mantagen in https://github.com/oaknational/ai-beta/pull/521\r\n* Chore/home page by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/531\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.14...v1.1.15-rc2

## Version v1.1.14
## What's Changed\r\n* fix(csp): add cloudflare challenge url to frame-src by @simonrose121 in https://github.com/oaknational/ai-beta/pull/525\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.13...v1.1.14-rc2

## Version v1.1.13
## What's Changed\r\n* Feat/lesson snapshots + exports in db by @mantagen in https://github.com/oaknational/ai-beta/pull/514\r\n* fix(exports): fire and forget download event, and use shortId for filename by @mantagen in https://github.com/oaknational/ai-beta/pull/518\r\n* Adding Aila to the prompt by @stefl in https://github.com/oaknational/ai-beta/pull/510\r\n* fix(csp): add worker-src configuration for blob (attempt 2) by @simonrose121 in https://github.com/oaknational/ai-beta/pull/523\r\n\r\n## New Contributors\r\n* @simonrose121 made their first contribution in https://github.com/oaknational/ai-beta/pull/523\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.12...v1.1.13-rc3

## Version v1.1.12
## What's Changed\r\n* fix(csp) add fake nonce directive to legacy header for next.js injection by @codeincontext in https://github.com/oaknational/ai-beta/pull/513\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.11...v1.1.12-rc1

## Version v1.1.11
## What's Changed\r\n* feat: redesign initial chat, warning message, refactor header, allows oak  users to view all chats by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/496\r\n* Prompt clean by @stefl in https://github.com/oaknational/ai-beta/pull/506\r\n* Switch CSP handling over to next.js by @codeincontext in https://github.com/oaknational/ai-beta/pull/509\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.10...v1.1.11

## Version v1.1.10
## What's Changed\r\n* Copy exports template file to 'output' folder by @mantagen in https://github.com/oaknational/ai-beta/pull/500\r\n* Content security policy step 1: Report-Only by @codeincontext in https://github.com/oaknational/ai-beta/pull/498\r\n* revert: streaming text page by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/507\r\n* GPT-4o by @stefl in https://github.com/oaknational/ai-beta/pull/502\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.9...v1.1.10-rc1

## Version v1.1.9
## What's Changed\r\n* Add pre-release and release workflows by @mantagen in https://github.com/oaknational/ai-beta/pull/488\r\n* chore: typo by @mantagen in https://github.com/oaknational/ai-beta/pull/489\r\n* FIX: Retain posthog anonymous ID when initialising, fixing UTM tags by @codeincontext in https://github.com/oaknational/ai-beta/pull/487\r\n* build: fix PR title for release process by @mantagen in https://github.com/oaknational/ai-beta/pull/493\r\n* Add additional user ID metadata to both Open AI and Helicone by @stefl in https://github.com/oaknational/ai-beta/pull/491\r\n* build(pre-release workflow): merge with ours strategy by @mantagen in https://github.com/oaknational/ai-beta/pull/494\r\n* chore: update legal links by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/492\r\n* Improve coherence and adherence to the JSON schema by @stefl in https://github.com/oaknational/ai-beta/pull/497\r\n* Refactor the left hand side chat list by @stefl in https://github.com/oaknational/ai-beta/pull/474\r\n* More lenient types for json patch, plus some related Americanisms fixes by @stefl in https://github.com/oaknational/ai-beta/pull/504\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.8...v1.1.9-rc2

## Version v1.1.8
## What's Changed\r\n* chore: update legal links by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/492\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.7-rc2...v1.1.8-rc1

## Version v1.1.7
## What's Changed\r\n* Add pre-release and release workflows by @mantagen in https://github.com/oaknational/ai-beta/pull/488\r\n* chore: typo by @mantagen in https://github.com/oaknational/ai-beta/pull/489\r\n* FIX: Retain posthog anonymous ID when initialising, fixing UTM tags by @codeincontext in https://github.com/oaknational/ai-beta/pull/487\r\n* build: fix PR title for release process by @mantagen in https://github.com/oaknational/ai-beta/pull/493\r\n* Add additional user ID metadata to both Open AI and Helicone by @stefl in https://github.com/oaknational/ai-beta/pull/491\r\n* build(pre-release workflow): merge with ours strategy by @mantagen in https://github.com/oaknational/ai-beta/pull/494\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.6...v1.1.7-rc2

## Version v1.1.6
## What's Changed\r\n* Add pre-release and release workflows by @mantagen in https://github.com/oaknational/ai-beta/pull/488\r\n* chore: typo by @mantagen in https://github.com/oaknational/ai-beta/pull/489\r\n\r\n\r\n**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.5...v1.1.6-rc2

# [1.1.5](https://github.com/oaknational/ai-beta/compare/v1.1.4...v1.1.5) (2024-05-13)

## What's Changed
* refactor: download links document type definitions by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/486


**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.4...v1.1.5

# [1.1.4](https://github.com/oaknational/ai-beta/compare/v1.1.3...v1.1.4) (2024-05-13)

## What's Changed
* feat: add helicone logging by @stefl in https://github.com/oaknational/ai-beta/pull/475

**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.3...v1.1.4

# [1.1.3](https://github.com/oaknational/ai-beta/compare/v1.1.2...v1.1.3) (2024-05-13)

## What's Changed
* Feat/progress feedback by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/471
* chore: redirect chat -> aila by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/473
* Update slides and page offsets by @codeincontext in https://github.com/oaknational/ai-beta/pull/472
* Feat: Add learning cycle feedback fields to slide generator by @codeincontext in https://github.com/oaknational/ai-beta/pull/477
* UI fixes on main by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/479
* bug: fix share page by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/481
* chore: add help page by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/478


**Full Changelog**: https://github.com/oaknational/ai-beta/compare/v1.1.2...v1.3.0

# [1.1.2](https://github.com/oaknational/ai-beta/compare/v1.1.1...v1.1.2) (2024-05-08)

- American to British English corrections by @stefl in https://github.com/oaknational/ai-beta/pull/464
- feat: Rate limiting for lesson planner chats by @codeincontext in https://github.com/oaknational/ai-beta/pull/432
- feat: remove openapi from repo by @remy in https://github.com/oaknational/ai-beta/pull/458
- Feat: Update page titles to 'AI Lesson Planner' by @codeincontext in https://github.com/oaknational/ai-beta/pull/469
- Refactor statistics to use Prisma.sql and Prisma.raw by @codeincontext in https://github.com/oaknational/ai-beta/pull/457
- Allow downloads by non-Google accounts by @mantagen in https://github.com/oaknational/ai-beta/pull/465

# [1.1.1](https://github.com/oaknational/ai-beta/compare/v1.1.0...v1.1.1) (2024-05-07)

- Reinstate JSON schema in the prompt by @stefl in https://github.com/oaknational/ai-beta/pull/461
- Add some more reinforcement about British English by @stefl in https://github.com/oaknational/ai-beta/pull/460
- Remove the /rag endpoints. Add Zod parsing by @stefl in https://github.com/oaknational/ai-beta/pull/459
- fix: push to production only when a tag release is 'published' by @mantagen in https://github.com/oaknational/ai-beta/pull/463
- chore: Remove bugsnag by @tomwisecodes in https://github.com/oaknational/ai-beta/pull/441

# [1.1.0](https://github.com/oaknational/ai-beta/compare/v1.0.4...v1.1.0) (2024-05-02)

### Features

- **sentry releases:** align sentry version and release stage with values from our next.config.js ([d3c4147](https://github.com/oaknational/ai-beta/commit/d3c41470621498ef5be6971c2dae8b6b8e1ce2b7))

## [1.0.4](https://github.com/oaknational/ai-beta/compare/v1.0.3...v1.0.4) (2024-04-30)

## [1.0.3](https://github.com/oaknational/ai-beta/compare/v1.0.2...v1.0.3) (2024-04-30)

## [1.0.2](https://github.com/oaknational/ai-beta/compare/v1.0.1...v1.0.2) (2024-04-30)

## [1.0.1](https://github.com/oaknational/ai-beta/compare/v1.0.0...v1.0.1) (2024-04-30)

# 1.0.0 (2024-04-30)

### Bug Fixes

- add border to checkboxes ([f10d106](https://github.com/oaknational/ai-beta/commit/f10d106d24a7f9776bfc9a99b2dc98239bf87551))
- add children prop back to Checkbox ([d01d051](https://github.com/oaknational/ai-beta/commit/d01d0512b2c1cfcf4b1cb04937407e0d8d6c4369))
- add extra handling around session invalidity ([50f6e3a](https://github.com/oaknational/ai-beta/commit/50f6e3a1e8dae3fa7e7825e2c0aadfc00f852065))
- add fake openai key to ci.yml to try and get build working ([1174b80](https://github.com/oaknational/ai-beta/commit/1174b80aae425396d03581e778d554f9bf666cda))
- add missing inngest import to app router ([ad65c65](https://github.com/oaknational/ai-beta/commit/ad65c65b0eb8f09e44555581a8dd875582097f26))
- add missing lesson planner events, fix those referring to wrong app ([7cda62f](https://github.com/oaknational/ai-beta/commit/7cda62f368e8366b66ce713b53038f9addb36e60))
- add newline formatting to /prompts page ([ff5aa42](https://github.com/oaknational/ai-beta/commit/ff5aa4239e10e9028c1cf88723ea85b9f8fa82bd))
- add user_id to appSession schema ([56b8d67](https://github.com/oaknational/ai-beta/commit/56b8d67919570073675e2c524c4045c621a0a1f6))
- align zod versions so inngest EventSchemas correctly type-check ([f7565cf](https://github.com/oaknational/ai-beta/commit/f7565cf9ee5adb7a4a1c2292ce78a823aa346158))
- assert that the inngest upload call was successful ([0510f5b](https://github.com/oaknational/ai-beta/commit/0510f5b9e605666aa5af747d31f2cdc466713bc5))
- attempt again to apply auth to all rotues ([59c7c73](https://github.com/oaknational/ai-beta/commit/59c7c734c9f58f02245d2f23db87ebfcd35fa550))
- attempt to add disabled button state styles ([7dcd19c](https://github.com/oaknational/ai-beta/commit/7dcd19cb4240f26779e32971293b2d6bc0ff7700))
- attempt to filter out third party IP containing lessons from scrape ([1db2377](https://github.com/oaknational/ai-beta/commit/1db2377bc8346bf80c715de73f04508bfff5a0b4))
- attempt to fix button regressions ([e80df57](https://github.com/oaknational/ai-beta/commit/e80df57fa8c874cd0b39c53066906e6602abc102))
- attempt to retry createSession once ([035d331](https://github.com/oaknational/ai-beta/commit/035d331921d0c0abd4da300a47209576c864d4ff))
- attempt to use netlify background functions for inngest jobs ([4a6a739](https://github.com/oaknational/ai-beta/commit/4a6a7399b64707344fe80933c2c4146fafdb0347))
- bug where submit needs clicking twice ([b7495e4](https://github.com/oaknational/ai-beta/commit/b7495e4df8765f05bf47de4db93537859156f4b7))
- capture initial pageviews ([3f52153](https://github.com/oaknational/ai-beta/commit/3f5215311b8b1e5ad670482b241a8f1439400761))
- cast GenerationPart related zod schemas to simplify types ([737be30](https://github.com/oaknational/ai-beta/commit/737be3039c38c1e854119f317b1fdeabef50eee7))
- chatbot downloads ([d25ee9e](https://github.com/oaknational/ai-beta/commit/d25ee9eb05f9d0446deedac3a0a5a3bf95a918af))
- check gleap key exists before intializing ([1cb54e7](https://github.com/oaknational/ai-beta/commit/1cb54e7e5d189fee95df072d040e62797167dc73))
- conditionally enable clerk debug mode based on CLERK_LOGGING env ([81aa235](https://github.com/oaknational/ai-beta/commit/81aa235f92d26316422305f0e93a117358ef91f0))
- conditionally pick env for PRs/main pushes ([4223928](https://github.com/oaknational/ai-beta/commit/42239283c9c7290e89431c600b04c73f61d5ac18))
- consistently name quiz_designer\* events ([ea16943](https://github.com/oaknational/ai-beta/commit/ea16943a6d49a821fdb8c059bf03155f8a5126e0))
- correct lesson/quiz state status types in schemas ([85fdc16](https://github.com/oaknational/ai-beta/commit/85fdc16f4dec330431ce21a9b8e89bb512eaca00))
- correctly sync answer tweaking and local state, extract Answer comp ([2decf36](https://github.com/oaknational/ai-beta/commit/2decf3609274eff32489c00b684ed6e570277737))
- create necessary db users for migrations to work locally ([b19a69d](https://github.com/oaknational/ai-beta/commit/b19a69de676411b08983fb923b624bd5081d55d0))
- create necessary db users for migrations to work locally ([27f915d](https://github.com/oaknational/ai-beta/commit/27f915df6cb47961740a3c047248546499dcaf5c))
- create session on page mount, don't block quiz begin ([9e7d99f](https://github.com/oaknational/ai-beta/commit/9e7d99fd94d53173e891db80201235ffe279df3d))
- disable distractor edit/regenerate buttons while loading or editing ([8bc86fa](https://github.com/oaknational/ai-beta/commit/8bc86fa075ac1b2809e28a5177d609cee65c6db2))
- disable lp section actions while streaming ([3ab67dd](https://github.com/oaknational/ai-beta/commit/3ab67ddd24ba655b1fb665c615c11eb441ab2e36))
- **docker-clear npm script:** check container existence ([177225a](https://github.com/oaknational/ai-beta/commit/177225a07baf720e9b25ffd5a8334f04f5a550b6))
- don't allow re-generating answers and distractors without question ([44990fa](https://github.com/oaknational/ai-beta/commit/44990fac1c25c564fdea141e2a165c8f1618b566))
- don't attempt to infer app version from tags, as we don't use them ([ba1b8a0](https://github.com/oaknational/ai-beta/commit/ba1b8a0029ead251fa0bde41c38527d2b9e85b1c))
- don't attempt to opt_out from posthog if we don't have the API key ([c54cf1b](https://github.com/oaknational/ai-beta/commit/c54cf1b2e1b421e7a653985cd0b2a2e40b596f7b))
- don't attempt to save lesson data to localstorage until generated ([223f541](https://github.com/oaknational/ai-beta/commit/223f5410ad4e2d3c9d8b3785033719b6f7fd5bcf))
- don't call bugsnag.getPlugin before bugsnag is initialized ([db2f40d](https://github.com/oaknational/ai-beta/commit/db2f40d3bc334f0eec4443d073ad18223b167553))
- don't call posthog opt_out/identify until we've definitely loaded ([384d14c](https://github.com/oaknational/ai-beta/commit/384d14cb83b5a51653fb435a46f6b0a256d224c4))
- don't check user.isLoaded before attempting to create session ([dbc2f29](https://github.com/oaknational/ai-beta/commit/dbc2f29025347bcbf558dc532b054f88ce1fe05e))
- don't clear localstorage quizData by setting it to an empty string ([ef2c020](https://github.com/oaknational/ai-beta/commit/ef2c0206cbc7339727022fe2d05241607a6e346f))
- don't fail to render a whole quiz if we're just missing the name ([ca82e4b](https://github.com/oaknational/ai-beta/commit/ca82e4b7352c97de63edcf55b551a93c6150ca02))
- don't flag 100% of generations ([def02d7](https://github.com/oaknational/ai-beta/commit/def02d7dde9378358f764d9aff68af659cd196ca))
- don't hide the topic input when navigating back to topic if set ([bee2cdd](https://github.com/oaknational/ai-beta/commit/bee2cdd3ea2671ea3aed8f29677cb66b5b12f448))
- don't import @oakai/core from core itself ([8cd43ca](https://github.com/oaknational/ai-beta/commit/8cd43ca3de25995ed4f0b1088c7cb34c7272d04b))
- don't import from langchain core ([821df2c](https://github.com/oaknational/ai-beta/commit/821df2c277656c30742adf067bdfd82bc0263dc1))
- don't initialize posthog before API key is available (v2..) ([a019948](https://github.com/oaknational/ai-beta/commit/a01994846ddb6d67e193b1353afa0f223a39bc90))
- don't needlessly opt_out after posthog inits ([f10997e](https://github.com/oaknational/ai-beta/commit/f10997e303b0cba857b51ae91bfbc08676464235))
- don't overscroll past first lp header when streaming starts ([d1181e9](https://github.com/oaknational/ai-beta/commit/d1181e95af455cd9eb5cfc416b8a25dbb9a21f3e))
- don't persist quiz state until after the user has started ([b47d858](https://github.com/oaknational/ai-beta/commit/b47d85826a9e27205e9ec8c2d450a483a0140103))
- don't randomly re-shuffle the lesson plan quizzes each render ([9d2e9f8](https://github.com/oaknational/ai-beta/commit/9d2e9f85601e26a5aea76a2ff0b753fe751ed695))
- don't redirect to onboarding or require auth for legal pages ([d108770](https://github.com/oaknational/ai-beta/commit/d108770776fad4a745c9f52284774eb684000272))
- don't refetch lesson playground content on window focus ([2176b4f](https://github.com/oaknational/ai-beta/commit/2176b4f5acf1f6d11a9fdd5edb54f648f96bc654))
- don't rely on prisma global in api/health ([518c921](https://github.com/oaknational/ai-beta/commit/518c921d76835c9b8939bf8396d187c79865b942))
- don't render falsy time values when passed to Generating ([f93f661](https://github.com/oaknational/ai-beta/commit/f93f661aa73b2691ecb1fa0526b6c132d0468b8b))
- don't reset questions when they edit KS and return to questions ([0dd4673](https://github.com/oaknational/ai-beta/commit/0dd4673e408526c84a994e943cc56bd0bec3ea59))
- don't return isLegacy lessons ([5e81c6e](https://github.com/oaknational/ai-beta/commit/5e81c6e06999e7b33d638a902ab881132ea153d7))
- don't send all generation metadata alongside lesson plan sections ([826abb7](https://github.com/oaknational/ai-beta/commit/826abb79f1a0a014e070b2161bb504e7bb2d3f36))
- don't start the quiz editing when session creation sucesfull ([dc1e3f9](https://github.com/oaknational/ai-beta/commit/dc1e3f95eaf1c48f39a5fcfdfff86a02149ed15e))
- don't tell the user they're ratelimited when they're not ([5081201](https://github.com/oaknational/ai-beta/commit/50812011ecfc6d40a3f072f4c7440d435ebe7868))
- don't transition loading->idle->loading in useGeneration ([a056c8a](https://github.com/oaknational/ai-beta/commit/a056c8a489c546e44ac3ff67ab3e6af117379c58))
- don't wait for user.isLoaded to become true as it often doesn't ([69922c1](https://github.com/oaknational/ai-beta/commit/69922c1936c7db6035041b67540245e77fa16af1))
- enable prisma pgbouncer mode with directUrl fallback ([a45af13](https://github.com/oaknational/ai-beta/commit/a45af135367bc3c08fa42add8d9f80e3a04fa9fd))
- enable reverse proxying netlify with clerk ([7fbd52b](https://github.com/oaknational/ai-beta/commit/7fbd52bfb94e2240736f6698e2361e149aec4e95))
- ensure `lessonPlanJson` in promptInputs is serialized ([27fadc7](https://github.com/oaknational/ai-beta/commit/27fadc770e44523a76152983399ac9274c668e7c))
- ensure answer generations send all required values, show errors ([f1c8fb9](https://github.com/oaknational/ai-beta/commit/f1c8fb9e042ed70890dbb08200e7d29fe0706269))
- ensure apps returned by appRouter are correctly serialized ([ae9582e](https://github.com/oaknational/ai-beta/commit/ae9582eff446c644d7117ad7f2370e80f041deb8))
- ensure different questions within a section are sorted differently ([fe203d6](https://github.com/oaknational/ai-beta/commit/fe203d661c77729cf3c08941ab5460ae6d709498))
- ensure inngest calls our subdomain to avoid redirects & CF access ([9ae8ef6](https://github.com/oaknational/ai-beta/commit/9ae8ef6964330e334bfdbd71386b34c6332b9634))
- ensure originalValue is sent to backend on tweak ([fd3e4ec](https://github.com/oaknational/ai-beta/commit/fd3e4ec0fa95b2198bb8d9bb843297d87ea5f5e6))
- ensure parseLocalStorageData returns shape of parsed data ([33682c6](https://github.com/oaknational/ai-beta/commit/33682c6333137a025bca0cefbae44a4a0f108ac6))
- ensure pino logs are sent to datadog ([6e2b459](https://github.com/oaknational/ai-beta/commit/6e2b459922cb31b004fbd2929b1f0231e88101fa))
- ensure placeholder content is passed to quizzes ([de17097](https://github.com/oaknational/ai-beta/commit/de17097c678e7703d6230809345b8b1cf5191992))
- ensure placeholder quizzes are rendered ([b01c279](https://github.com/oaknational/ai-beta/commit/b01c279c31356b8faa34139e1547ff43b22ac3e0))
- ensure postgresql-contrib is installed in docker container ([3c60185](https://github.com/oaknational/ai-beta/commit/3c601853d4e88b8f340490ad951b6a3d43c2c391))
- ensure postgresql-contrib is installed in docker container ([c96e8e5](https://github.com/oaknational/ai-beta/commit/c96e8e5a898318d18ab7b964906b761af775296d))
- ensure promptInputs are always saved ([bd18619](https://github.com/oaknational/ai-beta/commit/bd1861915b505e9636aea46c5c4b741e5e747338))
- ensure quiz questions have a defaultValue ([c046011](https://github.com/oaknational/ai-beta/commit/c046011b9a4470429b420c55122175fb9d0b4afd))
- ensure ratelimit notification is shown at appropriate time ([9710a53](https://github.com/oaknational/ai-beta/commit/9710a53fbb972a08114e8a3793f34712d407f622))
- ensure sessionId is sent for tweaks and item flagging requests ([7a534e8](https://github.com/oaknational/ai-beta/commit/7a534e83970466998b6479c1679fe3ba48fc5c99))
- ensure trpc requests get the clerk middleware context ([cb1ebc1](https://github.com/oaknational/ai-beta/commit/cb1ebc18410abe4dc3f7eb17f0355f09bc224fe2))
- ensure useGenerationCallbacks.onSuccess is actually called ([4355d6a](https://github.com/oaknational/ai-beta/commit/4355d6ae73ebeb47149d433338f17a3abb0e49d4))
- ensure user is loaded before creating quiz session ([11d3482](https://github.com/oaknational/ai-beta/commit/11d3482bdcb573134afe12231977a7aaa954079b))
- ensure zod parse fail is returned to useGeneration caller ([c19b0e7](https://github.com/oaknational/ai-beta/commit/c19b0e7e5bcdde264bb3aa0c72f7733e8228331b))
- explicitly log generation errors inline, not onFail ([697bb9f](https://github.com/oaknational/ai-beta/commit/697bb9f2615404a3bb8b237aeaa569a7b8ea11dd))
- explicitly log root error when formatting fails ([df6c071](https://github.com/oaknational/ai-beta/commit/df6c071b72d87eb52529f3df29cfd52963825461))
- extract DistractorInput, correctly handle state updates ([4702e4d](https://github.com/oaknational/ai-beta/commit/4702e4decde34f4a14282c2c6a7b58b46b53af6a))
- filter generation data returned to client ([ba1b3c5](https://github.com/oaknational/ai-beta/commit/ba1b3c5c7df2a46fe01c1f86c2f604f62a9f8051))
- fix import causing inngest client to be called before definition ([3055544](https://github.com/oaknational/ai-beta/commit/3055544b7c4fd0466f47ff73e255946b61826110))
- fix linter error by upgrading typescript-eslint to v6 ([04f63b6](https://github.com/oaknational/ai-beta/commit/04f63b6355ba89780516f0c7b30a0c5786c8fa72))
- fix onboarding checkbox width ([d9b878b](https://github.com/oaknational/ai-beta/commit/d9b878bb615d625abdb588bb8626d0cfde80ddbd))
- fix regression with key learning points appearing twice ([a7c2a51](https://github.com/oaknational/ai-beta/commit/a7c2a51ead02f11a12c86cf4ca21c0a76e646d99))
- fix UI for non feature flagged lesson plan users ([aff5a35](https://github.com/oaknational/ai-beta/commit/aff5a3589b2b1d6730a77259bba24ef2dc04cf8b))
- get ci building again ([2ae2bb9](https://github.com/oaknational/ai-beta/commit/2ae2bb95393432a02f7acc1ae9d99623727470a3))
- gpt unable to place request ([cfd789f](https://github.com/oaknational/ai-beta/commit/cfd789f0bc3c83b8e451b19299bf554723296548))
- handle background function invocation in netlify-plugin-inngest ([b52e947](https://github.com/oaknational/ai-beta/commit/b52e947432ede4b6069e988159ab2af3b66d98de))
- handle moderation failed state in useGeneration ([def863b](https://github.com/oaknational/ai-beta/commit/def863b438c94709dc7dcf3e697a5320b1f48f90))
- handle new loading states after initial useGeneration mutation ([fddf90f](https://github.com/oaknational/ai-beta/commit/fddf90f9f66f632be47eda5fb0260fa24dbfb185))
- hide answers while re-generating ([0f24f91](https://github.com/oaknational/ai-beta/commit/0f24f91bb59f62a8c54398938b4823fa571adc8c))
- hook up regenerate all ([2a5e45e](https://github.com/oaknational/ai-beta/commit/2a5e45e56ed9998a3649d4871da2fba4dfc71180))
- hook up regenerate-distractor ([d03141f](https://github.com/oaknational/ai-beta/commit/d03141fcc421860bbbc992ce935ebcfbf9d14cdd))
- ignore table owners when running pg_dump ([c7eb77d](https://github.com/oaknational/ai-beta/commit/c7eb77d2c575c18c6c1a70d3b9579397fb931d44))
- incorrect prompt name in regenerate-all-distractors tooltip ([015d98d](https://github.com/oaknational/ai-beta/commit/015d98d821117b958567209064d15ccbcfa9709a))
- increase FE timeout for lesson-planner ([d3dfdac](https://github.com/oaknational/ai-beta/commit/d3dfdac97cbfa4d5a8ec7eaf5d72aa2883306048))
- introduce lesson plan status to handle generation streaming ([5d4a1d2](https://github.com/oaknational/ai-beta/commit/5d4a1d2edff8d22e97faf51440be9b51c9f8f2f9))
- **jobs:** ensure generations exist before hitting OpenAI ([0ee3567](https://github.com/oaknational/ai-beta/commit/0ee35671030560efa303f59fc14577489926b3e0))
- keep path when redirecting from netlify to our subdomain ([86c84e9](https://github.com/oaknational/ai-beta/commit/86c84e95aff99a70ff452cbcbae9a787e5bc64a5))
- **lesson-page:** fix invalid field IDs and incorrect labels ([b631086](https://github.com/oaknational/ai-beta/commit/b6310860268eaf2962d2f297ec6603f8256ce521))
- load appropriate civic product from environment ([3c5dbc1](https://github.com/oaknational/ai-beta/commit/3c5dbc1373d6f16811e4bedd80e70a22a2bc0de4))
- lock quiz designer behind login ([cfb26fa](https://github.com/oaknational/ai-beta/commit/cfb26fad80b55c5ca1000c1082da6d6c04877ed2))
- lock quiz designer behind login ([c9b7859](https://github.com/oaknational/ai-beta/commit/c9b7859b4fd05b5fef705e4a7c993419208fa594))
- loosen FE types, ensure initialState has nulled sessionId ([0a51fd2](https://github.com/oaknational/ai-beta/commit/0a51fd24f22313c964c5946d1aabba734496590f))
- make appSession optional to ease migrations ([4529536](https://github.com/oaknational/ai-beta/commit/4529536813b742fd45c775cc5d8cb0012e0ab88f))
- make chevron icon on select menu clickable ([7f9e79c](https://github.com/oaknational/ai-beta/commit/7f9e79c0d860be509bbcf2a299cad115865d8895))
- make new types with with generations.flag endpoint ([93615f5](https://github.com/oaknational/ai-beta/commit/93615f5c948add3eb37274c61f36dbde41edb3fe))
- make recalculateStatistics run on cron ([9c5a2ad](https://github.com/oaknational/ai-beta/commit/9c5a2ad19df0e4fd7553ff5dbe51c62212c88953))
- make TRPCError log line more useful ([b980ffa](https://github.com/oaknational/ai-beta/commit/b980ffaebae5a895f2f0c76f4b1d92865607a54d))
- manually redirect unauthenticated users from quiz-designer ([bb97b58](https://github.com/oaknational/ai-beta/commit/bb97b588a96b73e0924fa6583abf978a511312e8))
- mark generation rateLimit as optional on outputSchema ([f7da26d](https://github.com/oaknational/ai-beta/commit/f7da26d4f3f93115554b92c59122f470a38960b2))
- mark lesson sidebar buttons as disabled while generating ([44dfce5](https://github.com/oaknational/ai-beta/commit/44dfce57a6fd050e46266b590fb04ed1482ee784))
- move openai model instantiation out of constructor, fix CI build ([538af15](https://github.com/oaknational/ai-beta/commit/538af152f2c825ca403627c9bcb6c581b00359a3))
- move questions across to OWA ([8194518](https://github.com/oaknational/ai-beta/commit/81945187b5fd82cdc21356dae8163eb8e4b0e4fd))
- move secrets to root of workflow ([a8cef53](https://github.com/oaknational/ai-beta/commit/a8cef536c7c933f4cd6ac9d0001d8ce6e69521c1))
- notify bugsnag on caught preview error ([1e2092f](https://github.com/oaknational/ai-beta/commit/1e2092ff0ca098b821202648ca0eb020cd11784a))
- only allow \_next/static, not \_next/data in middleware ([e87df09](https://github.com/oaknational/ai-beta/commit/e87df093f2c3a7dea56145e06575477879e95371))
- only attempt to create session once, debug log user.isLoaded ([779ab73](https://github.com/oaknational/ai-beta/commit/779ab7379af2029aa7f7d4d1bf78de16dec56853))
- only attempt to restore session from localstorage once ([f8abd6c](https://github.com/oaknational/ai-beta/commit/f8abd6c2937e9c963e025401ab1a8ca6ed4e55fa))
- only call updateSessionState while the user is editing a LP ([3b2ad69](https://github.com/oaknational/ai-beta/commit/3b2ad69d603e40da7a424ebe1aa49a08202dd527))
- only create 1 session, remove eslint ignore ([8c71f5e](https://github.com/oaknational/ai-beta/commit/8c71f5e2558da085c45682b900504827d379555a))
- only stream generations that explicitly opt in ([1a0ef06](https://github.com/oaknational/ai-beta/commit/1a0ef0673cd70403a96ba3c3a7eb5361a065656d))
- only trigger useGeneration's callbacks when transitioning state ([cd61c91](https://github.com/oaknational/ai-beta/commit/cd61c915575c7f903f39fe3caab5b55553996d1e))
- overwriting bug in export lesson plan doc ([a31fba6](https://github.com/oaknational/ai-beta/commit/a31fba6eb5e0ce546e91d8cdd9a77bb232b51cd0))
- pass all github secrets as env vars to build step ([ec40ed8](https://github.com/oaknational/ai-beta/commit/ec40ed802e752b6bf577bea468ea0fb3e129fadd))
- pass correct numberOfDistractors/Answers to each generation ([c7bae99](https://github.com/oaknational/ai-beta/commit/c7bae9927fe677625506d8a9d2e94dc5003b5b55))
- pass estimated prompt timings to lesson plan components ([a876917](https://github.com/oaknational/ai-beta/commit/a8769175201053de55f8e929203d4cb5ded316a0))
- pass LLM generated error message to front-end ([45e9626](https://github.com/oaknational/ai-beta/commit/45e962657da27bbbb7437643c6cf4fc597ba8db7))
- preserve all newlines when copying content of html to text ([a2d3ecb](https://github.com/oaknational/ai-beta/commit/a2d3ecb9880bb1edf81bf7424931a285817098f4))
- **qd:** attempt to fix disabled quiz button by tightening localstorage ([671c24a](https://github.com/oaknational/ai-beta/commit/671c24ab409f088e3966da1f88c6cee81a14ecaa))
- **quiz-designer:** temporarily remove disabled attr from generation btn ([b94071e](https://github.com/oaknational/ai-beta/commit/b94071e2aa2948fd4223effd84f72dfbf7d48750))
- re-enable exports with new data structure ([1300e3b](https://github.com/oaknational/ai-beta/commit/1300e3bf888f391a8af46b64f3924a509376cc76))
- re-enable quiz previews by replacing faulty shuffle algo ([b02a91f](https://github.com/oaknational/ai-beta/commit/b02a91f73f9f2ad7c6ec66faf89bd1493cc9de04))
- remove 2nd arg to `getChat` ([993be00](https://github.com/oaknational/ai-beta/commit/993be0032e45a4822ee52de4668f541cf2a30c0e))
- remove accidental debugging of requestGeneration function ([f946ec8](https://github.com/oaknational/ai-beta/commit/f946ec83178780926675874017c7876fed9e3b61))
- remove casting in KeywordSection ([c908678](https://github.com/oaknational/ai-beta/commit/c9086782bfef9b0ca70ce18e3df68f431f4f53d4))
- remove casting in KeywordSection ([e8b09e0](https://github.com/oaknational/ai-beta/commit/e8b09e028399cea2ab8c1b78cccf93956c8a6b8e))
- remove console log from CardButton, fix invalid type import ([569f0aa](https://github.com/oaknational/ai-beta/commit/569f0aa8a4c9998724308e52d291b6f3193ca1b8))
- remove explicit button tracking, which dupes autocaptures events ([75dd596](https://github.com/oaknational/ai-beta/commit/75dd59659d46b2b8381737f6c9bb1c94ae6a5cbb))
- remove generation streaming feature flag ([09cd43a](https://github.com/oaknational/ai-beta/commit/09cd43a15d794b3e380fc10275f66c44da5025fb))
- remove hard-coded error in requestGeneration ([edbb863](https://github.com/oaknational/ai-beta/commit/edbb863496315edc1bf517b9daac638848a49aac))
- remove legal menu items from side navigation ([bcc9ed6](https://github.com/oaknational/ai-beta/commit/bcc9ed6fe4a5e7ce40d7ef361ca234daad582ea6))
- remove nullable states from useCallback ratelimit ([9fa9658](https://github.com/oaknational/ai-beta/commit/9fa9658723ab22813a96e92a1ba258be17c2ce8f))
- remove references to lessonActivities ([dc79e47](https://github.com/oaknational/ai-beta/commit/dc79e47f71974a4f9f388336842b7f4f46452995))
- remove undefined `browserLogger.isLevelEnabled` call causing errors ([24d0e55](https://github.com/oaknational/ai-beta/commit/24d0e55faf74ae809044426840e3925251a3028e))
- rename packages/core to @oakai/core ([412a4cf](https://github.com/oaknational/ai-beta/commit/412a4cf0c97a4b7fbbd418fda03b53a7426a7a3d))
- return API errors from useGeneration hook ([ccd9d30](https://github.com/oaknational/ai-beta/commit/ccd9d30de1e0a3be542a640b439707701ae0740a))
- round and pad estimated durations in Generating component ([dd8d6c5](https://github.com/oaknational/ai-beta/commit/dd8d6c5fd0547636edfc971e9497bd8315415494))
- save original tweak values to db, update column to be originalValue ([716c9bd](https://github.com/oaknational/ai-beta/commit/716c9bd68ac5725c6e9cb439e55efdf37874dcaa))
- save original values in user tweaks ([e5facd9](https://github.com/oaknational/ai-beta/commit/e5facd95bdee17f8c397ed56f10da1684a8dc15f))
- save user privacy policy acceptance to clerk ([5db0b47](https://github.com/oaknational/ai-beta/commit/5db0b47bdb096133c315e448c25d0cc5769ec7fe))
- send original error when reporting session fail to bugsnag ([2b20634](https://github.com/oaknational/ai-beta/commit/2b2063464e34b3cda62807c6ae97ab9a861ce269))
- sentry env ([be98e39](https://github.com/oaknational/ai-beta/commit/be98e398ce7247d92a08bd88afdb70a8f785d5b5))
- set default button width ([641bf7b](https://github.com/oaknational/ai-beta/commit/641bf7bb2f9778452e2584012184903dc94cbf72))
- set github environment in ci.yml ([6f9b908](https://github.com/oaknational/ai-beta/commit/6f9b9087e3683026fee99e8f1ee392bf76a6a957))
- set state.rateLimit.generationsRemaning to nullable ([ba785e4](https://github.com/oaknational/ai-beta/commit/ba785e4931c16c068cc1dad7754b5348cfa538c2))
- set tRPC to not refetchOnWindowFocus by default ([93aad5b](https://github.com/oaknational/ai-beta/commit/93aad5ba4896facc0afd672017acc76c1bed69c1))
- show average time copy for users without streaming enabled ([eff9526](https://github.com/oaknational/ai-beta/commit/eff95266b931515524e4503ac3da8dd4914823de))
- simplify response for text similarity ([c242128](https://github.com/oaknational/ai-beta/commit/c242128acd817c287a334f8f325db362e38c3def))
- sort paths ([4f6f29d](https://github.com/oaknational/ai-beta/commit/4f6f29df552d0a0fceaa5e2152327dabf6928ead))
- stop generation.request from failing tRPC output validation ([721b711](https://github.com/oaknational/ai-beta/commit/721b711a201ac0696a6c2c33f82724b1f250dbf2))
- swallow all feedback/tweak/regen errors server-side ([68a7d97](https://github.com/oaknational/ai-beta/commit/68a7d9799e38e6c8abec5bdb2e6abc6fb825d131))
- switch to using hasura for downloads ([5dbdfa5](https://github.com/oaknational/ai-beta/commit/5dbdfa5467de79a4fa675c69b3756489a149fc97))
- temporarily mark lastGenerationId as optional ([2ba8fd7](https://github.com/oaknational/ai-beta/commit/2ba8fd78e372f14bb0b2c833c1ec3abc1be09891))
- update store rateLimit on generation start ([7c9d97b](https://github.com/oaknational/ai-beta/commit/7c9d97b56dc5d6cd80b774baadd0ce2db47301ba))
- update the MV for downloads - need to make my own ([5c7bc1e](https://github.com/oaknational/ai-beta/commit/5c7bc1e5d735f18d4c1e47ba3172b9ef1abfc7df))
- upsert instead of delete/recreate apps in seed script ([779ab6f](https://github.com/oaknational/ai-beta/commit/779ab6fb99e613f059160ff87b5a4e07efe423f7))
- use /api/inngest in netlify plugin ([fe81a76](https://github.com/oaknational/ai-beta/commit/fe81a76f3d1625eb63e75ec05ed2aa17afb0aef5))
- use correct app/prompt slugs for all lesson plan queries ([6146e7e](https://github.com/oaknational/ai-beta/commit/6146e7e0872747df96fb26c2d474eed48ef93660))
- use correct app/prompt slugs for lesson plan queries ([c096313](https://github.com/oaknational/ai-beta/commit/c096313d106f57aa8489ea65a4d856eb7959a2ce))
- use correct ports for inngest npm scripts ([5d35940](https://github.com/oaknational/ai-beta/commit/5d3594064651b7970110880e812dc014a3424cc3))
- use correct posthog env var to intialize client ([c5366c9](https://github.com/oaknational/ai-beta/commit/c5366c969896ba4c3d00f1222396a9faa835abaf))
- use DEPLOY_PRIME_URL instead of URL to enable preview deploys ([6c18550](https://github.com/oaknational/ai-beta/commit/6c185501692d50ba293d3d177c17f3f5eb8d577d))
- use posthog react hook, inline checks to component so ph inits ([e741fa5](https://github.com/oaknational/ai-beta/commit/e741fa55ee3ea5db0eee1206c21ddb0dab219cc5))
- use serverRuntimeConfig to infer inngest env ([efcd7d3](https://github.com/oaknational/ai-beta/commit/efcd7d39f415fc516d27f8409ce354e5220b55ee))
- wire up rate limit notifications to state ([8e8b770](https://github.com/oaknational/ai-beta/commit/8e8b77086f5207a51bc6dafdea85bd4f9c36548c))
- wire up regenerate all distractors ([f91b187](https://github.com/oaknational/ai-beta/commit/f91b1874414b86bdad1aa9ef0040bad7eef481b4))

### Features

- add "serializers" for prompts & apps to filter user visible data ([4a0913c](https://github.com/oaknational/ai-beta/commit/4a0913cf5e6d56c546953350e16542ab4fe52b9a))
- add @oakai/logger package, using pino & prettifying dev logs ([e0986b0](https://github.com/oaknational/ai-beta/commit/e0986b0c914ca55ff67882bb92523ce72ffdb3bd))
- add /api/health endpoint, check db connection ([b1070e7](https://github.com/oaknational/ai-beta/commit/b1070e785bf59862f7cd9b1df6fc7395252c6b0d))
- add /generations/with-template REST api endpoint ([7fe30b6](https://github.com/oaknational/ai-beta/commit/7fe30b61929d4d245625b3f76280f55fab794ffe))
- add additional bugsnag breadcrumbs to generation FE ([9661d68](https://github.com/oaknational/ai-beta/commit/9661d68313137dc84db993254b21653d92344ea9))
- add additional GenerationStatus members to describe more states ([c5ab53b](https://github.com/oaknational/ai-beta/commit/c5ab53be6c6e9d50e2ca575c8ce6031870a14606))
- add additional openAPI endpoints for generations/sessions ([158499d](https://github.com/oaknational/ai-beta/commit/158499d522d2f571706454931f5bf7178e382f0d))
- add alt generation for quizzes ([0509e2b](https://github.com/oaknational/ai-beta/commit/0509e2b7e0b3c0b3cccc1d11da0a4c9e8d318ffd))
- add api key based middleware ([b256c73](https://github.com/oaknational/ai-beta/commit/b256c7396ce59c74ee6a8ac032edb83e7709f595))
- add apis for open api usage ([8a6e594](https://github.com/oaknational/ai-beta/commit/8a6e5948b13e3f100e597bd0d0b2ac4e5c528341))
- add app.timings trpc procedure with avg generation times ([0c0d622](https://github.com/oaknational/ai-beta/commit/0c0d622b6fe3e93681bf52bf1ddf2785312370a7))
- add bugsnag build reporter plugin and app version tracking ([eeedf9c](https://github.com/oaknational/ai-beta/commit/eeedf9cab27b5944ee0a632451846b4a535e9a64))
- add bugsnag coverage ([d5728e7](https://github.com/oaknational/ai-beta/commit/d5728e7ee95ebb7d0c7f07880d27f60e12a3e0f2))
- add completedAt column to generations, rename duration ([925d7f3](https://github.com/oaknational/ai-beta/commit/925d7f3b313119d883e482d61123240232be02c7))
- add copy to clipboard ([96ffab2](https://github.com/oaknational/ai-beta/commit/96ffab2d4e3040acc9761dec3614978948ba0d80))
- add cors support on api ([7472820](https://github.com/oaknational/ai-beta/commit/7472820214743d4d7a8c51be9c053d9db3d24b10))
- add curriculum content to api ([9b18d1d](https://github.com/oaknational/ai-beta/commit/9b18d1d940c47d491bcb02394b0373d4edee246e))
- add debug logging to cookie control ([bf9809e](https://github.com/oaknational/ai-beta/commit/bf9809e269067133c6f454ef231f7e355306dd0c))
- add descriptions to help gpt ([4b8c1bd](https://github.com/oaknational/ai-beta/commit/4b8c1bd08054da22997018c4170461563e578ddd))
- add disabled state to question input while generating ([0befd79](https://github.com/oaknational/ai-beta/commit/0befd7983dde01b8276209ba588227861d193e64))
- add dockerfile, npm setup & ssh scripts ([c10c80a](https://github.com/oaknational/ai-beta/commit/c10c80a3670ddf49ce23d65fcaa46d992296583e))
- add downloads ([caeef6a](https://github.com/oaknational/ai-beta/commit/caeef6a1bccac37e20d5b05deaa5b3d0403753b2))
- add exports for chatbot ([a6389fb](https://github.com/oaknational/ai-beta/commit/a6389fb3d1e1652ff1a5e95d105063621704e40a))
- add extend-lesson-plan-quiz prompt ([cc9cae6](https://github.com/oaknational/ai-beta/commit/cc9cae67286b97914ab037f2648f93a5095b103b))
- add feature flag that desen't require initalisation ([8aef49a](https://github.com/oaknational/ai-beta/commit/8aef49a238bd2c5da00d2bec81cf5415b7308870))
- add feedback related actions to model, wire up initial tRPC logic ([7009c71](https://github.com/oaknational/ai-beta/commit/7009c71675e880c2fd1368b002024114fda97b7e))
- add filtering to the assets ([94245d9](https://github.com/oaknational/ai-beta/commit/94245d9b5c6acbe43653e36f421d914573af8faf))
- add Generation entity to schema file ([bfff79f](https://github.com/oaknational/ai-beta/commit/bfff79fcb6185fb50081869395710508ef207a4f))
- add hooks for eexports ([5734a53](https://github.com/oaknational/ai-beta/commit/5734a53ce338e1f5aca215c05eb022458ad52b41))
- add import for all shared items via user id ([fb1fcf8](https://github.com/oaknational/ai-beta/commit/fb1fcf8d9a6e61495e79f3435277b8f39073b0ef))
- add ingent event logging middleware ([7c1d872](https://github.com/oaknational/ai-beta/commit/7c1d872a59f758d1e5449b6dc0e7db0d87bb1939))
- add initial migration ([2b73ccc](https://github.com/oaknational/ai-beta/commit/2b73cccf9f4f9b0db1172859b67ad1dc66a8a520))
- add inngest checks to /api/health endpoint ([c1239c6](https://github.com/oaknational/ai-beta/commit/c1239c6689072aa3b7b0352f3501a5e51673c755))
- add inngest job to recalculate statistics every 30 mins ([d485e4c](https://github.com/oaknational/ai-beta/commit/d485e4c8fedfcdef50e732eaba0badd142cbef20))
- add input/output schema fields to Prompt model ([a5a6b46](https://github.com/oaknational/ai-beta/commit/a5a6b464dd7b7afd58aa4b2242fc15f7e94b743b))
- add key ([1980c0c](https://github.com/oaknational/ai-beta/commit/1980c0c969b27eb3a2d4000d7bee10418cfa4f16))
- add latest migrations for summaries ([9a42215](https://github.com/oaknational/ai-beta/commit/9a422152bb4c4f15ad4b73e114e498eb548e3fd1))
- add lesson description to CJ ([5466001](https://github.com/oaknational/ai-beta/commit/5466001ff97ce494c0414477dda1c3784690a923))
- add limiting to requestGeneration, pass to ctx, rm [@trpc-ratelimit](https://github.com/trpc-ratelimit) ([6c112af](https://github.com/oaknational/ai-beta/commit/6c112af6e5318dd4c95021295a4b0f484463af0c))
- add LLM_REFUSAL flag type ([c63c005](https://github.com/oaknational/ai-beta/commit/c63c005963867ed7fc6c091b768a2c89c2f59a7e))
- add local storage to the quiz ([71cb5ce](https://github.com/oaknational/ai-beta/commit/71cb5ce009b5abed63c81e0d554f52cfc51e879f))
- add migration ([1d6f48b](https://github.com/oaknational/ai-beta/commit/1d6f48b5155bb46ec46de3dfc2331518ba6e0af6))
- add migration for feedback tables ([0095f0b](https://github.com/oaknational/ai-beta/commit/0095f0bf68ab4fe8a654fe6b24d91629c1e0dc01))
- add migration to add empty input/output schemas to prompts ([604e45a](https://github.com/oaknational/ai-beta/commit/604e45a0b57b3094cda3b373d048401b626c6e4b))
- add migrations for session creation & linking ([2e62f78](https://github.com/oaknational/ai-beta/commit/2e62f7840b64c19ae81321ed7712a9b867953344))
- add mocked quiz builder tprc methods ([23ef6e8](https://github.com/oaknational/ai-beta/commit/23ef6e8688366863b1fb05119644bf745aec97e2))
- add moderation results migration ([a8434a2](https://github.com/oaknational/ai-beta/commit/a8434a2f46bfa63bb516ecde46e2737740b34877))
- add moderationType and moderationMeta fields to generation schema ([90db317](https://github.com/oaknational/ai-beta/commit/90db317115388a62f424daddf42454dcd7b544c7))
- add more context to requestGeneration logs ([7df695a](https://github.com/oaknational/ai-beta/commit/7df695aa7576d71736101be3af9a7aa3c80083a0))
- add new skelatton component ahead of streaming ([9ff4153](https://github.com/oaknational/ai-beta/commit/9ff415332f410689a3c1b1f4dcfb9472ad0b44a0))
- add node and pnpm versions to each package.json ([ea0b905](https://github.com/oaknational/ai-beta/commit/ea0b9050f3fc74a0169d873db76085b8551a784e))
- add NonRecoverableError status to quiz app, for when session fails ([9f48808](https://github.com/oaknational/ai-beta/commit/9f488084d3cc30a69fa9e52b378e760527c32418))
- add output column to app session and a new share db ([d3264b9](https://github.com/oaknational/ai-beta/commit/d3264b9df720d1509cd0309a9d175f80f15de3ed))
- add postmark email sending to gleap for quiz feedback ([95afeff](https://github.com/oaknational/ai-beta/commit/95afeff2e45f8d15b5d7cd8d36de9b72e487221a))
- add Prompt model, seed prompts for quiz-generator ([392f2bc](https://github.com/oaknational/ai-beta/commit/392f2bc56218b176ce381926b4e08830a55ac988))
- add prompt_id to statistics ([1aaa01f](https://github.com/oaknational/ai-beta/commit/1aaa01fd0c12803d8b2e356f7db8bd2054a197b9))
- add schema for app sessions ([e387a53](https://github.com/oaknational/ai-beta/commit/e387a536d17be08bbf5baf7214deba6c7a9202ed))
- add script to bulk import users from clerk ([71329a9](https://github.com/oaknational/ai-beta/commit/71329a9eb08153e7fc10537a63196b32c63d18b5))
- add scripts to dump staging db contents into local docker db ([82a8f8c](https://github.com/oaknational/ai-beta/commit/82a8f8c26be25727e2c394ad0b2f282783b412d8))
- add sign up button to homepage hero when not logged in ([c291f57](https://github.com/oaknational/ai-beta/commit/c291f57d2a38822f6d39494a11a5759bf7226433))
- add slides api route ([1dddbd0](https://github.com/oaknational/ai-beta/commit/1dddbd0682d98635c5721fef862073c7fb2e03f8))
- add some randomness to mock data to help frontend debugging ([bac7d90](https://github.com/oaknational/ai-beta/commit/bac7d902081e60c8525779910622c280467afc92))
- add statistics db table ([13e9d03](https://github.com/oaknational/ai-beta/commit/13e9d0327edb6572251abc9e4afbde9ca0931ae5))
- add statistics migrations ([576e0a9](https://github.com/oaknational/ai-beta/commit/576e0a91f7eb1a146a4242e68f01f64078eb95c2))
- add suggested lesson to lesson planner ([c6eea1f](https://github.com/oaknational/ai-beta/commit/c6eea1ff004f9b836fb2e6e914b27fde2239cb3d))
- add TMAI ([1fc6ff5](https://github.com/oaknational/ai-beta/commit/1fc6ff5c89396fd5a8891980d905ccfb98c97c57))
- add token usage columns to generations ([feab16b](https://github.com/oaknational/ai-beta/commit/feab16b4d61fffd1470a52a12966c279df361c07))
- add tRPC method to create new app sessions ([99c2ada](https://github.com/oaknational/ai-beta/commit/99c2adab3fa021b9c8026013a3955b448baed19b))
- add UI for extending lesson plan quizzes ([9926acc](https://github.com/oaknational/ai-beta/commit/9926acc2abf77915238d9149c697e39c66429db0))
- add uptime monitoring id to page meta ([082f27f](https://github.com/oaknational/ai-beta/commit/082f27f0d5550a31adc6780dda540e7538ef1689))
- add useGeneration hook to allow creating & subbing to generations ([5d0233e](https://github.com/oaknational/ai-beta/commit/5d0233e4ad5cd833c8dd89b0d0e79b38fa3d9009))
- add useGenerationCallbacks hook to improve DX of useGeneration ([3008d47](https://github.com/oaknational/ai-beta/commit/3008d474af1a5ce15eea8ff8d34813df2a8897ff))
- add users table ([7a2939d](https://github.com/oaknational/ai-beta/commit/7a2939dd8c58faec2f8a371d6ff9fc9bda66414c))
- add zod type hints to inngest client ([7c48a5a](https://github.com/oaknational/ai-beta/commit/7c48a5a6f88a1cc5865ec0696b8b32cef09450aa))
- add_prompts migration ([1bd4633](https://github.com/oaknational/ai-beta/commit/1bd46333da7493f5fcc6c27619038fc2ff2acad5))
- adds policy redirects ([845ae8a](https://github.com/oaknational/ai-beta/commit/845ae8a638aa2b8750a90787bdd7811b5dd681cb))
- adjust refetch ([51a3ac3](https://github.com/oaknational/ai-beta/commit/51a3ac3cfab822d597e5d013871ff023233c3697))
- adjust the slides data structure ([81b8ba5](https://github.com/oaknational/ai-beta/commit/81b8ba5f2e9c5939d8cc247d49633c543cbcf378))
- adjust to make a copy rather than give users access to oaks drive ([83e02a6](https://github.com/oaknational/ai-beta/commit/83e02a668ad6bab54f7d8c80e12e7878b80a6c04))
- allow authenticating via API key ([a8b0166](https://github.com/oaknational/ai-beta/commit/a8b01662337dfa7e1ec83e29f126d0b28dd86db0))
- allow for removing MODERATION\_\* envs ([c41720c](https://github.com/oaknational/ai-beta/commit/c41720ce1cf833969c2f31608e4cbd47be3e2308))
- allow opting in to ratelimiting by adding rate-limit-me to email ([049d6b7](https://github.com/oaknational/ai-beta/commit/049d6b78d8f031f3b0384aa7b46bbf8a9bb89612))
- allow overriding browser log level with ?logLevel search param ([5387920](https://github.com/oaknational/ai-beta/commit/5387920fb6bc83eaaeb7b01953dac533ccc7820e))
- animated tick when section has loaded ([df961d7](https://github.com/oaknational/ai-beta/commit/df961d72fedccf0684361b9c69457ca5ede120a3))
- auto-generate zod types from prisma definitions ([7620b77](https://github.com/oaknational/ai-beta/commit/7620b776e96e13bf097ef0cceba5f0334f42f734))
- background to blue ([ae9cc2b](https://github.com/oaknational/ai-beta/commit/ae9cc2bf88217b339fc89d70db7028863d4c3ae5))
- bootstrap ph client with userId, add email to identify call ([42bc5d9](https://github.com/oaknational/ai-beta/commit/42bc5d92a881175b6627dbe52ca98155f2b647f7))
- calculate mean and median llm and total generation timings ([8a63779](https://github.com/oaknational/ai-beta/commit/8a637795a317a5c576c15a2ca796c47e7b344800))
- call openAI with basic prompt from generation.requested job ([4b06e4a](https://github.com/oaknational/ai-beta/commit/4b06e4a665a4c91b469b512f4790640971ec3813))
- capture moderationType on flag ([74f7262](https://github.com/oaknational/ai-beta/commit/74f7262758322b55bbe7706fdd9d6c2909c3091a))
- capture more metadata about flagged generations ([04bab00](https://github.com/oaknational/ai-beta/commit/04bab00157249293ce2ec356539fa798c6564168))
- centralise generation event tracking in hook, add minor events ([7c0c308](https://github.com/oaknational/ai-beta/commit/7c0c30849a830ce7132c4e8bfd88fd924fc7f52e))
- change /lessons/{slug}/summary to OWA data ([8b1d43d](https://github.com/oaknational/ai-beta/commit/8b1d43dee689aa7b655c80ee9479cf009f968908))
- check prompt existence before starting generation ([3729286](https://github.com/oaknational/ai-beta/commit/37292868641b5fb0f2d85bb2fdbff57e171d859c))
- confirm new question layout ([9ad84f1](https://github.com/oaknational/ai-beta/commit/9ad84f12bc3194271a714447f4d1844ac6f7b3e9))
- continue buttons ([fcb6e1f](https://github.com/oaknational/ai-beta/commit/fcb6e1f000a8fc439c02010e55082a924e044d46))
- control english language moderation with env vars ([c28bd84](https://github.com/oaknational/ai-beta/commit/c28bd845085ca9c1b94d23a1b189e5350cf4cf81))
- convert to new look and feel ([dce4300](https://github.com/oaknational/ai-beta/commit/dce4300ce5ab4d0778f653ff4b95f56a5bdc3acc))
- create dialog step for exporting slides ([eb808a5](https://github.com/oaknational/ai-beta/commit/eb808a57d4512bb0b0de08f02c52c8f3886354d7))
- create generation.requested job with stubbed responses ([e51ff38](https://github.com/oaknational/ai-beta/commit/e51ff38a414f235743bdf3741287453a1a3de29c))
- create Generations model ([56afd22](https://github.com/oaknational/ai-beta/commit/56afd22efd3ce668135449bf5c1dd76e33c23d39))
- create generations page ([22869b8](https://github.com/oaknational/ai-beta/commit/22869b8804f185dd55a6018cdeda001038682614))
- create migration for db change ([2fe52b5](https://github.com/oaknational/ai-beta/commit/2fe52b57fc0bb70d33d63fa76f4c7a83900aad72))
- create sharing page for cj ([3d49548](https://github.com/oaknational/ai-beta/commit/3d4954861528bd2ec367f6b9454c9faf03146bea))
- create suggested quesitons compoennt ([15ed3ac](https://github.com/oaknational/ai-beta/commit/15ed3ac5b0349f4e84b68d7a3e0037102fd972ad))
- create trpc methods to create and look up a generation ([9f2368d](https://github.com/oaknational/ai-beta/commit/9f2368d69758ad757a11ad025f4515f947a45a09))
- debounce calls to updateSession / setting localStorage ([96ff232](https://github.com/oaknational/ai-beta/commit/96ff232969ae2883b8239142b8da2b114832ba6e))
- desktop review ([802a345](https://github.com/oaknational/ai-beta/commit/802a345bbc6cd46530fe334016580a1bf780eaaf))
- dialog button on resetting the session on quiz ([7a9a473](https://github.com/oaknational/ai-beta/commit/7a9a47358c229cefc4496be708f7d250816f7312))
- dialog works ([5cc5537](https://github.com/oaknational/ai-beta/commit/5cc55373c281e0b181897facef860d211fd4f1ef))
- differentiate between LLM refusal and errors, don't throw on fail ([861d9c4](https://github.com/oaknational/ai-beta/commit/861d9c46ed4c730f418866cfc38bcc23b816766b))
- disable distractor editing mode when the field is blurred ([3f33c89](https://github.com/oaknational/ai-beta/commit/3f33c894ec0ad70741fa431cd4dab3bd37c422ed))
- disable starting quiz when in a non-recoverable error state ([4016247](https://github.com/oaknational/ai-beta/commit/401624786202fd1ef903501f1343f12cb7c55eaf))
- doc export ([07370fb](https://github.com/oaknational/ai-beta/commit/07370fbdb83aa7a714d2b73b38e13503b75ec8e6))
- don't refetch subject/ks/generations on window focus ([a18ec35](https://github.com/oaknational/ai-beta/commit/a18ec35aa118af43fe19096a4d71f732cd437e2f))
- download worksheet ([8ac0470](https://github.com/oaknational/ai-beta/commit/8ac0470d7b37223287724658ab18157596e0ee4a))
- downloads work for variable amount of lesson cycles ([369b9ff](https://github.com/oaknational/ai-beta/commit/369b9ff5393ae29adc27e81cd302527ac67d2b36))
- enable ad-hoc completions by calling generateWithTemplate method ([957c160](https://github.com/oaknational/ai-beta/commit/957c1605252d7e549235cf8e0743119f33ea4af4))
- enable streaming in lesson planner ([26f9637](https://github.com/oaknational/ai-beta/commit/26f963766d7bd05b3137253f416fd4ff5bec3403))
- enable streaming in requestGeneration ([89c3682](https://github.com/oaknational/ai-beta/commit/89c36825c059e7fa89f342281f2b355bd53e17ce))
- ensure dev logs are properly formatted via turbo ([12ecb5b](https://github.com/oaknational/ai-beta/commit/12ecb5bb3e6498ea8782a3768a4ed9bb3363cd30))
- ensure failed generations are marked as such after inngest retries ([e6ae23f](https://github.com/oaknational/ai-beta/commit/e6ae23fec4f7f03cd2b0074a24ff13c4d6d87e29))
- ensure share page pulls data from db ([810a39e](https://github.com/oaknational/ai-beta/commit/810a39e95839f4af60c980e3b7c3916f020328e2))
- ensure trackEvent events are always caught internally ([9f4da89](https://github.com/oaknational/ai-beta/commit/9f4da8919d31733941e94afce33cb6d2e9086bdd))
- explicitly opt out of caching nextjs auth middleware ([ac319a2](https://github.com/oaknational/ai-beta/commit/ac319a2267ec83a454e2f3f6915de0d0a030720a))
- **exports:** feature parity ([e065eb4](https://github.com/oaknational/ai-beta/commit/e065eb44fe75e83c6a11d968c8e5d20ef4913e71))
- expose signed downloads ([c51dd62](https://github.com/oaknational/ai-beta/commit/c51dd6256b11f470d3b36d0ffa083f35d7e5ca53))
- extract prompt invocation logic to Prompt model ([37a6a37](https://github.com/oaknational/ai-beta/commit/37a6a37a7e56c6ac2782c33dfbd86b7ccfc25aaf))
- force user to focus on the keystage picker ([9f663ff](https://github.com/oaknational/ai-beta/commit/9f663ffc5a2c71a7e95df8d1e4b4f05d794465fc))
- force user to pick keystage + subject before ([a4ca3cb](https://github.com/oaknational/ai-beta/commit/a4ca3cb42731244ac529a142430f85c6748e8744))
- further design implementation ([85260a2](https://github.com/oaknational/ai-beta/commit/85260a2781eedc0a4a661bf2a4bcb898e453a1d1))
- generation status migrations ([5a11a8f](https://github.com/oaknational/ai-beta/commit/5a11a8f8cee39a02c77e1d300e58b13662e1aadc))
- generations + prompts page working ([dd73c4a](https://github.com/oaknational/ai-beta/commit/dd73c4aeb7f1beb5c6bee04f8db3f5aef9fde15d))
- handle new generation states in hooks ([72c4497](https://github.com/oaknational/ai-beta/commit/72c449785edcac07c144443995ce783ee81168ee))
- hide some upstream error details from end users ([7987983](https://github.com/oaknational/ai-beta/commit/798798354e115f5f8863a032a5ce0c04b759c25f))
- hook and new share buttons in all places ([0c41ee6](https://github.com/oaknational/ai-beta/commit/0c41ee67183936373e7485dd38c0c7de417db9d3))
- identify posthog users by clerk userId ([333cb46](https://github.com/oaknational/ai-beta/commit/333cb461fce3b18211288bc262207823bb68f70a))
- identify users in the backend ([6a1ea63](https://github.com/oaknational/ai-beta/commit/6a1ea63759c18486670ee5c780703b738fcaefdd))
- implement rate-limiting middleware with redis ([aeee90a](https://github.com/oaknational/ai-beta/commit/aeee90aafde8df1abd5219a7038a6315c34cd5b2))
- improve openapi schema for better gpt import ([cb52620](https://github.com/oaknational/ai-beta/commit/cb52620bf74e741991b5acb67ba2399b371ef185))
- infer generation part types from zod schemas ([8754fd9](https://github.com/oaknational/ai-beta/commit/8754fd914cb620478c432db4a9e4a5132c24aeca))
- infer generation ratelimit from env, or 20/24h by default ([2a6eafa](https://github.com/oaknational/ai-beta/commit/2a6eafa3d3c49663e25ff0bf975b2f857b46f01d))
- infer ingest environment from deploy context ([789e014](https://github.com/oaknational/ai-beta/commit/789e0146eb429fa359d3533db357702ecda9482f))
- inital work towards suggested lessons in QD ([4cfc13a](https://github.com/oaknational/ai-beta/commit/4cfc13af7c248d18c0abad6de5ed6b4566622fe2))
- inital work towards suggested lessons in QD ([fc25b3e](https://github.com/oaknational/ai-beta/commit/fc25b3e39dda6999578ff2c7a6b9aeb806312a9a))
- integrate browser logger, improve console logging ([cba84a8](https://github.com/oaknational/ai-beta/commit/cba84a83becef221b74285e4644de096e3537706))
- integrate logger in requestGeneration, trpc error handler ([6414615](https://github.com/oaknational/ai-beta/commit/6414615122ebc4eee22b9ffd946ddc988111745e))
- integrate new timings endpoint with quiz designer components ([ffc1903](https://github.com/oaknational/ai-beta/commit/ffc1903db70bc9978942076e9c53ca3795832bd9))
- integrate trpc-openai ([65f3991](https://github.com/oaknational/ai-beta/commit/65f39914b9b86a63217efb349a365e3188b240b1))
- introduce GenerationPartPlaceholder variant for partial data ([4715eb0](https://github.com/oaknational/ai-beta/commit/4715eb03f6358477a806f0327b02b47ab2353e86))
- judgment front to back ([2ce2477](https://github.com/oaknational/ai-beta/commit/2ce24776beb6d176b93d7d71669131ff78a860eb))
- layout review with blue bg ([b7011bb](https://github.com/oaknational/ai-beta/commit/b7011bbb3dae2af0ab171d8c8a1c2c8ef198e0ee))
- layout updates and mobile ([ac7aec9](https://github.com/oaknational/ai-beta/commit/ac7aec91a8dc72d6957399cafd76f8074e128553))
- log all tRPC errors ([e9dea93](https://github.com/oaknational/ai-beta/commit/e9dea932764758e2dcc460ebfa35e41712743cfe))
- log each step in requestGeneration ([8542b5d](https://github.com/oaknational/ai-beta/commit/8542b5de5897f6f84409263cb23317726b6bfeb6))
- make bugsnag usage broadly consistent with OWA ([c70b89e](https://github.com/oaknational/ai-beta/commit/c70b89e46a6602f73e21610bce94288ec8e15b6e))
- make component reusable in control by versions ([54d926c](https://github.com/oaknational/ai-beta/commit/54d926cba8e1e0e9903479c0afbfd16e3695a3b4))
- make component reusable in control by versions ([5d7ba42](https://github.com/oaknational/ai-beta/commit/5d7ba42bbf25225d3cf444948b44a7801dc3e4fc))
- make edge runtime compatible version of logger ([24f934d](https://github.com/oaknational/ai-beta/commit/24f934de8d21d7a5a340956e2d1c1ee5de848c30))
- make feedback start working ([91d677f](https://github.com/oaknational/ai-beta/commit/91d677f6888e5ff753ef9e64b21facb7035d0d83))
- merged ([bed6e34](https://github.com/oaknational/ai-beta/commit/bed6e34e144dc5f39c11a9b4a51da9202ffcfde9))
- merged and chatbot works ([cdb756b](https://github.com/oaknational/ai-beta/commit/cdb756bd072933a1d1dc6e9f98ef467f06991d65))
- mobile layout ([111625f](https://github.com/oaknational/ai-beta/commit/111625fdec2848f0168d159304d26f667f7dabff))
- move exports into own package ([04d5eed](https://github.com/oaknational/ai-beta/commit/04d5eed10501da56c50f93791b8ae8e9900dd065))
- move to v0 and put swagger ui back ([3a5fefc](https://github.com/oaknational/ai-beta/commit/3a5fefc5dfbe161c4691a82d37736f7657b1fded))
- obscure internal server error stacktrackes from tRPC client ([c0c95b7](https://github.com/oaknational/ai-beta/commit/c0c95b7649f13ac8056cb0f65e80c7c6abba6c28))
- only allow users to find their own generations ([37708ed](https://github.com/oaknational/ai-beta/commit/37708ed900a98b65dcf33bed54f6644d6ae8cd07))
- only stream generations when requested to ([9408eda](https://github.com/oaknational/ai-beta/commit/9408edacc4bc1f3453299afb58ab8ed54b0a06e8))
- parse generation.requested event schemas with zod ([e956b3a](https://github.com/oaknational/ai-beta/commit/e956b3ae038cb356cf94a07baeb47bd30f15a517))
- pass all rate limiting info to notification component ([883a50a](https://github.com/oaknational/ai-beta/commit/883a50a95bf7b8612a43aa6543f5ea539ee82da7))
- pass around app & prompt ids instead of slugs past the API layer ([6645b7c](https://github.com/oaknational/ai-beta/commit/6645b7cb4d10403db0c31a9efe3c0fb800ed04f0))
- pass env param to inngest to differentiate branch deploys ([6022161](https://github.com/oaknational/ai-beta/commit/6022161804ea63c5d6f6b6049213bd7367183b97))
- pass flag with all tRPC requests to tell if a request is limited ([41abf44](https://github.com/oaknational/ai-beta/commit/41abf44ca5f5190f8cd0c114598ce38b9f01f9bd))
- pass sessionId to each place a generation is requested ([4ffe5b6](https://github.com/oaknational/ai-beta/commit/4ffe5b62dcd99283a0d926ae78a55c657c9ba8cc))
- patch inngest client to allow creation of child loggers ([b4a9a50](https://github.com/oaknational/ai-beta/commit/b4a9a50ba9574292f0b2b26fd09d366d054d0a13))
- poll for onboarding updates every 300ms instead of 3s ([cac0d34](https://github.com/oaknational/ai-beta/commit/cac0d34c62619816db1e746cf3f390d336a95a0a))
- put url in asset api, also fix lesson assets ([b5b1991](https://github.com/oaknational/ai-beta/commit/b5b19911f05a6ce7871d4fb1d5a1bb997bf93ef8))
- quiz designer scrolls on start ([6592db3](https://github.com/oaknational/ai-beta/commit/6592db3d27ae8776a56249645679ec16b2f40ed0))
- quiz passing back through local ([2c5c817](https://github.com/oaknational/ai-beta/commit/2c5c817585027d91bcf2f399fb199b6615af137c))
- re-bump next to v14 ([f1f0ff7](https://github.com/oaknational/ai-beta/commit/f1f0ff7436ba7058fc22cd727912c99cebf17090))
- read prompt templates from the db ([665e602](https://github.com/oaknational/ai-beta/commit/665e6028ef63646dfbf7ea3bed79fe50afe985f8))
- redirect from netlify to cloudflare protected subdomain ([f1abf0a](https://github.com/oaknational/ai-beta/commit/f1abf0af806cceb9da5b007b7c2e45d26883ca3b))
- relayout answers and distractors ([2ee0ca1](https://github.com/oaknational/ai-beta/commit/2ee0ca1268f47b11201906b7e64edb65629813c0))
- remove icons ([ae2c44e](https://github.com/oaknational/ai-beta/commit/ae2c44e461726a753f9d1701cb29a72dfe6fcc02))
- render prompts from the db on prompts page ([4d5c26c](https://github.com/oaknational/ai-beta/commit/4d5c26cdce6bce07c32fb27012bf13e0e4272cd1))
- repeatedly poll redis-backed tRPC endpoint for generation updates ([7179eb8](https://github.com/oaknational/ai-beta/commit/7179eb898ca3dd0e0227aa7ea101a2c1a3dfb491))
- return an error from useGeneration if we've been polling >1m30s ([317bd34](https://github.com/oaknational/ai-beta/commit/317bd346c95d8f06bd1f7c3da16ae5aeaecd4bd3))
- return ratelimit info from useGeneration, reorder loading states ([9e34b4b](https://github.com/oaknational/ai-beta/commit/9e34b4b5182040485f095381f8b9bcef44e69db2))
- save feedback_value when a generation is flagged by a user ([f5a382c](https://github.com/oaknational/ai-beta/commit/f5a382cdebcc51f3c92840375f63375178b46fc4))
- save formatted prompts as soon as possible ([656c5d5](https://github.com/oaknational/ai-beta/commit/656c5d51ddea389d22f7b72800299f4ea3c68318))
- save llm completion dimings ([5258652](https://github.com/oaknational/ai-beta/commit/52586526767f5aee7321e98f6c725fcfebd3c47c))
- schema and migrations ([3874ddc](https://github.com/oaknational/ai-beta/commit/3874ddc709ba437443d218d36f462426e8ca96f1))
- script deletes slides based on cycles produced ([fcd68f9](https://github.com/oaknational/ai-beta/commit/fcd68f9942f504fa98aab332ae9071040d865cb7))
- scripts to import transcripts from lessons ([4e81bfb](https://github.com/oaknational/ai-beta/commit/4e81bfb113821a241dc5f1b1a0675a3f34e0537f))
- scroll button ([e69d43d](https://github.com/oaknational/ai-beta/commit/e69d43d66bbc7576705440ac888d3572b3f0e50f))
- scroll to start and hide time ([d9b0b4c](https://github.com/oaknational/ai-beta/commit/d9b0b4c6031d43b13a2f3b1e7a9dbe43e8e871de))
- security policy ([bba1a77](https://github.com/oaknational/ai-beta/commit/bba1a778f9c663725178ee69644d023474e53ba8))
- send events from frontend when a user tweaks an item ([3f4758f](https://github.com/oaknational/ai-beta/commit/3f4758f6db66371620592245fa963b310c5789cc))
- send privacy acceptance to onboarding endpoint ([c3e6122](https://github.com/oaknational/ai-beta/commit/c3e61228901e76d17712a6f6ceac8f24a9dede4a))
- send tracking events for manual answer/distractor tweaks ([2eb3531](https://github.com/oaknational/ai-beta/commit/2eb353122bef5e8af7bbc7d7d6759fff1fd8ae96))
- share works into gdocs ([2fb201c](https://github.com/oaknational/ai-beta/commit/2fb201ccd044ce3f69a795010bb8f0ea2f1bbf6a))
- show a more specific error message when a user is rate limited ([d191863](https://github.com/oaknational/ai-beta/commit/d191863e172b094a65047a8465dcff9e326a1221))
- show error message in quiz designer hero ([586c30e](https://github.com/oaknational/ai-beta/commit/586c30e53b38ba52a96ad7a2bbd537a0f127d663))
- show rate limit bypass message based on flag not email ([57877c5](https://github.com/oaknational/ai-beta/commit/57877c5a2564875226ce2c181341c29a9faf4ee1))
- show status of both jobs and db together ([7655467](https://github.com/oaknational/ai-beta/commit/76554677de43a7dcc9a47333aad1a7fd34fa5e6b))
- spike integrating useGenerationCallbacks with demo reducer app ([1745e3c](https://github.com/oaknational/ai-beta/commit/1745e3c880e0dd07e8b8709f94676f3b192cb5e6))
- spike using useReducer to mange quiz app state ([c36c318](https://github.com/oaknational/ai-beta/commit/c36c31827760e2f0205e4e285a9862e6ce5a3017))
- store generation promptInputs ([059eff9](https://github.com/oaknational/ai-beta/commit/059eff98e34fb69e4c242788b4a1e4b8f00dc12c))
- style the dialog and fix ui on mobile ([4af2fc8](https://github.com/oaknational/ai-beta/commit/4af2fc8ba31568ea4aff0a92ebee706c460925db))
- temporary fix for feature flags ([cdb8c86](https://github.com/oaknational/ai-beta/commit/cdb8c863ce54229335942e802bc6993931f98d34))
- **tootips:** updated descriptions ([14476df](https://github.com/oaknational/ai-beta/commit/14476df4607c4f31c6ebda94741a713af19c0d3b))
- track appSession on feedback types ([699093a](https://github.com/oaknational/ai-beta/commit/699093aaa12286f5b80ebccef62e4eb408cf985b))
- track token usage per generation ([67b993c](https://github.com/oaknational/ai-beta/commit/67b993cee79895495e3c80c34496af817b165a6d))
- transition through new generation states in inngest job ([66b5c7b](https://github.com/oaknational/ai-beta/commit/66b5c7b55b996606139b09e2ab56dbe4a537f762))
- type-fixes ([b01da09](https://github.com/oaknational/ai-beta/commit/b01da0966452d5b18c72cf68dbae65ff9fa2b2ff))
- un-protect homepage ([4a5b142](https://github.com/oaknational/ai-beta/commit/4a5b1426dbd6063f037740d5cc38e1b064026fc0))
- update clerk, use new authMiddleware ([d1e28b9](https://github.com/oaknational/ai-beta/commit/d1e28b9810241c6d0efd57aa929965a7c9802e9e))
- update data base field ([6d92da1](https://github.com/oaknational/ai-beta/commit/6d92da1f40161a4f4e6576b6403af0e77638cb14))
- update the text on the lesson planner page ([16a09d5](https://github.com/oaknational/ai-beta/commit/16a09d599d48450559ad52d291c10b89d699c52a))
- update timings endpoint to use statistics table ([a4b556a](https://github.com/oaknational/ai-beta/commit/a4b556a2fcfe8b7bb972e3e248170921b5a15b62))
- updates button sizing ([e9c6fd2](https://github.com/oaknational/ai-beta/commit/e9c6fd2942a7445992a8c5ee074ee0cb054b5045))
- user can add suggested question to quiz ([57b5570](https://github.com/oaknational/ai-beta/commit/57b5570bf75b3126f9915f99c39be893fa482ed7))
- video support ([d819d68](https://github.com/oaknational/ai-beta/commit/d819d68faa4f659bb22afe171033c12c660d81d4))
- whats new dialog, currently blank ([9c36f95](https://github.com/oaknational/ai-beta/commit/9c36f952d8fb202b1b3ef28a15004f66b333d1a3))
- work on refactor, add units, support slugs ([2ba7107](https://github.com/oaknational/ai-beta/commit/2ba7107f56122e5dcf0f96192a8d548911306054))
- working scripts ([f89b9be](https://github.com/oaknational/ai-beta/commit/f89b9be70ac07920df2ac6e6a982a57ebaf10979))
- working slides + docs export ([bad5745](https://github.com/oaknational/ai-beta/commit/bad57451298b8c63a53c8b47bba0ed03eb46a71a))
