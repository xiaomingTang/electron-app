const path = require("path");
const nodeExternals = require("webpack-node-externals");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

const definePlugin = require("./injectEnv")
const Paths = require("./paths");

const isProduction = process.env.NODE_ENV !== "development"

module.exports = {
  entry: {
    background: Paths.MainEntry,
    app: Paths.RendererEntry,
  },
  output: {
    path: Paths.Output,
    filename: "[name].js",
  },
  target: "electron-renderer",
  mode: isProduction ? "production" : "development",
  devtool: "source-map",
  node: {
    __dirname: false,
    __filename: false
  },
  externals: [nodeExternals()],
  resolve: {
    alias: {
      "@Src": Paths.Src,
      "@Main": Paths.Main,
      "@Renderer": Paths.Renderer,
    },
    extensions: [".js", ".ts", ".tsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    // new FriendlyErrorsWebpackPlugin({ clearConsole: !isProduction }),
    definePlugin,
  ]
}
