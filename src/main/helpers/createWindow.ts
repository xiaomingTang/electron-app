// This helper remembers the size and position of your windows (and restores
// them in that place after app relaunch).
// Can be used for more than one window, just construct many
// instances of it and give each different name.

import { app, BrowserWindow, screen } from "electron"
import jetpack from "fs-jetpack"

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

class Position implements Bounds {
  // x, y初始值设为 -1 是为了让默认值的 isWithinBounds 始终为 false, 这样就能执行 setWithinBounds 方法, 将窗口移动到屏幕中央了
  x = -1

  y = -1

  width = 0

  height = 0

  constructor(config?: Partial<Bounds>) {
    this.copy(config)
  }

  isWithinBounds(bounds: Bounds): boolean {
    return this.x >= bounds.x
      && this.y >= bounds.y
      && this.x + this.width <= bounds.x + bounds.width
      && this.y + this.height <= bounds.y + bounds.height
  }

  setWithinBounds(bounds: Bounds) {
    if (this.isWithinBounds(bounds)) { return }
    this.width = Math.min(this.width, bounds.width)
    this.height = Math.min(this.height, bounds.height)
    this.x = (bounds.width - this.width) / 2
    this.y = (bounds.height - this.height) / 2
  }

  copy(config?: Partial<Bounds>) {
    if (!config) { return }
    if (typeof config.x === "number") { this.x = config.x }
    if (typeof config.y === "number") { this.y = config.y }
    if (typeof config.width === "number") { this.width = config.width }
    if (typeof config.height === "number") { this.height = config.height }
  }

  copyFromWindow(win: BrowserWindow) {
    if (!win.isMinimized() && !win.isMaximized()) {
      const position = win.getPosition()
      const size = win.getSize()
      this.copy({
        x: position[0],
        y: position[1],
        width: size[0],
        height: size[1],
      })
    }
  }

  toJson(): Bounds {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    }
  }
}

export default function createWindow(name: string, options: Electron.BrowserWindowConstructorOptions): BrowserWindow {
  const userDataDir = jetpack.cwd(app.getPath("userData"))
  const stateStoreFile = `window-state-${name}.json`

  const position = new Position(options)
  let win: BrowserWindow

  const readState = () => {
    try {
      position.copy(userDataDir.read(stateStoreFile, "json") as Bounds)
    } catch (err) {
      // pass
    }
  }

  const saveState = () => {
    if (win) {
      position.copyFromWindow(win)
    }
    userDataDir.write(stateStoreFile, position.toJson(), { atomic: true })
  }

  readState()

  const isWithinBounds = screen.getAllDisplays().some((display) => position.isWithinBounds(display.bounds))

  if (!isWithinBounds) { position.setWithinBounds(screen.getPrimaryDisplay().bounds) }

  win = new BrowserWindow({ ...options, ...position.toJson() })

  win.on("close", saveState)

  return win
}
