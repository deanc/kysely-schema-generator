export type DBEngine = "mysql"
type TypeMap = Record<DBEngine, DataTypeMapping>
type DataTypeMapping = Record<string, string>

export const typeMap: TypeMap = {
  mysql: {
    // strings
    VARCHAR: "string",
    CHAR: "string",
    TEXT: "string",
    TINYTEXT: "string",
    MEDIUMTEXT: "string",
    LONGTEXT: "string",
    // string groups
    ENUM: "string-literal",
    SET: "string-literal",
    //dates
    DATE: "string",
    TIMESTAMP: "string",
    TIME: "number",
    YEAR: "string",
    // booleans
    BOOL: "number", // mysql maps this to tinyint(1)
    BOOLEAN: "number", // mysql maps this to tinyint(1)
    // numbers
    TINYINT: "number",
    SMALLINT: "number",
    MEDIUMINT: "number",
    BIGINT: "number",
    INT: "number",
    DECIMAL: "number",
    FLOAT: "number",
    REAL: "number",
    BIT: "number",
    DEC: "number",
    FIXED: "number",
    NUMERIC: "number",
    SERIAL: "number",
  },
}
