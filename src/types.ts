export interface TableAndTypes {
  table: string
  tableTypeName: string
  types: string
}

export interface IWriteFileParams {
  outFile?: string
  content: string
}

export interface IArgs {
  pathEnv?: string
  outFile?: string
  print?: boolean
}
