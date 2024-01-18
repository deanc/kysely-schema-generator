import { Parser } from "node-sql-parser"
import type { AST } from "node-sql-parser"
import { format } from "prettier"

import { columnTypeToType, isCreateStatement, pascalCase } from "./helpers"
import { TableAndTypes } from "./types"

export const generateTable = (sql: string): TableAndTypes | undefined => {
  const parser = new Parser()
  const ast = parser.astify(sql) as AST[]

  const info = ast
  if (!isCreateStatement(info)) {
    console.error("Passed in an invalid CREATE statement", ast)
    throw new Error("Passed in an invalid CREATE statement")
  }

  if (!info.table || !info.create_definitions) {
    return
  }

  const originalTableName = info.table[0].table
  const camelCaseTable = pascalCase(originalTableName)

  return {
    table: originalTableName,
    tableTypeName: camelCaseTable,
    types: `interface ${camelCaseTable}Table {
              ${generateFields(info.create_definitions.flat())}
          }
          export type ${camelCaseTable} = Selectable<${camelCaseTable}Table>
          export type New${camelCaseTable} = Insertable<${camelCaseTable}Table>
          export type ${camelCaseTable}Update = Updateable<${camelCaseTable}Table>\n`,
  }
}

const generateFields = (fields: any[]): string => {
  const f = fields
    .filter((field) => field.column)
    .map((field) => {
      const canBeNull = field.nullable?.type !== "not null"
      const dataTypes = [
        columnTypeToType(
          "mysql",
          field.definition.dataType,
          field.definition.expr,
        ),
      ]

      if (canBeNull) {
        dataTypes.push("null")
      }

      if (field.column) {
        if (field.auto_increment) {
          return `${field.column?.column}: Generated<${dataTypes.join(" | ")}>`
        }
        return `${field.column?.column}: ${dataTypes.join(" | ")}`
      }
    })

  return f.join("\n")
}

export const generateDatabase = async (
  tableAndTypes: TableAndTypes[],
): Promise<string> => {
  const typesString = tableAndTypes.map(({ types }) => `${types}\n`).join("\n")
  const databaseString = [`\nexport interface DB {`]
  databaseString.push(
    ...tableAndTypes.map(
      ({ table, tableTypeName }) => `${table}: ${tableTypeName}`,
    ),
  )
  databaseString.push("}")

  const str = `${typesString}\n${databaseString.join("\n")}`
  const formattedStr = await format(str, { semi: false, parser: "typescript" })
  return formattedStr
}
