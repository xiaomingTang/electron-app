import { remote } from "electron"
import jetpack from "fs-jetpack"
import path from "path"

export default class UserData {
  json: boolean

  path: string

  constructor(filename: string, json = true) {
    this.path = path.join(remote.app.getPath("userData"), filename)
    this.json = json
  }

  get(): any {
    let content: any

    try {
      if (this.json) {
        content = jetpack.read(this.path, "json")
      } else {
        content = jetpack.read(this.path, "utf8")
      }
    } catch (err) {
      console.error(err)
    }

    return content
  }

  set(content: any): void {
    try {
      jetpack.write(this.path, content, { atomic: true })
    } catch (err) {
      console.error(err)
    }
  }

  append(content: string): void {
    try {
      jetpack.append(this.path, content)
    } catch (err) {
      console.error(err)
    }
  }
}
