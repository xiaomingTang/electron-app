const path = require("path")
const nodeExternals = require("webpack-node-externals")
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin")
const tsImportPluginFactory = require("ts-import-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const definePlugin = require("./injectEnv")
const Paths = require("./paths")

const isProduction = process.env.NODE_ENV !== "development"

module.exports = {
  entry: {
    background: Paths.MainEntry,
    app: Paths.RendererEntry,
  },
  output: {
    path: Paths.Output,
    filename: "[name].[hash:5].js",
  },
  target: "electron-renderer",
  mode: isProduction ? "production" : "development",
  devtool: "source-map",
  node: {
    __dirname: false,
    __filename: false
  },
  // 不能使用这个 externals, 否则 antd 加载不了
  // externals: [nodeExternals()],
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
        use: ([
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              getCustomTransformers: () => ({
                before: [tsImportPluginFactory({
                  libraryDirectory: "es",
                  libraryName: "antd",
                  style: "css"
                })]
              }),
              compilerOptions: {
                module: "es2015",
              },
            },
          },
          isProduction ? "eslint-loader" : undefined,
        ]).filter(Boolean),
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.less$/,
        exclude: /\.module\.less$/,
        use: ["style-loader", "css-loader", "less-loader"]
      },
      {
        test: /\.module\.less$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
              localsConvention: "camelCaseOnly",
            },
          },
          "less-loader",
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        loader: "url-loader",
        options: {
          limit: 8192,
        },
      },
    ]
  },
  plugins: [
    // new FriendlyErrorsWebpackPlugin({ clearConsole: !isProduction }),
    definePlugin,
    new HtmlWebpackPlugin({ // 细节展示页
      template: path.join(Paths.Public, "app.html"),
      filename: "app.html",
      title: "细节展示页",
      inject: "body",
      chunks: ["app"],
      hash: true,
    }),
  ]
}
