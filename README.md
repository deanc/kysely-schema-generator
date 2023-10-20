# Kysely schema generator

A very quickly hacked-together schema generator for [Kysely](https://kysely.dev/) which (currently) only
supports MySQL.

## Installation

With your package manager of choice install:

```sh
npm install --save @deanc/kysely-schema-generator
yarn add @deanc/kysely-schema-generator
pnpm add @deanc/kysely-schema-generator
```

# Configuration

Either in your project root or somewhere else create a `.env` file with a `DATABASE_URL` environmental variable:

```shell
DATABASE_URL='mysql://user:password@host:3306/databaseName'
```

## Usage

**Option 1 (.env in project root and run)**

```sh
kysely-schema-generator
```

**Option 2 (.env somewhere else)**

```sh
kysely-schema-generator -p /path/to/.env
```

Note if command can't be found you might need to use your package manager to run it (e.g. `pnpm exec kysely-schema-generator`)
