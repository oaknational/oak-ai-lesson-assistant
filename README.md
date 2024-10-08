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
  - [Postgres setup](#postgres-setup)
    - [With Docker](#with-docker)
    - [With Homebrew](#with-homebrew)
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

## Postgres setup

Instructions are available for both Homebrew and Dockerized setups.

### With Docker

Navigate to the `packages/db` directory:

```shell
cd packages/db
```

Build and run the Docker container to create a database named `oai`, with the username and password both as `oai`, bound to port 5432. It will also install `pgvector` and `postgresql-contrib`.

```shell
pnpm run docker-bootstrap
```

To run `psql`, ssh into the box using:

```shell
pnpm run docker-psql
```

To seed the database:

```shell
pnpm run db-push
pnpm run db-seed
```

From the repo root, then run:

```shell
pnpm run prompts
```

To reset and start fresh:

```shell
pnpm run docker-reset
```

To import a snapshot of production or staging databases into your local instance:

```shell
pnpm run docker-reset
pnpm run db-restore-from:prd
```

where `:prd` can be either `:prd` or `:stg` (the Doppler environments).

### With Homebrew

Install and start PostgreSQL:

```shell
brew install postgresql
brew services start postgresql
createdb oai
psql
```

In PSQL:

```sql
sudo -u postgres psql
CREATE USER oai WITH ENCRYPTED PASSWORD 'oai';
GRANT ALL PRIVILEGES ON DATABASE oai TO oai;
ALTER USER oai WITH SUPERUSER;
```

**Note:** Running in superuser mode is not ideal; consider separate users for migrations and queries.

Exit PSQL using `\quit`.

Install PG Vector:

```shell
brew install pgvector
psql postgres
CREATE EXTENSION vector;
```

Quit PSQL.

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
