jest.mock("prettier", () => ({
  format: async (value: string) => value,
}))

import { GenericContainer, Wait } from "testcontainers"
import type { StartedTestContainer } from "testcontainers"
import mysql from "mysql2/promise"

import { getCreateTableStatement, getDBConnection } from "./db"
import { generateDatabase, generateTable } from "./transform"
import type { TableAndTypes } from "./types"

jest.setTimeout(120_000)

describe("integration", () => {
  let container: StartedTestContainer | undefined
  let connectionString: string

  beforeAll(async () => {
    try {
      container = await new GenericContainer("mysql:8.0")
        .withEnvironment({
          MYSQL_ROOT_PASSWORD: "password",
          MYSQL_DATABASE: "kysely_test",
        })
        .withExposedPorts(3306)
        .withWaitStrategy(Wait.forLogMessage(/ready for connections/i))
        .start()

      const host = container.getHost()
      const port = container.getMappedPort(3306)
      connectionString = `mysql://root:password@${host}:${port}/kysely_test`

      // MySQL can accept connections slightly after the "ready" log.
      await waitForMysql(connectionString)
    } catch (error) {
      throw error
    }
  })

  afterAll(async () => {
    if (container) {
      await container.stop()
    }
  })

  it("generates types from a real database", async () => {
    const db = await getDBConnection(connectionString)
    const usersTableName = "integration_users"
    const blobsTableName = "integration_blobs"

    try {
      await db.raw("DROP TABLE IF EXISTS ??", [usersTableName])
      await db.raw("DROP TABLE IF EXISTS ??", [blobsTableName])
      await db.raw(
        `CREATE TABLE ?? (
          id INT NOT NULL AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          status ENUM('active','inactive') NOT NULL,
          created_at TIMESTAMP NULL,
          is_admin TINYINT(1) NOT NULL,
          balance DECIMAL(10,2) NOT NULL,
          PRIMARY KEY (id)
        )`,
        [usersTableName],
      )
      await db.raw(
        `CREATE TABLE ?? (
          id INT NOT NULL AUTO_INCREMENT,
          payload JSON NULL,
          bin BLOB NULL,
          PRIMARY KEY (id)
        )`,
        [blobsTableName],
      )

      const [createSqlUsers, createSqlBlobs] = await Promise.all([
        getCreateTableStatement(db, usersTableName),
        getCreateTableStatement(db, blobsTableName),
      ])
      const resultUsers = generateTable(createSqlUsers, {
        tinyint1AsBoolean: true,
      })
      const resultBlobs = generateTable(createSqlBlobs, {
        tinyint1AsBoolean: true,
      })

      const generated = await generateDatabase(
        [resultUsers, resultBlobs].filter(Boolean) as TableAndTypes[],
        {
          format: false,
        },
      )

      expect(generated).toContain("interface IntegrationUsersTable")
      expect(generated).toContain("id: Generated<number>")
      expect(generated).toContain("name: string")
      expect(generated).toContain("status: 'active' | 'inactive'")
      expect(generated).toContain("created_at: string | null")
      expect(generated).toContain("is_admin: boolean")
      expect(generated).toContain("balance: number")

      expect(generated).toContain("interface IntegrationBlobsTable")
      expect(generated).toContain("payload: unknown | null")
      expect(generated).toContain("bin: Buffer | null")
    } finally {
      await db.raw("DROP TABLE IF EXISTS ??", [usersTableName])
      await db.raw("DROP TABLE IF EXISTS ??", [blobsTableName])
      await db.destroy()
    }
  })
})

const waitForMysql = async (url: string) => {
  const maxAttempts = 30
  const delayMs = 500
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const conn = await mysql.createConnection(url)
      await conn.query("SELECT 1")
      await conn.end()
      return
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw lastError
}
