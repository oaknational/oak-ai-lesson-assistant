# [1.46.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.45.0...v1.46.0) (2025-07-17)


### Features

* launch teaching materials -  AI-857 AI-1340 ([#729](https://github.com/oaknational/oak-ai-lesson-assistant/issues/729)) ([70b8fd1](https://github.com/oaknational/oak-ai-lesson-assistant/commit/70b8fd1c60c0a210a7de27092c5ef22d4fa34604))
* remove legacy experimental quiz sections ([#744](https://github.com/oaknational/oak-ai-lesson-assistant/issues/744)) ([704612f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/704612f9ed5ee5ffc7034a6ba8a04291196934b0))

# [1.45.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.44.0...v1.45.0) (2025-07-16)


### Bug Fixes

* fix broken parsing of nested patch keys [AI-1099] ([#747](https://github.com/oaknational/oak-ai-lesson-assistant/issues/747)) ([bb3e899](https://github.com/oaknational/oak-ai-lesson-assistant/commit/bb3e89987df6b78678cc8065666d9490f2459a34))


### Features

* [AI-1367] migrate internal quiz generation to V2 format ([#735](https://github.com/oaknational/oak-ai-lesson-assistant/issues/735)) ([1f2fc8e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1f2fc8e2a199e2d6a3366398e426a7848a65526d))

# [1.44.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.43.0...v1.44.0) (2025-07-14)


### Bug Fixes

* preserve keyword definition casing [AI-1322] ([#725](https://github.com/oaknational/oak-ai-lesson-assistant/issues/725)) ([08c18d0](https://github.com/oaknational/oak-ai-lesson-assistant/commit/08c18d0a4b4dc9b206a736c026b8cfa98bb39536))


### Features

* [AI-1374] implement quiz v2 multiple choice components ([#733](https://github.com/oaknational/oak-ai-lesson-assistant/issues/733)) ([60bae59](https://github.com/oaknational/oak-ai-lesson-assistant/commit/60bae59d9ab729ec9ac049ce46b345c65f7a4013))
* send messages to user via the 'messaging' agent [AI-1211] ([#722](https://github.com/oaknational/oak-ai-lesson-assistant/issues/722)) ([3cbf7a0](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3cbf7a0549eb1c86bdcbce5dcd3917e2b7b44074))

# [1.43.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.42.0...v1.43.0) (2025-06-26)


### Bug Fixes

* configure MathJax $$ delimiters as inline math ([#726](https://github.com/oaknational/oak-ai-lesson-assistant/issues/726)) ([bbba493](https://github.com/oaknational/oak-ai-lesson-assistant/commit/bbba493847300c6eae93db5308779280baa2799c))


### Features

* improve search params prompt wording AI-1313 ([#721](https://github.com/oaknational/oak-ai-lesson-assistant/issues/721)) ([1011a11](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1011a117962b69c7c2284a1ab8b89662d8c2caa6))
* introduce quiz schema versioning with V1/V2 split ([#727](https://github.com/oaknational/oak-ai-lesson-assistant/issues/727)) ([6fbe075](https://github.com/oaknational/oak-ai-lesson-assistant/commit/6fbe075ebfb34c57e8be1f22d4a4c87be4812204))

# [1.42.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.41.0...v1.42.0) (2025-06-19)


### Bug Fixes

* moderation retry ([#715](https://github.com/oaknational/oak-ai-lesson-assistant/issues/715)) ([718fd4c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/718fd4ce37d755d7743f7ab5d6afbbf0f24a1aca))


### Features

* add form validation ([#703](https://github.com/oaknational/oak-ai-lesson-assistant/issues/703)) ([cbd944b](https://github.com/oaknational/oak-ai-lesson-assistant/commit/cbd944b24f23e0fde6d102df1592bd1bac727c69))
* teaching materials avo AI-1285 AI-1286 ([#713](https://github.com/oaknational/oak-ai-lesson-assistant/issues/713)) ([0775fb2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/0775fb24e9bb7dca8a9dd28d57e0522659ee5062))
* teaching materials dialog modals and slack notifications - AI-1255 ([#694](https://github.com/oaknational/oak-ai-lesson-assistant/issues/694)) ([15864e4](https://github.com/oaknational/oak-ai-lesson-assistant/commit/15864e45ac2f7695db8a65f212571a169a147587))

# [1.41.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.40.1...v1.41.0) (2025-06-12)


### Bug Fixes

* continue button case inconsistency and regenerate action bugs (AI-1261) ([#704](https://github.com/oaknational/oak-ai-lesson-assistant/issues/704)) ([f9a843f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/f9a843ff5cff70d150696799c0e9c2a5f005f9ca))
* remove helicone threat detection from moderation calls ([#683](https://github.com/oaknational/oak-ai-lesson-assistant/issues/683)) ([fa37fb9](https://github.com/oaknational/oak-ai-lesson-assistant/commit/fa37fb984cbba22d91f11553a4115623a1f971d1))


### Features

* improvements to glossary prompt and download file names AI-1264 ([#705](https://github.com/oaknational/oak-ai-lesson-assistant/issues/705)) ([edde171](https://github.com/oaknational/oak-ai-lesson-assistant/commit/edde171939cbf02dff5109abf6fb2b7188dfc786))
* starter and exit quiz in slides ([#643](https://github.com/oaknational/oak-ai-lesson-assistant/issues/643)) ([b6a45fc](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b6a45fc11b1f859db861b1ec6ad476501c4bf1a1))
* title, subject, key-stage, topic agents, and error handling [AI-1217] ([#684](https://github.com/oaknational/oak-ai-lesson-assistant/issues/684)) ([e802922](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e802922e346eb1716092075c5f6638c8cc7c8be5))
* use fixed window rate limiting for demo users ([#699](https://github.com/oaknational/oak-ai-lesson-assistant/issues/699)) ([7c6cbc2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/7c6cbc2ffd83ed526ef36fad3770366577a18e4f))


### Performance Improvements

* add Sentry Tracing for Performance Monitoring ([#708](https://github.com/oaknational/oak-ai-lesson-assistant/issues/708)) ([d007aac](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d007aac3af01722b50224620851019270d89f465))

## [1.40.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.40.0...v1.40.1) (2025-06-05)


### Bug Fixes

* force dynamic rendering for cron job routes ([#700](https://github.com/oaknational/oak-ai-lesson-assistant/issues/700)) ([79e280c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/79e280ca04b4b0d8552734340baf52d07b6a99c1))

# [1.40.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.39.0...v1.40.0) (2025-06-05)


### Bug Fixes

* add admin user button to slack alert when user banned ([#691](https://github.com/oaknational/oak-ai-lesson-assistant/issues/691)) ([d4ab295](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d4ab29534dc3555329ceb42196dd9251cd14c820))


### Features

* add scheduled clerk user cleanup cron job - AI-1245 ([#693](https://github.com/oaknational/oak-ai-lesson-assistant/issues/693)) ([cc8b7d9](https://github.com/oaknational/oak-ai-lesson-assistant/commit/cc8b7d90fc9a25983164339fa6bceddce7496d3a))
* agentic maths quiz [AI-1189] [AI-1152] ([#677](https://github.com/oaknational/oak-ai-lesson-assistant/issues/677)) ([3b7725c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3b7725ced2453c96f1d40701801e4b85915075b4))
* am mobile implementation ([#696](https://github.com/oaknational/oak-ai-lesson-assistant/issues/696)) ([c87981f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c87981f7ac730e4e36e81148630b56d456abe16a))
* change the steps ([#685](https://github.com/oaknational/oak-ai-lesson-assistant/issues/685)) ([e48d5f7](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e48d5f768908181430953b64ac78eea9ad4b6024))
* update modify hover states copy - AI-1246 ([#692](https://github.com/oaknational/oak-ai-lesson-assistant/issues/692)) ([a3e3424](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a3e342457d4b3edd5dea8079f305f1b4d9ef15f3))

# [1.39.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.38.0...v1.39.0) (2025-05-29)


### Bug Fixes

* lakera payload only to send message text [AI-1062] ([#679](https://github.com/oaknational/oak-ai-lesson-assistant/issues/679)) ([0dc574c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/0dc574c22ad614a234c7340c67b3fece7d305eb9))


### Features

* am safety violation - AI-1107 [MIGRATION] ([#676](https://github.com/oaknational/oak-ai-lesson-assistant/issues/676)) ([3deb0e1](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3deb0e186fddc63fbb2d1c19256cbf434b243d2a))
* download am ([#678](https://github.com/oaknational/oak-ai-lesson-assistant/issues/678)) ([70145f3](https://github.com/oaknational/oak-ai-lesson-assistant/commit/70145f324e81d4bd7bf12151161c40350cf01e94))

# [1.38.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.37.0...v1.38.0) (2025-05-22)


### Features

* admin user safety violations [AI-1113] ([#662](https://github.com/oaknational/oak-ai-lesson-assistant/issues/662)) ([ba4bee5](https://github.com/oaknational/oak-ai-lesson-assistant/commit/ba4bee5ebb07dcf872f06ce58cbf40d8e32d561d))
* am add exit quiz ([#673](https://github.com/oaknational/oak-ai-lesson-assistant/issues/673)) ([09ff4bc](https://github.com/oaknational/oak-ai-lesson-assistant/commit/09ff4bc95c25a8c6f77d82985114af749555a383))
* connect additional materials moderation and threat to modals and zustand ([#668](https://github.com/oaknational/oak-ai-lesson-assistant/issues/668)) ([1b3869a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1b3869a682cb9dd1f43d613d5bba27fb23c2b685))
* quasi agentic first iteration [AI-1109] ([#671](https://github.com/oaknational/oak-ai-lesson-assistant/issues/671)) ([b44a02d](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b44a02dc6e80d06163180c68726727df9728d8b5))

# [1.37.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.36.0...v1.37.0) (2025-05-20)


### Bug Fixes

* lakera persistence issue ([#656](https://github.com/oaknational/oak-ai-lesson-assistant/issues/656)) ([2bcd20a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/2bcd20aa1858579caf6b5b76282d891eeb5ffe4d))


### Features

* add components for all quiz types ([#652](https://github.com/oaknational/oak-ai-lesson-assistant/issues/652)) ([26fd496](https://github.com/oaknational/oak-ai-lesson-assistant/commit/26fd496fa7c08f40b9716a87f198be07015138ac))
* additional materials - connect frontend to exports - AI-1082 ([#667](https://github.com/oaknational/oak-ai-lesson-assistant/issues/667)) ([9d1f6eb](https://github.com/oaknational/oak-ai-lesson-assistant/commit/9d1f6eb437f86ca861cfb7e9a090e5dc839c34cf))
* additional resources - threat detection and moderation - AI-1061 AI-1013 AI-860 [MIGRATION] ([#657](https://github.com/oaknational/oak-ai-lesson-assistant/issues/657)) ([63b9763](https://github.com/oaknational/oak-ai-lesson-assistant/commit/63b97632c3e3f0aca01f9576fdee89f98789573b))
* styling to match designs ([#665](https://github.com/oaknational/oak-ai-lesson-assistant/issues/665)) ([86b5197](https://github.com/oaknational/oak-ai-lesson-assistant/commit/86b519711b863c24dc0746275a4c5dfd7574d6ad))

# [1.36.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.35.0...v1.36.0) (2025-05-08)


### Bug Fixes

* clean up typos and linting issues in codebase ([#631](https://github.com/oaknational/oak-ai-lesson-assistant/issues/631)) ([3e82e69](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3e82e6938495b739569a496c297b48734d1678b4))
* prisma schema drift [AI-1111] ([#663](https://github.com/oaknational/oak-ai-lesson-assistant/issues/663)) ([778fd41](https://github.com/oaknational/oak-ai-lesson-assistant/commit/778fd4195fa6019486dd98f59c709500540341da))


### Features

* add the hubspot contact record id to posthog ([#650](https://github.com/oaknational/oak-ai-lesson-assistant/issues/650)) ([5fe9373](https://github.com/oaknational/oak-ai-lesson-assistant/commit/5fe93737c5b5b6ac8d51f2c7d94a86fd7791d224))
* additional material exports - AI-916 ([#654](https://github.com/oaknational/oak-ai-lesson-assistant/issues/654)) ([0a2558e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/0a2558e50890f5e97e24ad512ff5780efdbbe8bb))
* am styling ([#655](https://github.com/oaknational/oak-ai-lesson-assistant/issues/655)) ([78b87bf](https://github.com/oaknational/oak-ai-lesson-assistant/commit/78b87bf5bfb7f33bc2f374af9e1e7c84fd38ff81))
* prettier editor config for vscode ([#609](https://github.com/oaknational/oak-ai-lesson-assistant/issues/609)) ([60bb769](https://github.com/oaknational/oak-ai-lesson-assistant/commit/60bb769708f05be2c82e862b9446e7637b936442))

# [1.35.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.34.0...v1.35.0) (2025-04-30)


### Features

* banner implementaion ([#647](https://github.com/oaknational/oak-ai-lesson-assistant/issues/647)) ([441c311](https://github.com/oaknational/oak-ai-lesson-assistant/commit/441c311a5586e1f75414830e1eea3b636e566f9b))

# [1.34.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.33.0...v1.34.0) (2025-04-23)


### Bug Fixes

* don't throw on slack notification failure ([#621](https://github.com/oaknational/oak-ai-lesson-assistant/issues/621)) ([663989b](https://github.com/oaknational/oak-ai-lesson-assistant/commit/663989b734ec6ea498b920b55081096db50f029c))


### Features

* additional resource from partial aila lesson ([#644](https://github.com/oaknational/oak-ai-lesson-assistant/issues/644)) ([e7c1796](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e7c179602c1d23a82e4c6a897caf82e05bfff27f))

# [1.33.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.32.0...v1.33.0) (2025-04-10)


### Features

* maths tex notation ([#577](https://github.com/oaknational/oak-ai-lesson-assistant/issues/577)) ([2b373e4](https://github.com/oaknational/oak-ai-lesson-assistant/commit/2b373e4bb4ee148a91d1bbd472e5d31c248629ed))

# [1.32.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.31.0...v1.32.0) (2025-04-03)


### Features

* additional material package ([#597](https://github.com/oaknational/oak-ai-lesson-assistant/issues/597)) ([765b050](https://github.com/oaknational/oak-ai-lesson-assistant/commit/765b0500fbd6e672eab0f540789bfe1c2387c3e4))

# [1.31.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.30.0...v1.31.0) (2025-04-02)


### Bug Fixes

* add lesson plan tracking store ([#619](https://github.com/oaknational/oak-ai-lesson-assistant/issues/619)) ([9cea080](https://github.com/oaknational/oak-ai-lesson-assistant/commit/9cea08000dab60c19cde0c39204d0a41ab54b025))


### Features

* .cursorrules and CLAUDE.md ([#593](https://github.com/oaknational/oak-ai-lesson-assistant/issues/593)) ([e6b1cbc](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e6b1cbcd530daf061c10026a646861b041c32d17))

# [1.30.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.29.0...v1.30.0) (2025-03-17)


### Features

* use cspell to enforce spell-checking ([#610](https://github.com/oaknational/oak-ai-lesson-assistant/issues/610)) ([db7c6c8](https://github.com/oaknational/oak-ai-lesson-assistant/commit/db7c6c8c9c49bc84e12173b32f63c98c0a054db4))


### Reverts

* revert prompt schema alignment ([#617](https://github.com/oaknational/oak-ai-lesson-assistant/issues/617)) ([d31eb0f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d31eb0fa7c25b9dac587b72962511ae32040a6a4))

# [1.29.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.28.0...v1.29.0) (2025-03-12)


### Features

* add user metadata-based rate limiting ([#603](https://github.com/oaknational/oak-ai-lesson-assistant/issues/603)) ([c179ff6](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c179ff6eb71003bc996d879c1ec3492959a11532))

# [1.28.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.27.0...v1.28.0) (2025-03-12)


### Bug Fixes

* render short user messages ([#581](https://github.com/oaknational/oak-ai-lesson-assistant/issues/581)) ([8d3eee6](https://github.com/oaknational/oak-ai-lesson-assistant/commit/8d3eee6056d30199425c80389928f380ff7258d9))
* use llmMessage JSON schema in prompt ([#579](https://github.com/oaknational/oak-ai-lesson-assistant/issues/579)) ([b8f93a7](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b8f93a74c32e96bfa81e7315f2660989101a8441))
* use type key rather than response for llmMesage ([#578](https://github.com/oaknational/oak-ai-lesson-assistant/issues/578)) ([1cce025](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1cce0251ef9db271c66168ad515d655a301610f5))


### Features

* allow lifted rate limits for certain users ([#586](https://github.com/oaknational/oak-ai-lesson-assistant/issues/586)) ([d0c49c6](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d0c49c65d11c71d59c6bf49accc95d3a94dd0fbb))
* prettier enforce import order ([#608](https://github.com/oaknational/oak-ai-lesson-assistant/issues/608)) ([c53bb75](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c53bb7519a8216cc2f99484279b88d1ef6010536))
* record THREAT in the database rather than HELICONE ([#584](https://github.com/oaknational/oak-ai-lesson-assistant/issues/584)) ([16ffcf0](https://github.com/oaknational/oak-ai-lesson-assistant/commit/16ffcf0e3c837ee22a3caa4b98e0df6f842e12ba))

# [1.27.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.26.0...v1.27.0) (2025-03-06)


### Bug Fixes

* initial state being called twice ([#574](https://github.com/oaknational/oak-ai-lesson-assistant/issues/574)) ([f61bc92](https://github.com/oaknational/oak-ai-lesson-assistant/commit/f61bc92e9c11c7ead4a014d4a217895bab3d5684))


### Features

* continue migrating Aila package to support variable documents ([#575](https://github.com/oaknational/oak-ai-lesson-assistant/issues/575)) ([0c25081](https://github.com/oaknational/oak-ai-lesson-assistant/commit/0c25081addc806e24e36df4c5356dba41ee7bb80))

# [1.26.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.25.6...v1.26.0) (2025-03-04)


### Features

* do not trust front end message history ([#570](https://github.com/oaknational/oak-ai-lesson-assistant/issues/570)) ([d504476](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d50447640ea925ef6e0a8a78fbd5adbb9b05f470))
* further migration steps towards AilaDocument ([#571](https://github.com/oaknational/oak-ai-lesson-assistant/issues/571)) ([4764d0e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/4764d0ef7df9b69c64354a73ed1b4f19aee35677))
* only trust the lesson plan from the server side ([#569](https://github.com/oaknational/oak-ai-lesson-assistant/issues/569)) ([26f4f4d](https://github.com/oaknational/oak-ai-lesson-assistant/commit/26f4f4dfcd1a0d7dfe8868c0e298a8aeeda1add6))
* start migrating to have an AilaDocument ([#566](https://github.com/oaknational/oak-ai-lesson-assistant/issues/566)) ([16513da](https://github.com/oaknational/oak-ai-lesson-assistant/commit/16513daf41ecf2fb31f3eada67fb09df4811e626))

## [1.25.6](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.25.5...v1.25.6) (2025-02-26)


### Bug Fixes

* bullet styling for portable text ([#567](https://github.com/oaknational/oak-ai-lesson-assistant/issues/567)) ([73e9446](https://github.com/oaknational/oak-ai-lesson-assistant/commit/73e94467a2f93b7e96a44a4fbc0141bbe969a552))
* next router skipping signed-in check ([#146](https://github.com/oaknational/oak-ai-lesson-assistant/issues/146)) ([c1b9939](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c1b9939563dc20e3ffaf0a56d73d015a11047149))

## [1.25.5](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.25.4...v1.25.5) (2025-02-24)


### Bug Fixes

* getChat overfetching - move initialMessages to store ([#550](https://github.com/oaknational/oak-ai-lesson-assistant/issues/550)) ([0ea1694](https://github.com/oaknational/oak-ai-lesson-assistant/commit/0ea169487451e97ab5975c7db3bb7fb511c223a8))

## [1.25.4](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.25.3...v1.25.4) (2025-02-20)


### Bug Fixes

* maths lesson plan overrides ([#557](https://github.com/oaknational/oak-ai-lesson-assistant/issues/557)) ([e84f44c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e84f44c7cf76397d35ed46a3c7d0310cbd2457e5))

## [1.25.3](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.25.2...v1.25.3) (2025-02-19)

## [1.25.2](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.25.1...v1.25.2) (2025-02-17)

## [1.25.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.25.0...v1.25.1) (2025-02-14)


### Bug Fixes

* lesson flash after moderation ([#545](https://github.com/oaknational/oak-ai-lesson-assistant/issues/545)) ([74b0cba](https://github.com/oaknational/oak-ai-lesson-assistant/commit/74b0cba13edeba9aa153362fb86174fcf571edff))

# [1.25.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.24.0...v1.25.0) (2025-02-14)


### Bug Fixes

* add placeholder quiz and annotation for experimental patches. ([#537](https://github.com/oaknational/oak-ai-lesson-assistant/issues/537)) ([66508e4](https://github.com/oaknational/oak-ai-lesson-assistant/commit/66508e4a0fcddcd7d8205a8c9a7fe5b2e734cce9))


### Features

* aila threat detection ([#533](https://github.com/oaknational/oak-ai-lesson-assistant/issues/533)) ([9555778](https://github.com/oaknational/oak-ai-lesson-assistant/commit/95557785d318c461927f969aa5481043e9e2e132))

# [1.24.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.23.0...v1.24.0) (2025-02-12)


### Bug Fixes

* add basedOn to LessonPlanKeySchema ([#531](https://github.com/oaknational/oak-ai-lesson-assistant/issues/531)) ([b3fd72f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b3fd72f1a341eaa724f956ff152081abf06ffab0))
* add message queueing to chat store ([#517](https://github.com/oaknational/oak-ai-lesson-assistant/issues/517)) ([ff4b00f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/ff4b00f51998c8200f0a789411ce9803d5671f14))


### Features

* add feature where the url can define the prompt ([#491](https://github.com/oaknational/oak-ai-lesson-assistant/issues/491)) ([577278b](https://github.com/oaknational/oak-ai-lesson-assistant/commit/577278bc2649cf0baa6edbd2454f8d734e5c484f))
* admin button to reverse safety violations ([#497](https://github.com/oaknational/oak-ai-lesson-assistant/issues/497)) ([6167aba](https://github.com/oaknational/oak-ai-lesson-assistant/commit/6167abac019cb28d492dceda714ca2245397c58e))
* ingest dry run single ([#501](https://github.com/oaknational/oak-ai-lesson-assistant/issues/501)) ([6bcf537](https://github.com/oaknational/oak-ai-lesson-assistant/commit/6bcf53715b800a953097e253f6d9399dd543f46d))
* refetch lesson plan when streaming completes ([#529](https://github.com/oaknational/oak-ai-lesson-assistant/issues/529)) ([a96f702](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a96f7020109ecca9652fbf3dcad6ba0fac19dfc6))

# [1.23.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.22.1...v1.23.0) (2025-02-06)


### Bug Fixes

* add message queueing to chat store ([#517](https://github.com/oaknational/oak-ai-lesson-assistant/issues/517)) ([47d5552](https://github.com/oaknational/oak-ai-lesson-assistant/commit/47d555280bcd47aac0481079cde84c1e0a40d76c))


### Features

* move actions to chat store ([#510](https://github.com/oaknational/oak-ai-lesson-assistant/issues/510)) ([c9b45cb](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c9b45cbfc2e2d1b28db4c042c21112406650884a))

## [1.22.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.22.0...v1.22.1) (2025-01-22)


### Bug Fixes

* async / promise linting issues ([#489](https://github.com/oaknational/oak-ai-lesson-assistant/issues/489)) ([3083366](https://github.com/oaknational/oak-ai-lesson-assistant/commit/30833665b7cf7074bb5273f8ccf968adcddde3ef))

# [1.22.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.21.0...v1.22.0) (2025-01-20)


### Bug Fixes

* resolve "error typed" issue with linting ([#483](https://github.com/oaknational/oak-ai-lesson-assistant/issues/483)) ([e31b1c8](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e31b1c8abbf4a7286b134e7129bca45a5141f2d9))
* use stable initialMessages for useChat ([#493](https://github.com/oaknational/oak-ai-lesson-assistant/issues/493)) ([3233c2e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3233c2e9deec046f47d2ceab8b9e3830ecab3ce1))


### Features

* add homepage testimonials ([#482](https://github.com/oaknational/oak-ai-lesson-assistant/issues/482)) ([05df1fe](https://github.com/oaknational/oak-ai-lesson-assistant/commit/05df1fed1039e08f2f08e84a08f844c6245250ce))
* rag new schema, standalone package [AI-722] ([#448](https://github.com/oaknational/oak-ai-lesson-assistant/issues/448)) ([3f32c75](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3f32c75ba0741c7dd88d9800038bb05e17b38d1c))

# [1.21.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.20.0...v1.21.0) (2025-01-15)


### Bug Fixes

* async data prep functions should use Promise.resolve ([#475](https://github.com/oaknational/oak-ai-lesson-assistant/issues/475)) ([4bc7cd8](https://github.com/oaknational/oak-ai-lesson-assistant/commit/4bc7cd8ee02fb192d3689c3441b00b3ddf3010cd))


### Features

* hide the qd ([#465](https://github.com/oaknational/oak-ai-lesson-assistant/issues/465)) ([dbac5c2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/dbac5c2d2bc2a8113aa3518cd5f89d6e7b488042))

# [1.20.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.19.0...v1.20.0) (2025-01-10)


### Bug Fixes

* aria label for buttons and reduce complexity ([#464](https://github.com/oaknational/oak-ai-lesson-assistant/issues/464)) ([79972b4](https://github.com/oaknational/oak-ai-lesson-assistant/commit/79972b4679d53cf486f952707b0f1d171be5f5c2))
* rename LessonPlanKeys to LessonPlanKey ([#467](https://github.com/oaknational/oak-ai-lesson-assistant/issues/467)) ([fb071e7](https://github.com/oaknational/oak-ai-lesson-assistant/commit/fb071e7943a5a4342a438a86cb50d9b614c38753))
* show previously shared lessons in history ([#466](https://github.com/oaknational/oak-ai-lesson-assistant/issues/466)) ([fe39444](https://github.com/oaknational/oak-ai-lesson-assistant/commit/fe394443fd71eafa49247c8eab432f2c5e457d5e))


### Features

* react scan ([#445](https://github.com/oaknational/oak-ai-lesson-assistant/issues/445)) ([2f255b3](https://github.com/oaknational/oak-ai-lesson-assistant/commit/2f255b3656c4c1c53bafa3b1bed1b795c70a84c6))

# [1.19.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.18.2...v1.19.0) (2024-12-18)


### Bug Fixes

* sonar duplication ([#397](https://github.com/oaknational/oak-ai-lesson-assistant/issues/397)) ([dea3106](https://github.com/oaknational/oak-ai-lesson-assistant/commit/dea3106d249119169e515d7ccebc827f324bdbf3))


### Features

* soft delete ([#383](https://github.com/oaknational/oak-ai-lesson-assistant/issues/383)) ([9dee4ad](https://github.com/oaknational/oak-ai-lesson-assistant/commit/9dee4adb840a0a5d96e43f02349ad04597862539))

## [1.18.2](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.18.1...v1.18.2) (2024-12-17)

## [1.18.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.18.0...v1.18.1) (2024-12-16)


### Bug Fixes

* improve chances of showing 5 relevant plans ([#444](https://github.com/oaknational/oak-ai-lesson-assistant/issues/444)) ([4955a1e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/4955a1e35fad9345de01ce9b831747059a95c579))
* posthog consistent event properties ([#440](https://github.com/oaknational/oak-ai-lesson-assistant/issues/440)) ([7c24485](https://github.com/oaknational/oak-ai-lesson-assistant/commit/7c24485f6604cc9a13a0a24058dd5f5a1b0f972e))
* remove key from chat provider ([#431](https://github.com/oaknational/oak-ai-lesson-assistant/issues/431)) ([35141b3](https://github.com/oaknational/oak-ai-lesson-assistant/commit/35141b3305ac7830feeb7269e8ee1f2611368c9a))
* temporarily disable no unsafe rules ([#429](https://github.com/oaknational/oak-ai-lesson-assistant/issues/429)) ([a8ada5d](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a8ada5d008188ea3064476a431b041165fad6e81))

# [1.18.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.17.1...v1.18.0) (2024-12-11)


### Bug Fixes

*  update eslint config and lint errors ([#422](https://github.com/oaknational/oak-ai-lesson-assistant/issues/422)) ([34774b5](https://github.com/oaknational/oak-ai-lesson-assistant/commit/34774b5b404c154d8c8aa10ae5b687507dc09c85))
* moderation persist scores [AI-696] ([#418](https://github.com/oaknational/oak-ai-lesson-assistant/issues/418)) ([7539661](https://github.com/oaknational/oak-ai-lesson-assistant/commit/7539661e22fa0e334138e0f796a700662e4e37e3))
* more flexible and efficient solution for images in docs ([#411](https://github.com/oaknational/oak-ai-lesson-assistant/issues/411)) ([abbff85](https://github.com/oaknational/oak-ai-lesson-assistant/commit/abbff8545476f6c045331a63290fc8f57cf3f54e))
* upgrade typescript + prettier + eslint with a single shared linting config ([#424](https://github.com/oaknational/oak-ai-lesson-assistant/issues/424)) ([1f4aa9d](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1f4aa9dde84402df089ce4d6947472d389f576a0))


### Features

* report google drive storage quota ([#425](https://github.com/oaknational/oak-ai-lesson-assistant/issues/425)) ([a0cb485](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a0cb4859ddb975d831a5b64d8d789ee8597aeda8))
* test coverage ([#406](https://github.com/oaknational/oak-ai-lesson-assistant/issues/406)) ([00767a0](https://github.com/oaknational/oak-ai-lesson-assistant/commit/00767a0148456f57f8fa21e0cb0149cf849f3574))

## [1.17.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.17.0...v1.17.1) (2024-12-03)


### Bug Fixes

* add linting command to db package ([#392](https://github.com/oaknational/oak-ai-lesson-assistant/issues/392)) ([d2177d5](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d2177d5c061e973affd1ea52b0ef025c8c37cb29))
* address sonar major issues ([#393](https://github.com/oaknational/oak-ai-lesson-assistant/issues/393)) ([202a21f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/202a21fbac0d457514c9944735b174c79dced08c))
* do not define components inline ([#413](https://github.com/oaknational/oak-ai-lesson-assistant/issues/413)) ([abda175](https://github.com/oaknational/oak-ai-lesson-assistant/commit/abda1753afecd9385b19b695767568abdd4383c1))
* do not use array index for key / use void for onSubmit ([#409](https://github.com/oaknational/oak-ai-lesson-assistant/issues/409)) ([44b5961](https://github.com/oaknational/oak-ai-lesson-assistant/commit/44b59617f3af8cad83110efdc2cb4df23d06e073))
* help page cloudflare email ([#399](https://github.com/oaknational/oak-ai-lesson-assistant/issues/399)) ([f6262f2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/f6262f26d470a30ea721343bbab2cbfded77b91d))
* high and medium severity bugs on sonar cloud - AI-637 ([#379](https://github.com/oaknational/oak-ai-lesson-assistant/issues/379)) ([fb0258e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/fb0258ec2f3c0d5fb79d884d3918827460cba404))
* icons in dialogs ([#398](https://github.com/oaknational/oak-ai-lesson-assistant/issues/398)) ([9700214](https://github.com/oaknational/oak-ai-lesson-assistant/commit/970021462a94b800dba270130f5ba1b1548e8745))
* intentionality of async / promise code for question generation ([#402](https://github.com/oaknational/oak-ai-lesson-assistant/issues/402)) ([65d1c5f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/65d1c5f89c1b238e24315c02bde2e9eb253b4da3))
* memoize the sidebar context provider's value ([#408](https://github.com/oaknational/oak-ai-lesson-assistant/issues/408)) ([60ee010](https://github.com/oaknational/oak-ai-lesson-assistant/commit/60ee0102ea1ee733d6527c5460fd404cd7773292))
* minor sonar issues ([#390](https://github.com/oaknational/oak-ai-lesson-assistant/issues/390)) ([015cd25](https://github.com/oaknational/oak-ai-lesson-assistant/commit/015cd25984c3e5d1a545afef39fd111aa5245d58))
* prefer nullish coalescing ([#391](https://github.com/oaknational/oak-ai-lesson-assistant/issues/391)) ([b40def9](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b40def9cfd3d69a0089db861a2f6ed47321a3753))
* readonly props for icons.tsx ([#389](https://github.com/oaknational/oak-ai-lesson-assistant/issues/389)) ([7b4d5bc](https://github.com/oaknational/oak-ai-lesson-assistant/commit/7b4d5bcc508b3179ea5313ec783aba90d1a7f3ae))
* revert tabindex change ([#404](https://github.com/oaknational/oak-ai-lesson-assistant/issues/404)) ([ac72713](https://github.com/oaknational/oak-ai-lesson-assistant/commit/ac72713dc54595f6bfacfd99e63899616f18b8ec))
* sonar maintain issues [#4](https://github.com/oaknational/oak-ai-lesson-assistant/issues/4) ([#405](https://github.com/oaknational/oak-ai-lesson-assistant/issues/405)) ([eca0019](https://github.com/oaknational/oak-ai-lesson-assistant/commit/eca001996a684f8d01465196c1c600d00e43a964))
* sonar maintain linting [#1](https://github.com/oaknational/oak-ai-lesson-assistant/issues/1) ([#394](https://github.com/oaknational/oak-ai-lesson-assistant/issues/394)) ([f4d95fc](https://github.com/oaknational/oak-ai-lesson-assistant/commit/f4d95fcbf39c3c43c3811f8c2022a37af363826a))
* sonar maintain linting [#2](https://github.com/oaknational/oak-ai-lesson-assistant/issues/2) ([#395](https://github.com/oaknational/oak-ai-lesson-assistant/issues/395)) ([1ed9d60](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1ed9d6028713b096a68a0558d67608dc9efb812f))
* sonar maintain linting [#3](https://github.com/oaknational/oak-ai-lesson-assistant/issues/3) ([#403](https://github.com/oaknational/oak-ai-lesson-assistant/issues/403)) ([daa7efe](https://github.com/oaknational/oak-ai-lesson-assistant/commit/daa7efe6a2d5d2501f5108cd3c1ccaec86126655))
* sonar minors [#5](https://github.com/oaknational/oak-ai-lesson-assistant/issues/5) ([#414](https://github.com/oaknational/oak-ai-lesson-assistant/issues/414)) ([5f749f4](https://github.com/oaknational/oak-ai-lesson-assistant/commit/5f749f42f9f5d3d78c736438e313f4f5eff5406b))

# [1.17.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.16.2...v1.17.0) (2024-11-28)


### Bug Fixes

* assert readonly props ([#381](https://github.com/oaknational/oak-ai-lesson-assistant/issues/381)) ([cd88576](https://github.com/oaknational/oak-ai-lesson-assistant/commit/cd88576c5a337ad30f48783d74ea45d746a60956))
* help page cloudflare email ([#399](https://github.com/oaknational/oak-ai-lesson-assistant/issues/399)) ([391b67c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/391b67c27a4048d4e422be22226d8d5aa1ac71bd))
* minor linting ([#384](https://github.com/oaknational/oak-ai-lesson-assistant/issues/384)) ([ec4ce6e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/ec4ce6e5dcc7dbd4e242be65fd3b5f9708b94a40))
* svg clip-rule should be clipRule in JSX ([#382](https://github.com/oaknational/oak-ai-lesson-assistant/issues/382)) ([610d8c8](https://github.com/oaknational/oak-ai-lesson-assistant/commit/610d8c838273de24212a8531a8bc4b6136c05db1))


### Features

* move delete all button and restyle side menu ([#375](https://github.com/oaknational/oak-ai-lesson-assistant/issues/375)) ([69b2371](https://github.com/oaknational/oak-ai-lesson-assistant/commit/69b2371bf9ee7e7f783aa191ba6932dba0171837))

## [1.16.2](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.16.1...v1.16.2) (2024-11-25)


### Bug Fixes

* add missing dependencies to Analytics Provider ([#306](https://github.com/oaknational/oak-ai-lesson-assistant/issues/306)) ([871c23f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/871c23f4af0374d98428305fd388400ebb08b035))
* handle aborts and add logging to the stream handler ([#350](https://github.com/oaknational/oak-ai-lesson-assistant/issues/350)) ([20f956e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/20f956e35299ed8f465a8265d7aa52c7f18ac830))
* hook error on sign-in page ([#208](https://github.com/oaknational/oak-ai-lesson-assistant/issues/208)) ([c298b10](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c298b1051cab04643f04f6526b1dd0d835321c7e))
* **sec:** bump next to 14.2.18 ([#242](https://github.com/oaknational/oak-ai-lesson-assistant/issues/242)) ([81fc31c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/81fc31cddb3771b2ace860ee23b17448b22af7fb))

## [1.16.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.16.0...v1.16.1) (2024-11-21)


### Bug Fixes

* add types for SVG imports, remove unused ([#318](https://github.com/oaknational/oak-ai-lesson-assistant/issues/318)) ([c1eff88](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c1eff88efad2496ac0d82a8b8c03d38adf61e8ed))
* streaming JSON types and error reporting tests ([#315](https://github.com/oaknational/oak-ai-lesson-assistant/issues/315)) ([3e18b44](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3e18b446a58f44222919fa4712379785500b903d))

# [1.16.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.15.0...v1.16.0) (2024-11-18)


### Features

* add FeatureFlagProvider ([#353](https://github.com/oaknational/oak-ai-lesson-assistant/issues/353)) ([1d4995e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1d4995ea0c82772259bc5312ba8d872dbd30b2b9))
* link to hubspot form from requests for full access and higher rate - AI-626 AI-627 ([#359](https://github.com/oaknational/oak-ai-lesson-assistant/issues/359)) ([05ccce6](https://github.com/oaknational/oak-ai-lesson-assistant/commit/05ccce69348b03df2edee01dd1a27814a071be3d))

# [1.15.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.14.2...v1.15.0) (2024-11-13)


### Features

* add additional materials button - AI-539 [migration] ([#255](https://github.com/oaknational/oak-ai-lesson-assistant/issues/255)) ([d0fe2d0](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d0fe2d015865b89ea2287993652a6f8111f0ae4a))
* prisma health check - AI-625 ([#356](https://github.com/oaknational/oak-ai-lesson-assistant/issues/356)) ([854950d](https://github.com/oaknational/oak-ai-lesson-assistant/commit/854950d51524eb8d84a0ec9695c88b67f829fd8d))

## [1.14.2](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.14.1...v1.14.2) (2024-11-12)


### Bug Fixes

* design-changes-to-footer ([#324](https://github.com/oaknational/oak-ai-lesson-assistant/issues/324)) ([273cfdc](https://github.com/oaknational/oak-ai-lesson-assistant/commit/273cfdc668ca45def0b8a68dc08b7301974e1def))
* only categorise initial user input once ([#348](https://github.com/oaknational/oak-ai-lesson-assistant/issues/348)) ([dd5bf71](https://github.com/oaknational/oak-ai-lesson-assistant/commit/dd5bf71a21421ac6e0beb60b4bab560cb159d877))

## [1.14.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.14.0...v1.14.1) (2024-11-07)


### Bug Fixes

* allow requests without a cookie header ([#352](https://github.com/oaknational/oak-ai-lesson-assistant/issues/352)) ([80f5050](https://github.com/oaknational/oak-ai-lesson-assistant/commit/80f50507ab370032a3ef6767bcfe5da0d8b6fe82))

# [1.14.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.13.1...v1.14.0) (2024-11-07)


### Bug Fixes

* add missing dependencies to lesson plan tracking context ([#307](https://github.com/oaknational/oak-ai-lesson-assistant/issues/307)) ([3758dfc](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3758dfcda8a937ca363c0eb40014b01d18c93c23))
* add missing prisma import ([#342](https://github.com/oaknational/oak-ai-lesson-assistant/issues/342)) ([a0ac1de](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a0ac1de89dc6dda38ab64a02054e992072332fd5))
* disable feature flagg polling in tests ([c44e1f1](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c44e1f10e98dcda37367f2cd03b324078c7b910f))
* null render in sidebar provider ([#337](https://github.com/oaknational/oak-ai-lesson-assistant/issues/337)) ([9a12851](https://github.com/oaknational/oak-ai-lesson-assistant/commit/9a12851471aeb5f36e7aebd9c1652d0c2a565966))
* remaining linting fixes ([#272](https://github.com/oaknational/oak-ai-lesson-assistant/issues/272)) ([18a0f70](https://github.com/oaknational/oak-ai-lesson-assistant/commit/18a0f7061bc9d8bd72c4f6d44eec003acd878df1))
* set up server side styled-components ([f221c24](https://github.com/oaknational/oak-ai-lesson-assistant/commit/f221c2442617031fa694708da953b4a5f1ea5e6c))
* skip instrumentation when running turbopack - fix HMR ([4d6fd3b](https://github.com/oaknational/oak-ai-lesson-assistant/commit/4d6fd3b963710703b547cda5b2085bfc7f00f941))


### Features

* add rag schema (migration) ([#343](https://github.com/oaknational/oak-ai-lesson-assistant/issues/343)) ([638f43f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/638f43fa0167f28974250f3da2d67ef95aaae57e))
* allow us to configure the server port for local testing ([#308](https://github.com/oaknational/oak-ai-lesson-assistant/issues/308)) ([33bee19](https://github.com/oaknational/oak-ai-lesson-assistant/commit/33bee19e5e631428b648159452ef5af5dbec36bd))
* bootstrap posthog feature flags with local evaluation ([15e8a67](https://github.com/oaknational/oak-ai-lesson-assistant/commit/15e8a67e9a1ce8e08baa5642c7fffbd2193d3b64))
* sync featureFlagGroup from clerk to posthog ([46b4f13](https://github.com/oaknational/oak-ai-lesson-assistant/commit/46b4f13a1e887177035a9d195886f34647a87ac9))
* update emails to use html ([#319](https://github.com/oaknational/oak-ai-lesson-assistant/issues/319)) ([a71e7bc](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a71e7bc4b6416ef01b48de4c950805f8244e658b))
* use featureFlagGroup claim for feature flags ([759534a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/759534a8b8189c25d665b34db1cdf7f0b7a8f31e))

## [1.13.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.13.0...v1.13.1) (2024-11-05)


### Bug Fixes

* revert prisma to 5.16.1 ([#336](https://github.com/oaknational/oak-ai-lesson-assistant/issues/336)) ([a593618](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a593618b013607fbde75cfa98663d7298db7ff89))

# [1.13.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.12.1...v1.13.0) (2024-10-31)


### Bug Fixes

* await persisting the generation ([#292](https://github.com/oaknational/oak-ai-lesson-assistant/issues/292)) ([730dbb9](https://github.com/oaknational/oak-ai-lesson-assistant/commit/730dbb94a786f9f8a6e03e9ed4d9ff90853522fd))
* await the enqueue method in web actions ([#293](https://github.com/oaknational/oak-ai-lesson-assistant/issues/293)) ([c9cb82b](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c9cb82b2df566b0ec2a952b21d22e87d61fcd094))
* await the save download event call ([#317](https://github.com/oaknational/oak-ai-lesson-assistant/issues/317)) ([1e05c1a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1e05c1ad177d2e385fc4fa6cc9bb76548d039194))
* completion and system messages do not need to be async ([#294](https://github.com/oaknational/oak-ai-lesson-assistant/issues/294)) ([be79158](https://github.com/oaknational/oak-ai-lesson-assistant/commit/be791584805d219db1da4949a8a32c0a0f40b589))
* linting for app components ([#295](https://github.com/oaknational/oak-ai-lesson-assistant/issues/295)) ([1212eb5](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1212eb50f5e2e3ee913b57ec7bffc2fcabe981c8))
* pages that do not load data do not need to be async ([#296](https://github.com/oaknational/oak-ai-lesson-assistant/issues/296)) ([a7eaefa](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a7eaefa5acef4d89a60dd79301cdf4be61db6830))
* promisify chat API route get handler ([#316](https://github.com/oaknational/oak-ai-lesson-assistant/issues/316)) ([1824aea](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1824aead23e65654a4651abb91e589d218cb9bb1))
* reintroduce custom eslint ([#284](https://github.com/oaknational/oak-ai-lesson-assistant/issues/284)) ([adc1efa](https://github.com/oaknational/oak-ai-lesson-assistant/commit/adc1efa686a7cc332a1755a3e77f5e50a831df7d))
* rename accordian to accordion ([#297](https://github.com/oaknational/oak-ai-lesson-assistant/issues/297)) ([cd35dc1](https://github.com/oaknational/oak-ai-lesson-assistant/commit/cd35dc15b97960a18196119540cc5848f58eaa47))
* set VS Code to prefer type imports ([#291](https://github.com/oaknational/oak-ai-lesson-assistant/issues/291)) ([bc26948](https://github.com/oaknational/oak-ai-lesson-assistant/commit/bc269484ed8857b10aac36e06a0dab18c8308277))
* update imports (type prefixes, paths) ([#298](https://github.com/oaknational/oak-ai-lesson-assistant/issues/298)) ([c332717](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c33271721e15e3c06374c4648fe69611e306ac14))
* use browserLogger for errors in the browser ([#280](https://github.com/oaknational/oak-ai-lesson-assistant/issues/280)) ([647c904](https://github.com/oaknational/oak-ai-lesson-assistant/commit/647c90415c6ea5f71e75973caad627abe49bfd0c))
* use noengine in ci ([#283](https://github.com/oaknational/oak-ai-lesson-assistant/issues/283)) ([3a1bfd4](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3a1bfd4df3d2489dda9387752f19c79b16e5da92))
* use prisma generate --no-engine and reinstate prompts script ([#282](https://github.com/oaknational/oak-ai-lesson-assistant/issues/282)) ([a157b9a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a157b9a6fececed09f43b7cca3989edd5e636a59))


### Features

* add an incrementing iteration number to the chat ([#263](https://github.com/oaknational/oak-ai-lesson-assistant/issues/263)) ([5aaa1d9](https://github.com/oaknational/oak-ai-lesson-assistant/commit/5aaa1d91146b92c1c449ecbf4725c61ec226ec87))
* selectively include Americanisms, RAG, analytics when instantiating Aila ([#287](https://github.com/oaknational/oak-ai-lesson-assistant/issues/287)) ([4e5e1f2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/4e5e1f22a4ea6262114033e45ffe4817b483f379))

## [1.12.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.12.0...v1.12.1) (2024-10-28)


### Bug Fixes

* hide streaming status in production ([#281](https://github.com/oaknational/oak-ai-lesson-assistant/issues/281)) ([1efc89e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1efc89eabd23d226060ad84b60010a5ff5cd9674))

# [1.12.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.11.0...v1.12.0) (2024-10-28)


### Bug Fixes

* ensure that the patch enqueuer exists when enqueuing ([#264](https://github.com/oaknational/oak-ai-lesson-assistant/issues/264)) ([4d4b959](https://github.com/oaknational/oak-ai-lesson-assistant/commit/4d4b9599996482817411237a13174ed55ef6c476))
* logger to stdout for info and warn ([#266](https://github.com/oaknational/oak-ai-lesson-assistant/issues/266)) ([d2dfabc](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d2dfabcb41ed85a731435ed8283540cd974b0de5))
* module resolution with "node" instead of "bundler" ([#271](https://github.com/oaknational/oak-ai-lesson-assistant/issues/271)) ([44ca5f6](https://github.com/oaknational/oak-ai-lesson-assistant/commit/44ca5f6cebd7d9a7f047cfad558030cb206b4f3c))
* reduce turbo errors on local dev, enable running e2e in built mode ([#259](https://github.com/oaknational/oak-ai-lesson-assistant/issues/259)) ([afb4535](https://github.com/oaknational/oak-ai-lesson-assistant/commit/afb453581c3dbe2b01a4e0712df97a7779d59e6c))
* refactor lesson snapshots for improved efficiency ([#234](https://github.com/oaknational/oak-ai-lesson-assistant/issues/234)) ([24f492d](https://github.com/oaknational/oak-ai-lesson-assistant/commit/24f492dc79e6a9dc94e213c4f447802e750c99db))
* reinstate prebuilding the chat route in local dev ([#260](https://github.com/oaknational/oak-ai-lesson-assistant/issues/260)) ([1a4c51f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1a4c51fa4b2b53e758f860091c85f840c191dc9f))
* remove flash when loading wheel appears ([#268](https://github.com/oaknational/oak-ai-lesson-assistant/issues/268)) ([d7a70f3](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d7a70f353be0c6e1a833f5ec922d2e62f71bba7f))
* remove lessonReferences from prompt ([#253](https://github.com/oaknational/oak-ai-lesson-assistant/issues/253)) ([a0cedec](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a0cedec86924a1bf0cf2466bd7a5ef106d7f8272))
* report chat completion errors ([#256](https://github.com/oaknational/oak-ai-lesson-assistant/issues/256)) ([13729ca](https://github.com/oaknational/oak-ai-lesson-assistant/commit/13729ca4d0d64f436309575bf8be50640604c710))
* update prisma to latest version ([#254](https://github.com/oaknational/oak-ai-lesson-assistant/issues/254)) ([b8b1958](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b8b1958c914b405e859cf39163fa531bef9e99d5))


### Features

* add a test:seq command ([#273](https://github.com/oaknational/oak-ai-lesson-assistant/issues/273)) ([d04d456](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d04d456bd2b3968491088ed39631e11c23d2cf9c))
* hint Aila as to which part of the lesson to update next ([#265](https://github.com/oaknational/oak-ai-lesson-assistant/issues/265)) ([b8b39b8](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b8b39b833c788ca7fc38c9319c401aae2c1d330a))
* ingest scripts ([#200](https://github.com/oaknational/oak-ai-lesson-assistant/issues/200)) ([be824a8](https://github.com/oaknational/oak-ai-lesson-assistant/commit/be824a8d73f8d0e2bc690789314ed7b0d135b090))
* local db setup scripts ([#132](https://github.com/oaknational/oak-ai-lesson-assistant/issues/132)) ([d531a50](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d531a50229c604fa71157609fcde181eefb5e9b3))

# [1.11.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.10.2...v1.11.0) (2024-10-22)


### Bug Fixes

* add migration for ingest config ([#239](https://github.com/oaknational/oak-ai-lesson-assistant/issues/239)) ([b4b9e60](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b4b9e60d01d4f7dad213d2a89a41fe327ba606ec))
* ingest config migration fix ([#243](https://github.com/oaknational/oak-ai-lesson-assistant/issues/243)) ([1bdf99a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1bdf99a5ce8be819107e36295accf67aed6e4d25))
* **sec:** update next ([#240](https://github.com/oaknational/oak-ai-lesson-assistant/issues/240)) ([bcda9d7](https://github.com/oaknational/oak-ai-lesson-assistant/commit/bcda9d7b2a7783d8f23882490f85c9c6b64b5add))


### Features

* add dev-turbo mode to use turbopack ([#248](https://github.com/oaknational/oak-ai-lesson-assistant/issues/248)) ([6bd8c40](https://github.com/oaknational/oak-ai-lesson-assistant/commit/6bd8c40b5b40a56dfb94ae3aace86efbeb77e50c))
* relevant lessons [AI-607] ([#238](https://github.com/oaknational/oak-ai-lesson-assistant/issues/238)) ([73ffd29](https://github.com/oaknational/oak-ai-lesson-assistant/commit/73ffd2993a215abfa9cdd1c0706dbf7106f9e006))

## [1.10.2](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.10.1...v1.10.2) (2024-10-16)


### Bug Fixes

* spacing on onboarding upgrade screen [AI-500] ([#232](https://github.com/oaknational/oak-ai-lesson-assistant/issues/232)) ([0d2a2fd](https://github.com/oaknational/oak-ai-lesson-assistant/commit/0d2a2fd291962e6fb134293f91deded96c49743a))

## [1.10.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.10.0...v1.10.1) (2024-10-15)


### Bug Fixes

* add fallback if requestSubmit is not available ([#227](https://github.com/oaknational/oak-ai-lesson-assistant/issues/227)) ([e9b02c6](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e9b02c61deaec766bde6bf8494e7b724946f05e3))
* findLast is not available for all browsers (WIP) ([#211](https://github.com/oaknational/oak-ai-lesson-assistant/issues/211)) ([a94e0f4](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a94e0f4570b0bfbd6642d6cb36380b5eaf4b2e52))
* reduce middleware syntax error logs, send to logs, tests for CSP in each env ([#213](https://github.com/oaknational/oak-ai-lesson-assistant/issues/213)) ([d18a7d2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d18a7d22d3adef8537663f34944edb5b32de4432))
* remove lookbehind in regex for camelcase conversion ([#226](https://github.com/oaknational/oak-ai-lesson-assistant/issues/226)) ([dc747c3](https://github.com/oaknational/oak-ai-lesson-assistant/commit/dc747c3dd0a496f38b55846b40a787da8e92e05a))
* revert "fix: revert error to previous protocol ([#139](https://github.com/oaknational/oak-ai-lesson-assistant/issues/139)) ([#218](https://github.com/oaknational/oak-ai-lesson-assistant/issues/218)) ([dccba58](https://github.com/oaknational/oak-ai-lesson-assistant/commit/dccba587fe8b5b06b4e2a34a92c45c9aa7597851))
* silence unknown part type errors ([#229](https://github.com/oaknational/oak-ai-lesson-assistant/issues/229)) ([2e3e56b](https://github.com/oaknational/oak-ai-lesson-assistant/commit/2e3e56bbc9c0c8dd2f6d3bf6be9b167eb445ee97))

# [1.10.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.9.2...v1.10.0) (2024-10-14)


### Bug Fixes

* add missing test id ([d8108ff](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d8108fff76d29c03fbbb11cebc8dcad0f64e6c87))
* revert Oak components for demo UI ([#204](https://github.com/oaknational/oak-ai-lesson-assistant/issues/204)) ([#221](https://github.com/oaknational/oak-ai-lesson-assistant/issues/221)) ([c6d7d7e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c6d7d7e73f74f52127a00f60e442031983c74499))


### Features

* move aila analytics calls to background ([#206](https://github.com/oaknational/oak-ai-lesson-assistant/issues/206)) ([eaf8559](https://github.com/oaknational/oak-ai-lesson-assistant/commit/eaf8559be326c1a81c27f24d835c8eb55358cd40))

## [1.9.2](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.9.1...v1.9.2) (2024-10-09)


### Bug Fixes

* sanitize file names before downloading ([#201](https://github.com/oaknational/oak-ai-lesson-assistant/issues/201)) ([05da00e](https://github.com/oaknational/oak-ai-lesson-assistant/commit/05da00e52653f02fbed5291b85ac25ba0e55ac57))

## [1.9.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.9.0...v1.9.1) (2024-10-04)


### Bug Fixes

* enable stop button to clear queuedAction ([#173](https://github.com/oaknational/oak-ai-lesson-assistant/issues/173)) ([98937a3](https://github.com/oaknational/oak-ai-lesson-assistant/commit/98937a33dc183f2cd477fe7fd75e692a457435fd))
* feature flag "download all" button ([#178](https://github.com/oaknational/oak-ai-lesson-assistant/issues/178)) ([2676283](https://github.com/oaknational/oak-ai-lesson-assistant/commit/2676283ca90e6dc51475755953bdc77ae9a8ffec))
* return a 400 for invalid input to middleware ([#185](https://github.com/oaknational/oak-ai-lesson-assistant/issues/185)) ([b3de13b](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b3de13be9792691225923bf0c7c9f02b7f5d0352))
* robust handling of incomplete data in download all ([#177](https://github.com/oaknational/oak-ai-lesson-assistant/issues/177)) ([7db415b](https://github.com/oaknational/oak-ai-lesson-assistant/commit/7db415b4f265b8aea7bbbb4cc7ebc02add5241d1))


### Performance Improvements

* add fts index to snippets table ([#180](https://github.com/oaknational/oak-ai-lesson-assistant/issues/180)) ([64b2493](https://github.com/oaknational/oak-ai-lesson-assistant/commit/64b2493f5c9e59d899b13f9ac10fecf796a4482f))

# [1.9.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.8.0...v1.9.0) (2024-10-02)


### Bug Fixes

* close sidebar on new lesson ([#116](https://github.com/oaknational/oak-ai-lesson-assistant/issues/116)) ([90a2a73](https://github.com/oaknational/oak-ai-lesson-assistant/commit/90a2a73e8400ae43c0a6aff29d27c7454f36a5a8))
* detect StreamingLessonPlan for mobile modal ([#168](https://github.com/oaknational/oak-ai-lesson-assistant/issues/168)) ([ef56658](https://github.com/oaknational/oak-ai-lesson-assistant/commit/ef56658d08c89604119e798948d8b3ff3b596dd2))
* dialog window bug ([#155](https://github.com/oaknational/oak-ai-lesson-assistant/issues/155)) ([443a398](https://github.com/oaknational/oak-ai-lesson-assistant/commit/443a398a031bd7b0895575ff8b664d8417656470))
* feature flag "download all" button ([#178](https://github.com/oaknational/oak-ai-lesson-assistant/issues/178)) ([60b4247](https://github.com/oaknational/oak-ai-lesson-assistant/commit/60b42477272e67ad4119bbf651b2969d59a60eec))
* in app feedback snags ([#153](https://github.com/oaknational/oak-ai-lesson-assistant/issues/153)) ([b1e625a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b1e625a1b56d3716e5090db4cfd47761aaa527dc))
* refetch chat on mount to fix the blank chat issue on back navigation ([#166](https://github.com/oaknational/oak-ai-lesson-assistant/issues/166)) ([c2f74d7](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c2f74d72fc3e8b86214ff57e62b5cc7c481188d3))
* robust handling of incomplete data in download all ([#177](https://github.com/oaknational/oak-ai-lesson-assistant/issues/177)) ([06b15ae](https://github.com/oaknational/oak-ai-lesson-assistant/commit/06b15ae22698ee94e720a548e2da7e38c087722c))
* safari blocking share page as it was an async window pop up ([#131](https://github.com/oaknational/oak-ai-lesson-assistant/issues/131)) ([7365ea0](https://github.com/oaknational/oak-ai-lesson-assistant/commit/7365ea0813cd46e3f271ad3dbcdbc77a1b548ee0))
* small bugs ([#159](https://github.com/oaknational/oak-ai-lesson-assistant/issues/159)) ([712bf12](https://github.com/oaknational/oak-ai-lesson-assistant/commit/712bf128f2f4141ba37f8001b6a23b06cfbf2596))
* stop interaction except in moderation or idle ([#165](https://github.com/oaknational/oak-ai-lesson-assistant/issues/165)) ([a162ff3](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a162ff3177d01754c47d2c9792a0e328abbb7b17))


### Features

* donwload all button ([#152](https://github.com/oaknational/oak-ai-lesson-assistant/issues/152)) ([732b778](https://github.com/oaknational/oak-ai-lesson-assistant/commit/732b7785530be9edcb952b4465395b171c913717))

# [1.8.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.7.3...v1.8.0) (2024-09-30)


### Bug Fixes

* 'generate' vs 'interactive' prompt fixes ([#148](https://github.com/oaknational/oak-ai-lesson-assistant/issues/148)) ([d19d6c4](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d19d6c4ef81231bc941595e0a0c105042ea728bb))
* add a toggle to enable/disable structured outputs ([#133](https://github.com/oaknational/oak-ai-lesson-assistant/issues/133)) ([cdf64ef](https://github.com/oaknational/oak-ai-lesson-assistant/commit/cdf64ef72ea78fd9e8404d8ea4e6497cf486f44d))
* admin moderation order by date ([#140](https://github.com/oaknational/oak-ai-lesson-assistant/issues/140)) ([76a9529](https://github.com/oaknational/oak-ai-lesson-assistant/commit/76a952913201e0b8a951ac648eaaeeadbab320b6))
* change extensions in mobile button ([#115](https://github.com/oaknational/oak-ai-lesson-assistant/issues/115)) ([df73b6d](https://github.com/oaknational/oak-ai-lesson-assistant/commit/df73b6d111d9c7a432b4ba14adcf48cb026c00b0))
* change plan parts embeddings to 256 vectprs ([#157](https://github.com/oaknational/oak-ai-lesson-assistant/issues/157)) ([65f562c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/65f562ced2a8e8bea637fc0227141fc6e1a1f1ce))
* changes text in modify ([d7e1cb1](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d7e1cb194b1402e5ad030822e58710ca87014542))
* correct paths for help ([#118](https://github.com/oaknational/oak-ai-lesson-assistant/issues/118)) ([43403df](https://github.com/oaknational/oak-ai-lesson-assistant/commit/43403df7afcb438da60a78068a259ef4a3f0f738))
* detect StreamingLessonPlan for mobile modal ([35b0460](https://github.com/oaknational/oak-ai-lesson-assistant/commit/35b0460d8cc4e281d155aa91e9be692c00b3ec39))
* error colour precedence in message wrapper ([#112](https://github.com/oaknational/oak-ai-lesson-assistant/issues/112)) ([bd75989](https://github.com/oaknational/oak-ai-lesson-assistant/commit/bd75989c0d4881f8a1d7929574d36f1d1ba64571))
* fuzzy key stage from correct table ([#125](https://github.com/oaknational/oak-ai-lesson-assistant/issues/125)) ([b370823](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b3708235efff4c949cd4abdd257d9456af331f7b))
* help button ([#120](https://github.com/oaknational/oak-ai-lesson-assistant/issues/120)) ([d13a945](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d13a9456f8b9eb42403e7cd3127156fd1d658b74))
* message ids, flag and modify tables ([#145](https://github.com/oaknational/oak-ai-lesson-assistant/issues/145)) ([2d347eb](https://github.com/oaknational/oak-ai-lesson-assistant/commit/2d347ebcccaa7356c1f1ff05967aa4e36d6fceb5))
* prompt generation types, variants and testing Open AI responses ([#44](https://github.com/oaknational/oak-ai-lesson-assistant/issues/44)) ([571fee9](https://github.com/oaknational/oak-ai-lesson-assistant/commit/571fee98e8e07042f6167ef37395e753e6816f34))
* prompt key stage enum ([#127](https://github.com/oaknational/oak-ai-lesson-assistant/issues/127)) ([22102fd](https://github.com/oaknational/oak-ai-lesson-assistant/commit/22102fdfd402851058b244ce6bce90d08df5efb7))
* quiz designer snags ([#113](https://github.com/oaknational/oak-ai-lesson-assistant/issues/113)) ([84b5e67](https://github.com/oaknational/oak-ai-lesson-assistant/commit/84b5e6724d9fd73841923746e9a19a6d6c72b949))
* refetch chat on mount to fix the blank chat issue on back navigation ([#166](https://github.com/oaknational/oak-ai-lesson-assistant/issues/166)) ([ac7828c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/ac7828c676e3381d1898772c6e282aaa4e3dd311))
* revert ([e7221d2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e7221d24b4dc9ed0df55dd834c32a922d8c881aa))
* send chat id with analytics events ([#154](https://github.com/oaknational/oak-ai-lesson-assistant/issues/154)) ([638c851](https://github.com/oaknational/oak-ai-lesson-assistant/commit/638c8518bf40d672ef95b520cf690a874f7441e4))
* stop interaction except in moderation or idle ([#165](https://github.com/oaknational/oak-ai-lesson-assistant/issues/165)) ([e27b13a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e27b13ad37ac2b01bfe0ae5e001e454d5b825b46))
* survey not found bug ([#121](https://github.com/oaknational/oak-ai-lesson-assistant/issues/121)) ([fe94d13](https://github.com/oaknational/oak-ai-lesson-assistant/commit/fe94d1308d91ca62e020eab97d0eda3fa7b9f4b3))
* use new AI protocol format for friendly errors ([#122](https://github.com/oaknational/oak-ai-lesson-assistant/issues/122)) ([55b299c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/55b299ca9c192f24ae225571afcc567f002d0bdd))


### Features

* add distractor length to the schema ([#68](https://github.com/oaknational/oak-ai-lesson-assistant/issues/68)) ([f6ace60](https://github.com/oaknational/oak-ai-lesson-assistant/commit/f6ace60a8b9ec459ead1f3a26a5702e8221b0165))
* add time to first token for openai ([#144](https://github.com/oaknational/oak-ai-lesson-assistant/issues/144)) ([79d51a8](https://github.com/oaknational/oak-ai-lesson-assistant/commit/79d51a8220342bd90615bbaeda23924e9c102008))
* allow the user to interact while moderation is in progress ([#147](https://github.com/oaknational/oak-ai-lesson-assistant/issues/147)) ([8a3b9e1](https://github.com/oaknational/oak-ai-lesson-assistant/commit/8a3b9e156b4e260f9b41c0c040998068f929c9d1))
* check for exsisting downloads on download page mount ([#114](https://github.com/oaknational/oak-ai-lesson-assistant/issues/114)) ([33d2846](https://github.com/oaknational/oak-ai-lesson-assistant/commit/33d28465129462f7b74af02832904c3af330c7e2))
* invalidate moderation and unblock user ([#109](https://github.com/oaknational/oak-ai-lesson-assistant/issues/109)) ([dfd988f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/dfd988fc96e02087290d6ba37d90591d40e46da3))
* sanity ([#151](https://github.com/oaknational/oak-ai-lesson-assistant/issues/151)) ([1ab164d](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1ab164d9b6f4a1135a7d6dbf23bcce3515525b47))
* shortened text responses, basedOn selection and generate mode prompt tidy-up ([#124](https://github.com/oaknational/oak-ai-lesson-assistant/issues/124)) ([940c97a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/940c97a43acb583371d4637b211230ed45eafcd4))
* structured outputs for Aila ([#91](https://github.com/oaknational/oak-ai-lesson-assistant/issues/91)) ([3145f2a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3145f2ada38a985fbeb231e1708de1c680fb6514))
* use TRPC for state and remove the spinner flash ([#135](https://github.com/oaknational/oak-ai-lesson-assistant/issues/135)) ([efccbb6](https://github.com/oaknational/oak-ai-lesson-assistant/commit/efccbb63645e85a290411c40e4c8f2a4ca94d35a))

## [1.7.3](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.7.2...v1.7.3) (2024-09-25)

## [1.7.2](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.7.1...v1.7.2) (2024-09-23)


### Bug Fixes

* use NextResponse.json() in case of middleware errors ([#150](https://github.com/oaknational/oak-ai-lesson-assistant/issues/150)) ([73259a2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/73259a258d7ce571bb1e8de464a631f55acfd684))

## [1.7.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.7.0...v1.7.1) (2024-09-17)


### Bug Fixes

* revert error to previous protocol ([#139](https://github.com/oaknational/oak-ai-lesson-assistant/issues/139)) ([e053b89](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e053b895503d5a29522404ce14e13239b6db7852))

# [1.7.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.6.1...v1.7.0) (2024-09-16)


### Bug Fixes

* change extensions in mobile button ([#115](https://github.com/oaknational/oak-ai-lesson-assistant/issues/115)) ([36b26ba](https://github.com/oaknational/oak-ai-lesson-assistant/commit/36b26ba3154a0b9738f625c7c47dd1b0c9666a76))
* correct paths for help ([#118](https://github.com/oaknational/oak-ai-lesson-assistant/issues/118)) ([cbbf4d2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/cbbf4d246a48ca2b4cdbb48a9e2d52955797527c))
* error colour precedence in message wrapper ([#112](https://github.com/oaknational/oak-ai-lesson-assistant/issues/112)) ([18bfccc](https://github.com/oaknational/oak-ai-lesson-assistant/commit/18bfcccf2dd366ec8d6da5b5f355694a63bc936b))
* exports page overlap ([#105](https://github.com/oaknational/oak-ai-lesson-assistant/issues/105)) ([f2d1a57](https://github.com/oaknational/oak-ai-lesson-assistant/commit/f2d1a57a7084203bda8fa8996082a3b1798555e3))
* help button ([#120](https://github.com/oaknational/oak-ai-lesson-assistant/issues/120)) ([a492838](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a492838cc4ce367226458a63400985ee45e3b02f))
* in app feedback snags ([#108](https://github.com/oaknational/oak-ai-lesson-assistant/issues/108)) ([45e5a63](https://github.com/oaknational/oak-ai-lesson-assistant/commit/45e5a63c6634254ac765624ecd5c83988ce4a722))
* mobile video sizing ([#106](https://github.com/oaknational/oak-ai-lesson-assistant/issues/106)) ([c235310](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c235310b8e3e07fd2ba3fe71f19ea24af3db9a57))
* **moderation prompt:** lower false positives in toxic category ([#102](https://github.com/oaknational/oak-ai-lesson-assistant/issues/102)) ([76e3cd5](https://github.com/oaknational/oak-ai-lesson-assistant/commit/76e3cd5c10d31a0dd56335a6382301c3555763c1))
* quiz designer snags ([#113](https://github.com/oaknational/oak-ai-lesson-assistant/issues/113)) ([db1b0d8](https://github.com/oaknational/oak-ai-lesson-assistant/commit/db1b0d81d69d7ee81a6d19b7ef1e7b43cc2e447d))
* return protocol error messages for user restrictions ([#111](https://github.com/oaknational/oak-ai-lesson-assistant/issues/111)) ([741c935](https://github.com/oaknational/oak-ai-lesson-assistant/commit/741c93525bb46cbfa735487a938e3dc047a45128))
* sidebar getting stuck at 0 ([#107](https://github.com/oaknational/oak-ai-lesson-assistant/issues/107)) ([dedfd24](https://github.com/oaknational/oak-ai-lesson-assistant/commit/dedfd2426073397539ed49ec74917fd092251b32))
* survey not found bug ([#121](https://github.com/oaknational/oak-ai-lesson-assistant/issues/121)) ([705a267](https://github.com/oaknational/oak-ai-lesson-assistant/commit/705a2671ff79dce91ca36941d7b6814455c282e2))
* use new AI protocol format for friendly errors ([#122](https://github.com/oaknational/oak-ai-lesson-assistant/issues/122)) ([7402e72](https://github.com/oaknational/oak-ai-lesson-assistant/commit/7402e724b161039f309279b94a8cb4a7b2bae0bf))


### Features

* add pwa manifest ([#101](https://github.com/oaknational/oak-ai-lesson-assistant/issues/101)) ([c066f97](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c066f971535fc9256e9cbcdf9b38a6c9168e5344))
* invalidate moderation and unblock user ([#109](https://github.com/oaknational/oak-ai-lesson-assistant/issues/109)) ([5094c47](https://github.com/oaknational/oak-ai-lesson-assistant/commit/5094c47b53d89564ef06d69ba7195399db728b9c))
* update content guidance text ([#75](https://github.com/oaknational/oak-ai-lesson-assistant/issues/75)) ([b02ce31](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b02ce3128e249a52e5be8106aab87987230a1a93))

## [1.6.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.6.0...v1.6.1) (2024-09-12)


### Bug Fixes

* survey not found bug ([#121](https://github.com/oaknational/oak-ai-lesson-assistant/issues/121)) ([e22cfa5](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e22cfa5cf15765fec20928aedb806645dd32895f))

# [1.6.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.5.1...v1.6.0) (2024-09-06)


### Bug Fixes

* add dummy-smoke-test moderation category to detect incorrect moderation ([0ec0ab2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/0ec0ab2b984de5c6632ed1cabf0ea8f63cc71766))
* add litix to csp ([#88](https://github.com/oaknational/oak-ai-lesson-assistant/issues/88)) ([3f621d5](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3f621d5232b382dd85486b9b8f3abb4f81c0ecbc))
* allow the user to input other text ([#90](https://github.com/oaknational/oak-ai-lesson-assistant/issues/90)) ([271f6b0](https://github.com/oaknational/oak-ai-lesson-assistant/commit/271f6b07758a74ae151721a0e722d6b23abd7d50))
* clear history button position ([9d67dd8](https://github.com/oaknational/oak-ai-lesson-assistant/commit/9d67dd8ff6ec0bb3edf330b60dd032a87739a38e))
* don't send user email to main PostHog ([#84](https://github.com/oaknational/oak-ai-lesson-assistant/issues/84)) ([0f18c46](https://github.com/oaknational/oak-ai-lesson-assistant/commit/0f18c465bf3ea84cceaed09fe7779ae0363fa9b2))
* downgrade moderation if all categories triggered at same time ([ca5a830](https://github.com/oaknational/oak-ai-lesson-assistant/commit/ca5a83033cf1ce1e5994d8195928b0b28b323be9))
* email error message only on error ([b6919e9](https://github.com/oaknational/oak-ai-lesson-assistant/commit/b6919e9629d43e218e0f8553c1ea01b3398bdb15))
* ensure prompt variants are initialised correctly ([#57](https://github.com/oaknational/oak-ai-lesson-assistant/issues/57)) ([4d80a62](https://github.com/oaknational/oak-ai-lesson-assistant/commit/4d80a622f91dacb2fab9b8e06724a3991eadd545))
* fix homepage video reponsive layout ([4342d9f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/4342d9f728679cfd299c9441bcd50de23ab15684))
* hotfix incorrect top position in mobile view ([#97](https://github.com/oaknational/oak-ai-lesson-assistant/issues/97)) ([e0003bb](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e0003bb97faaf795a4afa5cae0bcac71ac8baa1b))
* mobile downloads blocked on demo ([#82](https://github.com/oaknational/oak-ai-lesson-assistant/issues/82)) ([cfdf59c](https://github.com/oaknational/oak-ai-lesson-assistant/commit/cfdf59c1fe0157ec5d78a14d51c23673c2999b68))
* prisma init singleton ([#56](https://github.com/oaknational/oak-ai-lesson-assistant/issues/56)) ([4a3a7f4](https://github.com/oaknational/oak-ai-lesson-assistant/commit/4a3a7f478b924eaabd9e821eb03eaa95714676cf))
* remove demo header margin on mobile ([3f5739b](https://github.com/oaknational/oak-ai-lesson-assistant/commit/3f5739b25ede0bc139a9f97783f4d6fb6746c224))
* remove duplicate beta tag on mobile ([53221a4](https://github.com/oaknational/oak-ai-lesson-assistant/commit/53221a490fd3af0049f4ca2a25312e332be6ab95))
* **share:** fix share bug ([#70](https://github.com/oaknational/oak-ai-lesson-assistant/issues/70)) ([11e6148](https://github.com/oaknational/oak-ai-lesson-assistant/commit/11e61488e0e50e67868db34e2d1fe734d64df6f1))


### Features

* add retry limit and log ([238cf26](https://github.com/oaknational/oak-ai-lesson-assistant/commit/238cf26523eeb9d4326ac5e7cf56f595d1042a3c))
* add videos to home page ([#77](https://github.com/oaknational/oak-ai-lesson-assistant/issues/77)) ([54edf80](https://github.com/oaknational/oak-ai-lesson-assistant/commit/54edf80b58f100d8c6a16b4ea6384c6accf70de0))
* give user feedback when download email is sent ([#89](https://github.com/oaknational/oak-ai-lesson-assistant/issues/89)) ([573c542](https://github.com/oaknational/oak-ai-lesson-assistant/commit/573c542d60b2701d3add905a89b30b9b5f590100))

## [1.5.1](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.5.0...v1.5.1) (2024-09-04)


### Bug Fixes

* delete client side feature flag ([#71](https://github.com/oaknational/oak-ai-lesson-assistant/issues/71)) ([82d26a2](https://github.com/oaknational/oak-ai-lesson-assistant/commit/82d26a2ff37d7449e7429fd98ffd7c444eb9b550))
* downloads page auth check ([#73](https://github.com/oaknational/oak-ai-lesson-assistant/issues/73)) ([e123cc9](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e123cc974973fd2370d235ed63306eed3e19be60))
* include patch schema in llm response schema ([#45](https://github.com/oaknational/oak-ai-lesson-assistant/issues/45)) ([1c6c1ac](https://github.com/oaknational/oak-ai-lesson-assistant/commit/1c6c1ac63bf47422c5860f9680e615510af122dc))

# [1.5.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.4.0...v1.5.0) (2024-09-04)


### Bug Fixes

* fix flash of demo banner when loading ([c8a63e0](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c8a63e0383757cbb4853f682269f3976cba4312b))
* mobile launch bugs fixes ([#52](https://github.com/oaknational/oak-ai-lesson-assistant/issues/52)) ([d828c11](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d828c11d4cac4a51d0d2656c797e7e90b38df410))
* remove sideways scroll on mobile ([7038e70](https://github.com/oaknational/oak-ai-lesson-assistant/commit/7038e7048611b243874c58c9d917d8a4f299aab7))


### Features

* add homepage link to AI blogs ([d77ab56](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d77ab56a19729b31ffabb2f7d9c98ca2bd7899b8))
* add main oak posthog client ([#60](https://github.com/oaknational/oak-ai-lesson-assistant/issues/60)) ([c56fa84](https://github.com/oaknational/oak-ai-lesson-assistant/commit/c56fa8450f153584920b8d0b3cb499e35cb6b4f6))
* bring nav in line with latest design ([49c8689](https://github.com/oaknational/oak-ai-lesson-assistant/commit/49c8689102eb4d211f7580b19280e2381bc4ca39))
* help text when downloading an unfinished lesson ([7ef494f](https://github.com/oaknational/oak-ai-lesson-assistant/commit/7ef494fa5d412d17acc5c06f1fd340bf8adacd61))
* launch ([#61](https://github.com/oaknational/oak-ai-lesson-assistant/issues/61)) ([d9b19f7](https://github.com/oaknational/oak-ai-lesson-assistant/commit/d9b19f722d79fa67528662c696dfcfdf69d9077e))
* new home page copy ([#54](https://github.com/oaknational/oak-ai-lesson-assistant/issues/54)) ([a17a685](https://github.com/oaknational/oak-ai-lesson-assistant/commit/a17a6851c884662a7993e29e376c05d03675168b))
* override styles for gleap button ([4f57760](https://github.com/oaknational/oak-ai-lesson-assistant/commit/4f57760884b5cf11e24bf006fb6b19f3af1759a8))

# [1.4.0](https://github.com/oaknational/oak-ai-lesson-assistant/compare/v1.3.3...v1.4.0) (2024-09-04)


### Bug Fixes

* large chat history ([#39](https://github.com/oaknational/oak-ai-lesson-assistant/issues/39)) ([de21cef](https://github.com/oaknational/oak-ai-lesson-assistant/commit/de21ceff838ea9e3fb7c0826ec128ee39099a63f))
* mobile view progress ([#50](https://github.com/oaknational/oak-ai-lesson-assistant/issues/50)) ([e0955c0](https://github.com/oaknational/oak-ai-lesson-assistant/commit/e0955c0b5fedd1542d4947da46a94da156095304))


### Features

* **feedback:** chat and message level feedback ([#20](https://github.com/oaknational/oak-ai-lesson-assistant/issues/20)) ([bd4462a](https://github.com/oaknational/oak-ai-lesson-assistant/commit/bd4462aa0e212bb9d10b25868d25abb09b7e6428))

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
