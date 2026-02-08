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

## Configuration

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

**Option 3 (write output to a file)**

```sh
kysely-schema-generator -o ./kysely-db.ts
```

**Option 4 (override database/schema name)**

```sh
kysely-schema-generator -d my_database
```

**Option 5 (include or exclude specific tables)**

```sh
kysely-schema-generator -t users,orders
kysely-schema-generator -x audit_logs,temp_records
```

**Option 6 (disable formatting)**

```sh
kysely-schema-generator --no-format
```

**Option 7 (map TINYINT(1) to boolean)**

```sh
kysely-schema-generator --tinyint1-as-boolean
```

## Options

```
-p, --path-env <path>           path to .env file
-o, --output <path>             write output to a file
-d, --database <name>           override database/schema name
-t, --tables <list>             comma-separated list of tables to include
-x, --exclude-tables <list>     comma-separated list of tables to exclude
    --no-format                 disable output formatting
    --tinyint1-as-boolean       map TINYINT(1) columns to boolean
-h, --help                      display help
```

## Example Output

Given a `users` table:

```sql
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  status ENUM('active','inactive') NOT NULL,
  created_at TIMESTAMP NULL
)
```

The generator outputs:

```ts
import { Generated, Insertable, Selectable, Updateable } from 'kysely'

interface UsersTable {
  id: Generated<number>
  email: string
  status: 'active' | 'inactive'
  created_at: string | null
}
export type Users = Selectable<UsersTable>
export type NewUsers = Insertable<UsersTable>
export type UsersUpdate = Updateable<UsersTable>

export interface DB {
  users: Users
}
```

## Integration Test (MySQL)

This test uses Testcontainers and will spin up MySQL automatically (Docker must be running).

```sh
pnpm run test:integration
```

## Troubleshooting

- **No valid DATABASE_URL process.env found**: ensure your `.env` file is in the path provided via `--path-env`, or in the project root, and contains a valid `DATABASE_URL`.
- **Testcontainers runtime unavailable**: make sure Docker is running and accessible from your terminal.
- **Permissions errors**: the MySQL user in the URL needs access to `information_schema` and the target database.

## Limitations

- MySQL only (no Postgres/SQLite support yet).
- Some MySQL types may still be missing or mapped conservatively (e.g. JSON uses `unknown`).
- Numeric precision/scale is not currently used to refine type output.

## Development

```sh
pnpm install
pnpm test
pnpm run test:integration
pnpm run lint
```

## Todo

(Contributions very welcome)

- Ensure all MySQL field types are mapped correctly
- Add support for other database engines (Postgres, SQLite at least)
- Add test coverage
- (Maybe) offer option to write to disk instead of relying on user to capture
