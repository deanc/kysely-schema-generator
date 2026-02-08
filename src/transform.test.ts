jest.mock("prettier", () => ({
  format: async (value: string) => value,
}))

import { generateTable } from "./transform"

describe("generateTable", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  it("generates types for common column shapes", () => {
    const sql = `
      CREATE TABLE users (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        nickname VARCHAR(255) NULL,
        status ENUM('active','inactive') NOT NULL,
        created_at TIMESTAMP NULL
      )
    `

    const result = generateTable(sql)
    expect(result).toBeDefined()
    expect(result?.table).toBe("users")
    expect(result?.tableTypeName).toBe("Users")

    const types = result?.types ?? ""
    expect(types).toContain("id: Generated<number>")
    expect(types).toContain("name: string")
    expect(types).toContain("nickname: string | null")
    expect(types).toContain("status: 'active' | 'inactive'")
    expect(types).toContain("created_at: string | null")
  })

  it("maps TINYINT(1) to boolean when enabled", () => {
    const sql = `
      CREATE TABLE flags (
        is_active TINYINT(1) NOT NULL
      )
    `

    const result = generateTable(sql, { tinyint1AsBoolean: true })
    expect(result?.types).toContain("is_active: boolean")
  })

  it("skips non-create statements", () => {
    expect(() => generateTable("SELECT 1")).toThrow()
  })
})
