import path from "path"
import { app } from "electron"
import { mainReloader, rendererReloader } from "electron-hot-reload"

const mainFile = path.join(app.getAppPath(), ".app", "background.js")
const rendererFile = path.join(app.getAppPath(), ".app", "app.js")

function formatTime(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

mainReloader(mainFile, undefined, () => {
  console.log(`[main reload]: ${formatTime(new Date())}`)
})

rendererReloader(rendererFile, undefined, () => {
  console.log(`[renderer reload]: ${formatTime(new Date())}`)
})
