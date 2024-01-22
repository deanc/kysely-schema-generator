import { writeFileSync } from "fs"
import { join, relative, sep } from "path"

import { IWriteFileParams } from "./types"

export const writeFile = ({ outFile, content }: IWriteFileParams) => {
  const outFilePath = outFile
    ? `.${sep}${relative(process.cwd(), outFile)}`
    : undefined

  const filePath = outFilePath ?? join(__dirname, "../../db.ts")
  writeFileSync(filePath, content, "utf8")
}
