import { Parser } from "node-sql-parser"
import type { AST, Create } from "node-sql-parser"
import { format } from "prettier"

import { columnTypeToType, isCreateStatement, pascalCase } from "./helpers"
import { TableAndTypes } from "./types"

type GenerateTableOptions = {
  tinyint1AsBoolean?: boolean
}

type GenerateDatabaseOptions = {
  format?: boolean
}

type CreateField = {
  column?: {
    column?: string
  }
  nullable?: {
    type?: string
  }
  auto_increment?: boolean
  definition: {
    dataType: string
    expr?: {
      type: string
      value?: { value: string }[]
    }
    unsigned?: boolean
    length?: number | { value?: number }
  }
}

export const generateTable = (
  sql: string,
  options: GenerateTableOptions = {},
): TableAndTypes | undefined => {
  const parser = new Parser()
  const ast = parser.astify(sql) as AST | AST[]
  const info = Array.isArray(ast) ? (ast[0] as Create | AST) : ast

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
              ${generateFields(info.create_definitions.flat(), options)}
          }
          export type ${camelCaseTable} = Selectable<${camelCaseTable}Table>
          export type New${camelCaseTable} = Insertable<${camelCaseTable}Table>
          export type ${camelCaseTable}Update = Updateable<${camelCaseTable}Table>\n`,
  }
}

const generateFields = (
  fields: CreateField[],
  options: GenerateTableOptions,
): string => {
  const f = fields
    .filter((field) => field.column)
    .map((field) => {
      const canBeNull = field.nullable?.type !== "not null"
      const lengthValue =
        typeof field.definition?.length === "number"
          ? field.definition.length
          : field.definition?.length?.value
      const tinyintAsBoolean =
        options.tinyint1AsBoolean &&
        field.definition?.dataType === "TINYINT" &&
        lengthValue === 1
      const dataTypes = [
        tinyintAsBoolean
          ? "boolean"
          : columnTypeToType(
              "mysql",
              field.definition.dataType,
              field.definition.expr,
              { unsigned: Boolean(field.definition.unsigned) },
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
  options: GenerateDatabaseOptions = {},
): Promise<string> => {
  const typesString = tableAndTypes.map(({ types }) => `${types}\n`).join("\n")
  const databaseString = [`\nexport interface DB {`]
  databaseString.push(
    ...tableAndTypes.map(
      ({ table, tableTypeName }) => `${table}: ${tableTypeName}`,
    ),
  )
  databaseString.push("}")

  const str = `import { Generated, Insertable, Selectable, Updateable } from 'kysely'\n\n${typesString}\n${databaseString.join(
    "\n",
  )}`
  if (options.format === false) {
    return str
  }
  const formattedStr = await format(str, { semi: false, parser: "typescript" })
  return formattedStr
}
