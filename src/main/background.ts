import path from "path"
import url from "url"
import { app, Menu } from "electron"

import { isProduction } from "@Src/constants"
import { devMenuTemplate } from "@Main/menu/devMenuTemplate"
import { editMenuTemplate } from "@Main/menu/editMenuTemplate"
import createWindow from "@Main/helpers/createWindow"
import "@Main/helpers/reloadAppOnChanged"
import { confirm } from "@Src/utils"

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
    width: isProduction ? 800 : 1000,
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

  const { wasOpenedAtLogin } = app.getLoginItemSettings()

  if (!isProduction) {
    mainWindow.webContents.openDevTools()
  } else if (!wasOpenedAtLogin) {
    if (confirm("本应用需要开机自启动, 点击'是'将会尝试开启(可能会失败), 你也可以稍后自行开启")) {
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: false,
      })
    }
  }
})

app.on("window-all-closed", app.quit)
