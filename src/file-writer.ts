import { writeFileSync } from "fs"
import * as path from "path"

import { IWriteFileParams } from "./types"

export const writeFile = ({ outFile, content }: IWriteFileParams) => {
  const filePath = outFile ?? path.join(__dirname, "../../db.ts")
  writeFileSync(filePath, content, "utf8")
}
