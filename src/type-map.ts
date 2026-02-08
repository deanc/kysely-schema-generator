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
    TINYVARCHAR: "string",
    MEDIUMVARCHAR: "string",
    LONGVARCHAR: "string",
    JSON: "unknown",
    // string groups
    ENUM: "string-literal",
    SET: "string-literal",
    //dates
    DATE: "string",
    DATETIME: "string",
    DATETIME2: "string",
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
    INTEGER: "number",
    DECIMAL: "number",
    FLOAT: "number",
    DOUBLE: "number",
    DOUBLE_PRECISION: "number",
    REAL: "number",
    BIT: "number",
    DEC: "number",
    FIXED: "number",
    NUMERIC: "number",
    SERIAL: "number",
    // binary
    BINARY: "Buffer",
    VARBINARY: "Buffer",
    TINYBLOB: "Buffer",
    BLOB: "Buffer",
    MEDIUMBLOB: "Buffer",
    LONGBLOB: "Buffer",
    // spatial
    GEOMETRY: "unknown",
  },
}
