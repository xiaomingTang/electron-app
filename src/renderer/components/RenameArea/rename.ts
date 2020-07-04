import path from "path"
import { Base } from "tang-base-node-utils"

export class Rename {
  base: Base

  /**
   * 新的dirname
   */
  dirname: string

  /**
   * 文件(夹)名前缀
   */
  namePrefix = ""

  /**
   * 文件(夹)名
   */
  name: string

  /**
   * 文件(夹)名后缀
   */
  nameSuffix = ""

  /**
   * 后缀名(.jpg等)
   */
  suffix: string

  constructor(p: string) {
    const base = new Base(p)
    this.base = base
    this.dirname = base.dirname
    if (base.isFile) {
      const { ext, name } = path.parse(base.path)
      this.name = name
      this.suffix = ext
    } else {
      this.name = base.basename
      this.suffix = ""
    }
  }

  toString(): string {
    const newName = [
      this.namePrefix, this.name, this.nameSuffix, this.suffix,
    ].join("")
    return path.join(this.dirname, newName)
  }
}

const renameMap: Record<string, Rename> = {}

export function geneRename(p: string): Rename {
  if (!renameMap[p]) {
    const newRename = new Rename(p)
    renameMap[p] = newRename
    return newRename
  }
  return renameMap[p]
}
