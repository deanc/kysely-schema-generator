export const typeMap: Record<string, string> = {
  // strings
  VARCHAR: "string",
  CHAR: "string",
  TEXT: "string",
  TINYTEXT: "string",
  MEDIUMTEXT: "string",
  LONGTEXT: "string",
  ENUM: "string-literal",
  SET: "string-literal",
  DATE: "string",
  // booleans
  BOOL: "boolean",
  // numbers
  TINYINT: "number",
  SMALLINT: "number",
  MEDIUMINT: "number",
  BIGINT: "number",
  INT: "number",
  DECIMAL: "number",
  FLOAT: "number",
  TIME: "number",
}
