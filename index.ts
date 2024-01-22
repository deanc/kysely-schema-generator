#!/usr/bin/env node
import { program } from "commander"
import { config } from "dotenv"

import { getCreateTableStatement, getDBConnection } from "./src/db"
import { writeFile } from "./src/file-writer"
import { generateDatabase, generateTable } from "./src/transform"
import { TableAndTypes } from "./src/types"
import { IArgs } from "./src/types"

export * from "./db"

const envPath = `${process.cwd()}/.env`
async function run(args: IArgs) {
  if ("pathEnv" in args) {
    config({ path: `${args.pathEnv}/.env` })
  } else {
    config({ path: envPath })
  }

  console.log({ args })

  if (!process.env.DATABASE_URL) {
    throw Error("No valid DATABASE_URL process.env found")
  }

  const dbName = process.env.DATABASE_URL.split("/").pop()
  const db = await getDBConnection(process.env.DATABASE_URL)
  const tables = await db
    .select("table_name as table_name")
    .from("information_schema.tables")
    .where("table_schema", dbName)

  const tableNames = tables.map((res) => res.table_name)

  const tableStatements = await Promise.all(
    tableNames.map((tableName) => getCreateTableStatement(db, tableName)),
  )
  const final = tableStatements
    .map((sql) => generateTable(sql))
    .filter((val) => val) as TableAndTypes[] // removed undefined stuff

  const generatedString = await generateDatabase(final)

  if (args.print) console.log(generatedString) // prints types to console if arg. provided
  writeFile({ outFile: args.outFile, content: generatedString }) // writes generated types to disk
  db.destroy()
}

program
  .option("-p, --path-env <path>", "path to .env file")
  .option("-o, --out-file <path>", "path to file to save output")
  .option("--print", "prints generated types to console")
program.action(run)
program.parse(process.argv)
