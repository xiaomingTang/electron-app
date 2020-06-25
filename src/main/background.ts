import path from "path"
import url from "url"
import { app, Menu } from "electron"

import { isProduction } from "@Src/constants"
import { devMenuTemplate } from "@Main/menu/devMenuTemplate"
import { editMenuTemplate } from "@Main/menu/editMenuTemplate"
import createWindow from "@Main/helpers/createWindow"
import "@Main/helpers/reloadAppOnChanged"

if (!isProduction) {
  // Save userData in separate folders for each environment.
  // Thanks to this you can use production and development versions of the app
  // on same machine like those are two separate apps.
  const userDataPath = app.getPath("userData")
  app.setPath("userData", `${userDataPath} (${process.env.ELECTRON_ENV_name})`)
}

const setApplicationMenu = () => {
  const menus = [editMenuTemplate]
  if (!isProduction) {
    menus.push(devMenuTemplate)
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus))
}

app.on("ready", () => {
  setApplicationMenu()

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  mainWindow.loadURL(
    url.format({
      protocol: "file:",
      pathname: path.join(__dirname, "app.html"),
      slashes: true,
    }),
  )

  if (!isProduction) {
    mainWindow.webContents.openDevTools()
  }
})

app.on("window-all-closed", app.quit)
