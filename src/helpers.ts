import { camelCase, startCase } from "lodash"
import type { AST, Create } from "node-sql-parser"

import { typeMap } from "./type-map"

export const isCreateStatement = (ast: AST | AST[]): ast is Create =>
  ast && !Array.isArray(ast) && ast.type === "create"

export const pascalCase = (str: string): string =>
  startCase(camelCase(str)).replace(/ /g, "")

export const columnTypeToType = (
  columnType: string,
  expression?: {
    type: string
    value?: { value: string }[]
  },
): string => {
  if (columnType in typeMap) {
    if (
      ["ENUM", "SET"].includes(columnType) &&
      expression?.type === "expr_list" &&
      expression.value
    ) {
      return expression.value.map((val) => `'${val.value}'`).join(" | ")
    }

    return typeMap[columnType]
  }
  console.error(expression)
  throw new Error(`unmapped columnType ${columnType}`)
}
