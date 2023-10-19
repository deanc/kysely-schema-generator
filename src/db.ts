import connectToDatabase, { Knex } from "knex"

let db: Knex

export const getDBConnection = async (
  connectionString: string,
): Promise<Knex> => {
  if (db) {
    return db
  }
  db = await connectToDatabase({
    client: "mysql2",
    connection: connectionString,
  })
  return db
}

export const getCreateTableStatement = async (
  db: Knex,
  tableName: string,
): Promise<string> => {
  const createTable = await db.raw(
    `SHOW CREATE TABLE ${tableName.replace(/[^\w]+/i, "")}`,
  )
  return createTable[0][0]["Create Table"]
}
