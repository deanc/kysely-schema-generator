#!/usr/bin/env node

import { program } from "commander"
import { ConnectionString } from "connection-string"
import { config } from "dotenv"
import { writeFile } from "fs/promises"

import { getCreateTableStatement, getDBConnection } from "./src/db"
import { generateDatabase, generateTable } from "./src/transform"
import { TableAndTypes } from "./src/types"
import type { Knex } from "knex"

const envPath = `${process.cwd()}/.env`
type RunOptions = {
  pathEnv?: string
  output?: string
  database?: string
  tables?: string
  excludeTables?: string
  noFormat?: boolean
  tinyint1AsBoolean?: boolean
}

async function run(options: RunOptions) {
  if (options.pathEnv) {
    config({ path: `${options.pathEnv}/.env` })
  } else {
    config({ path: envPath })
  }

  if (!process.env.DATABASE_URL) {
    throw Error("No valid DATABASE_URL process.env found")
  }

  let db: Knex | undefined
  try {
    const parsed = new ConnectionString(process.env.DATABASE_URL)
    const dbName = options.database ?? parsed.path?.[0]
    if (!dbName) {
      throw Error("DATABASE_URL does not include a database name")
    }
    db = await getDBConnection(process.env.DATABASE_URL)
    const dbConn = db
    const tables = await dbConn
      .select("table_name as table_name")
      .from("information_schema.tables")
      .where("table_schema", dbName)

    const tableNames = tables.map((res) => res.table_name)
    const includeTables = options.tables
      ? new Set(options.tables.split(",").map((name) => name.trim()))
      : null
    const excludeTables = options.excludeTables
      ? new Set(options.excludeTables.split(",").map((name) => name.trim()))
      : null
    const filteredTableNames = tableNames.filter((tableName) => {
      if (includeTables && !includeTables.has(tableName)) {
        return false
      }
      if (excludeTables && excludeTables.has(tableName)) {
        return false
      }
      return true
    })

    const tableStatements = await Promise.all(
      filteredTableNames.map((tableName) =>
        getCreateTableStatement(dbConn, tableName),
      ),
    )
    const final = tableStatements
      .map((sql) =>
        generateTable(sql, {
          tinyint1AsBoolean: Boolean(options.tinyint1AsBoolean),
        }),
      )
      .filter((val) => val) as TableAndTypes[] // removed undefined stuff

    const generatedString = await generateDatabase(final, {
      format: options.noFormat ? false : true,
    })
    if (options.output) {
      await writeFile(options.output, generatedString, "utf8")
    } else {
      console.log(generatedString)
    }
  } finally {
    if (db) {
      await db.destroy()
    }
  }
}

program.option("-p, --path-env <path>", "path to .env file")
program.option("-o, --output <path>", "write output to a file")
program.option("-d, --database <name>", "override database/schema name")
program.option(
  "-t, --tables <list>",
  "comma-separated list of tables to include",
)
program.option(
  "-x, --exclude-tables <list>",
  "comma-separated list of tables to exclude",
)
program.option("--no-format", "disable output formatting")
program.option(
  "--tinyint1-as-boolean",
  "map TINYINT(1) columns to boolean",
)
program.action(async (options: RunOptions) => {
  try {
    await run(options)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
})
program.parse(process.argv)
