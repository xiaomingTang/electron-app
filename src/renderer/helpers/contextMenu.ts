// This gives you default context menu (cut, copy, paste)
// in all input fields and textareas across your app.

import { remote } from "electron"

const { Menu } = remote
const { MenuItem } = remote

const isAnyTextSelected = () => {
  const selection = window.getSelection()
  return selection ? selection.toString() !== "" : false
}

const cut = new MenuItem({
  label: "Cut",
  click: () => {
    document.execCommand("cut")
  },
})

const copy = new MenuItem({
  label: "Copy",
  click: () => {
    document.execCommand("copy")
  },
})

const paste = new MenuItem({
  label: "Paste",
  click: () => {
    document.execCommand("paste")
  },
})

const normalMenu = new Menu()
normalMenu.append(copy)

const textEditingMenu = new Menu()
textEditingMenu.append(cut)
textEditingMenu.append(copy)
textEditingMenu.append(paste)

document.addEventListener("contextmenu", (event) => {
  const target = event.target as Element
  switch (target.nodeName) {
  case "TEXTAREA":
  case "INPUT":
    event.preventDefault()
    textEditingMenu.popup({
      window: remote.getCurrentWindow(),
    })
    break
  default:
    if (isAnyTextSelected()) {
      event.preventDefault()
      normalMenu.popup({
        window: remote.getCurrentWindow(),
      })
    }
  }
}, false)
