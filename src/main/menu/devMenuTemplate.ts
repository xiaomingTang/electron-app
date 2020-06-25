import { app, BrowserWindow } from "electron"

export const devMenuTemplate: Electron.MenuItemConstructorOptions = {
  label: "Development",
  submenu: [
    {
      label: "Reload",
      accelerator: "CmdOrCtrl+R",
      click: (): void => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) {
          focusedWindow.webContents.reloadIgnoringCache()
        }
      },
    },
    {
      label: "Toggle DevTools",
      accelerator: "Alt+CmdOrCtrl+I",
      click: (): void => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) {
          focusedWindow.webContents.toggleDevTools()
        }
      },
    },
    {
      label: "Quit",
      accelerator: "CmdOrCtrl+Q",
      click: app.quit,
    },
  ],
}
