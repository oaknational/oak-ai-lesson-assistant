# Oak AI Lesson Assistant

![License: MIT](https://img.shields.io/badge/license-MIT-brightgreen)

> **Disclaimer**  
> This project is intended primarily for internal use by Oak National Academy. While the repository is public, there is no expectation for external users to run the application. The installation instructions and other documentation are currently tailored for internal use and may not be comprehensive for external users.

Oak AI Lesson Assistant is a project focused on experimenting with AI models and their applications. This repository contains several components designed to facilitate AI research and development.

## Table of contents

- [Oak AI Lesson Assistant](#oak-ai-lesson-assistant)
  - [Table of contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Turborepo](#turborepo)
  - [Postgres Setup](#postgres-setup)
    - [Prerequisites:](#prerequisites-1)
    - [Steps](#steps)
  - [Doppler](#doppler)
  - [Start the development server](#start-the-development-server)
  - [Testing](#testing)
    - [Jest tests](#jest-tests)
    - [End-to-end tests](#end-to-end-tests)
      - [Playwright tags](#playwright-tags)
    - [Testing in VSCode](#testing-in-vscode)
  - [Release process](#release-process)
  - [PNPM / dependency problems](#pnpm--dependency-problems)
  - [External contributions](#external-contributions)
    - [Security](#security)
    - [Contributing to the code](#contributing-to-the-code)
  - [Open source acknowledgements](#open-source-acknowledgements)
  - [License](#license)

## Introduction

Oak AI Lesson Assistant is a project designed to facilitate the development and testing of AI tools and models. The project is structured as a Turborepo monorepo, leveraging various open-source tools and libraries.

## Installation

### Prerequisites

With [pnpm](https://pnpm.io/8.x/installation) installed, run the following command from the project root:

```shell
pnpm install -r
```

### Turborepo

This application is structured as a Turborepo monorepo. Install the "turbo" command globally:

```shell
pnpm install turbo --global
```

## Postgres Setup

### Prerequisites:
- Docker installed.

### Steps

1. Navigate to the `packages/db` directory:

```shell
cd packages/db
```

2. Build and run the Docker container to create a database named `oai`, with the username and password both as `oai`, bound to port 5432. It will also install `pgvector` and `postgresql-contrib`.

```shell
pnpm run docker-bootstrap
```

3. Seed your database, to do this you have two options:

3a. Replicate Production

This will import the schema and tables from production. Note: due to the size of the production database this could take a significant amount of time.

```shell
pnpm run db-restore-from:prd
```
3b. Local Prisma with Live Environment Seed

1. Apply the Prisma schema to your local database:

```shell
pnpm run db-push
```

2. Remove the snippets table from tables.txt (Snippets is the largest table in the database and takes the majority of the time).

3. Seed from stg/prd
where `:prd` can be either `:prd` or `:stg` (the Doppler environments).

```shell
pnpm run db-seed-local-from:stg
```

To run `psql`, ssh into the box using:

```shell
pnpm run docker-psql
```

If you need to reset and start fresh:

```shell
pnpm run docker-reset
```

## Doppler

We use [Doppler](https://doppler.com) for secrets management. To run the application, you need to set up the Doppler CLI.

Navigate to the turborepo root:

```shell
brew install dopplerhq/cli/doppler
doppler login
doppler setup
pnpm doppler:pull:dev
```

This command copies the Doppler environment variables for the dev environment to a local `.env` file. When secrets change, run this command again.

## Start the development server

Start the server with:

```shell
pnpm dev
```

Then visit [http://localhost:2525](http://localhost:2525).

## Testing

### Jest tests

The `apps/nextjs` and `packages/aila` projects have Jest tests. Run all tests using:

```shell
pnpm test
```

### End-to-end tests

Ensure the dev server is running with `pnpm dev`. Use the Playwright UI to select and run individual tests interactively.

```shell
pnpm test-e2e-ui
```

To run tests headlessly in the CLI:

```shell
pnpm test-e2e
```

#### Playwright tags

Our Playwright tests are organised with tags:

- `@authenticated`: Tests with this tag use a pre-created test user, reused without cleanup between tests.
- `@openai`: Indicates that the test calls the OpenAI API without a mock. These are excluded from CI runs due to potential slowness, flakiness, or expense. We aim to use mocks for these tests in the future.

### Testing in VSCode

Install the Jest and Playwright extensions recommended in the workspace config. Testing icons should appear in the gutter to the left of each test when viewing a test file. Clicking the icon will run the test. The testing tab in the VSCode nav bar provides an overview.

## Release process

To create a new release, follow these steps:

1. Create a new **pre-release**:

   1. Go to [this page](https://github.com/oaknational/ai-beta/releases/new).
   2. Select a new tag with the following syntax `v{sem_ver}-rc`. If there is more than one pre-release for this version, use `v{sem_ver}-rcX`, e.g., `v1.2.4-rc3`.
   3. Click “Generate release notes”.
   4. Select **Set as a pre-release**.
   5. Click “Publish release”.

2. Wait for a pull request titled **Release candidate v1.2.4-rc3**:

   1. This pull request will have a deployment to Vercel, which will appear in the PR request messages.
   2. Test this deployment.

3. When ready to **release**:
   1. Merge the request with a 'Merge commit'.

## PNPM / dependency problems

If you encounter issues with dependencies causing errors, try using PNPM's prune command:

```shell
pnpm prune
pnpm install -r
```

If issues persist, remove all `node_modules` folders in all packages and apps:

```shell
turbo clean
pnpm install -r
```

You may also want to clear your global `npx` cache:

```shell
rm -rf ~/.npm/_npx
```

## External contributions

### Security

Please see our [security.txt](https://www.thenational.academy/.well-known/security.txt) file.

### Contributing to the code

We don't currently accept external contributions to the codebase, but this is under review, and we hope to find an approach that works for us and the community.

## Open source acknowledgements

As with all web projects, we depend on open-source libraries maintained by others. While it's not practical to acknowledge them all, we express our gratitude for the contributions and efforts of the OSS community.

## License

Unless stated otherwise, the codebase is released under the [MIT License][mit]. This covers both the codebase and any sample code in the documentation. Where any Oak National Academy trademarks or logos are included, these are not released under the [MIT License][mit] and should be used in line with [Oak National Academy brand guidelines][brand].

Any documentation included is © [Oak National Academy][oak] and available under the terms of the [Open Government Licence v3.0][ogl], except where otherwise stated.

[mit]: LICENCE
[oak]: https://www.thenational.academy/
[ogl]: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
[brand]: https://support.thenational.academy/using-the-oak-brand
