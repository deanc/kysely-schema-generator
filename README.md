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

**Option 3 (Save types to a file)**

Generated types are automatically saved, and an `interface DB` is exported for you to use. If you want to save types into a custom output file, you can do that as well.

```sh
kysely-schema-generator -p /path/to/.env -o ./db/db.d.ts
```

Note if command can't be found you might need to use your package manager to run it (e.g. `pnpm exec kysely-schema-generator`)

To display help for commands, run:

```sh
kysely-schema-generator -h
```

### Using the type definations

```ts
import { DB } from "@deanc/kysely-schema-generator"
import { Kysely, MysqlDialect } from "kysely"
import { createPool } from "mysql2"

const dialect = new MysqlDialect({
  pool: createPool({
    database: "test",
    host: "localhost",
    user: "user",
    password: "123",
    port: 3306,
    connectionLimit: 10,
  }),
})

export const db = new Kysely<DB>({
  dialect,
})
```

# Todo

(Contributions very welcome)

- Ensure all MySQL field types are mapped correctly
- Add support for other database engines (Postgres, SQLite at least)
- Add test coverage
