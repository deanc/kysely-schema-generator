import { program } from "commander"
import { config } from "dotenv"

import { getCreateTableStatement, getDBConnection } from "./src/db"
import { generateDatabase, generateTable } from "./src/transform"
import { TableAndTypes } from "./src/types"

const envPath = `${process.cwd()}/.env`
async function run(args: object) {
  if ("pathEnv" in args) {
    config({ path: `${args.pathEnv}/.env` })
  } else {
    config({ path: envPath })
  }

  if (!process.env.DATABASE_URL) {
    throw Error("No valid DATABASE_URL process.env found")
  }

  const dbName = process.env.DATABASE_URL.split("/").pop()
  const db = await getDBConnection(process.env.DATABASE_URL)
  const tables = await db
    .select("table_name")
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
  console.log(generatedString)
  db.destroy()
}

program.option("-p, --path-env <path>", "path to .env file")
program.action(run)
program.parse(process.argv)
