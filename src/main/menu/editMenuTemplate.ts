export const editMenuTemplate: Electron.MenuItemConstructorOptions = {
  label: "Edit",
  submenu: [
    { label: "Undo", accelerator: "CmdOrCtrl+Z" },
    { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z" },
    { type: "separator" },
    { label: "Cut", accelerator: "CmdOrCtrl+X" },
    { label: "Copy", accelerator: "CmdOrCtrl+C" },
    { label: "Paste", accelerator: "CmdOrCtrl+V" },
    { label: "Select All", accelerator: "CmdOrCtrl+A" },
  ],
}
