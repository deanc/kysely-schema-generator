import { columnTypeToType } from "./helpers"
import { DBEngine } from "./type-map"

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {})
})

describe("columnTypeToType", () => {
  it("throws if column type is not found", () => {
    expect(() => columnTypeToType("mysql", "fakeColumn")).toThrow()
  })

  it("throws if db engine is not valid", () => {
    const engine = "fakeEngine" as unknown as DBEngine
    expect(() => columnTypeToType(engine, "VARCHAR")).toThrow()
  })

  it("returns the correct mapping for a known type", () => {
    expect(columnTypeToType("mysql", "VARCHAR")).toBe("string")
  })

  it("ENUM and SET map to string literals", () => {
    expect(columnTypeToType("mysql", "ENUM")).toBe("string-literal")
  })

  it("ENUM and SET map to their actual string literals with an expression", () => {
    expect(
      columnTypeToType("mysql", "ENUM", {
        type: "expr_list",
        value: [{ value: "a" }, { value: "b" }, { value: "c" }],
      }),
    ).toBe(`'a' | 'b' | 'c'`)
  })

  it("BIGINT UNSIGNED maps to string", () => {
    expect(
      columnTypeToType("mysql", "BIGINT", undefined, { unsigned: true }),
    ).toBe("string")
  })
})
