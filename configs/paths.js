const path = require("path")

const appRoot = path.resolve(__dirname, "../")

const Paths = {
  Root: appRoot,
  Output: path.resolve(appRoot, ".app"),
  Public: path.resolve(appRoot, "public"),
  Src: path.resolve(appRoot, "src"),
  Static: path.resolve(appRoot, "static"),
  Main: path.resolve(appRoot, "src/main"),
  Renderer: path.resolve(appRoot, "src/renderer"),
  MainEntry: path.resolve(appRoot, "src/main/background.ts"),
  RendererEntry: path.resolve(appRoot, "src/renderer/app.tsx"),
}

module.exports = Paths
