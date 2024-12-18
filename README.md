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
    - [Prerequisites](#prerequisites-1)
    - [Steps](#steps)
    - [Utility Commands](#utility-commands)
  - [Doppler](#doppler)
  - [Start the development server](#start-the-development-server)
  - [Testing](#testing)
    - [Jest tests](#jest-tests)
    - [End-to-end tests](#end-to-end-tests)
      - [Playwright tags](#playwright-tags)
    - [Testing in VSCode](#testing-in-vscode)
  - [Standards](#standards)
    - [Typescript](#typescript)
    - [ES Modules](#esmodules)
    - [CommonJS](#commonjs)
  - [Code quality](#quality)
    - [Sonar](#sonar)
    - [ESLint](#eslint)
    - [Prettier](#prettier)
    - [Tsconfig]("#tsconfig)
    - [Dependency cruiser](#dependency-cruiser)
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

### Prerequisites

- This project set up following the Installation steps.
- Docker installed.
- Optional: A Postgres GUI tool (such as pgAdmin or Postico) to view the data.

### Steps

1. Navigate to the `packages/db` directory:

```shell
cd packages/db
```

2. Build and run the Docker container to create a database named `oai`, with the username and password both as `oai`, bound to port 8432. It will also install `pgvector` and `postgresql-contrib`.

```shell
pnpm run docker-bootstrap
```

3. Seed your database, to do this you have two options:

   3a. Replicate Production/Staging (Slow)

   This will import the schema and tables from production. Note: due to the size of the production database this could take a significant amount of time.

   ```shell
   pnpm run db-restore-from:prd or pnpm run db-restore-from:stg
   ```

   3b. Local Prisma with Essential Tables Seeded from a Live Environment (Fast)

   1. Apply the Prisma schema to your local database:

   ```shell
   pnpm run db-push
   ```

   2. Seed from stg/prd (where `:prd` can be either `:prd` or `:stg`, matching the Doppler environments). This will only seed the apps table and lesson-related tables used for RAG.

   ```shell
   pnpm run db-seed-local-from:prd
   ```

### Utility Commands

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

- `@common-auth`: Tests with this tag use the same test user ("typical" persona). Test run concurrently so shouldn't modify user state.
- `@openai`: Indicates that the test calls the OpenAI API without a mock. These are excluded from CI runs due to potential slowness, flakiness, or expense. We aim to use mocks for these tests in the future.

### Testing in VSCode

Install the Jest and Playwright extensions recommended in the workspace config. Testing icons should appear in the gutter to the left of each test when viewing a test file. Clicking the icon will run the test. The testing tab in the VSCode nav bar provides an overview.

## Standards

### Typescript

By default, we develop in Typescript and aim to be up to date with the latest version. New code should default to being written in Typescript unless it is not possible.

### ES Modules

All packages are configured to be ES Modules.

### CommonJS

Currently NextJS, Tailwind and some other tools has some code which needs to be CommonJS. For these files, you should use the .cjs extension so that the correct linting rules are applied.

## Code quality

We use several tools to ensure code quality in the codebase and for checks during development. These checks run on each PR in Github to ensure we maintain good code quality. You can also run many of these checks locally before making a PR.

### Sonar

If you are using VS Code or Cursor, consider installing the SonarQube for IDE extension. This will give you feedback while you were as to any code quality or security issues that it has detected.

If you would like to run a Sonar scan locally, use the following command:

```shell
pnpm sonar
```

You will need to log in to Sonar when prompted the first time. This will generate a full report for you of your local development environment. Usually it is easier to make a PR and have this run for you automatically.

### ESLint

We have a single ESLint config for the whole monorepo. You will find it in packages/eslint-config.

This is using the latest version of ESLint and you should note that the config file format has changed to the "Flat file" config in version 9.

Each package does not have its own ESLint config by default. Instead we have a single config file, with regex path matchers to turn on/off rules that are specific for each package. This can be overridden and you can see an example of that in the logger package.

Each package specifies in its package.json file that it should use this shared config and there is a root ESLint config file for the whole mono repo which specifies that it should do the same.

To check for linting errors, run the following command:

```shell
pnpm lint
```

If you want to check for linting errors in an individual package, cd into that package and run the same command.

### Prettier

We also have a single Prettier config, which is located in packages/prettier-config. In general there should be no need to change this on a per-package basis.

### Tsconfig

We have an overall tsconfig.json file which specifies the overall Typescript configuration for the project. Then each package extends from it.

You can check the codebase for any Typescript issues by running the following command:

```shell
pnpm type-check
```

## Release process

The current release process is fully documented [in Notion](https://www.notion.so/oaknationalacademy/Branch-Strategy-and-Release-Process-ceeb32937af0426ba495565288e18844?pvs=4), but broadly works as follows:

- Work is completed in branches that are merged to `main` using squash merge, with the commit message (set by the PR title) matching [conventional commit convention](https://www.conventionalcommits.org/en/v1.0.0/).
- When ready to release, a 'release candidate' branch is created from `main` and a PR opened to merge that branch into `production` (where the live site is deployed from).
- The PR then contains all the commits to be released. This is manually tested.
- Once approved, the PR is merged into `production` and [semantic release](https://github.com/semantic-release/semantic-release?tab=readme-ov-file) creates a tagged version commit, also updating the change log from the merged commits. The `production` branch is the merged back into `main` to ensure tags, change log, and hotfixes (raised to `production` directly from a working branch) are on the `main` branch.

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
