const childProcess = require("child_process");
const electron = require("electron");
const webpack = require("webpack");

const webpackConfig = require("./webpack.base.config");

const compiler = webpack(webpackConfig);
let electronStarted = false;

const watching = compiler.watch({}, (err, stats) => {
  if (err || stats.hasErrors() || electronStarted) {
    return
  }
  electronStarted = true;
  childProcess
    .spawn(electron, ["."], { stdio: "inherit" })
    .on("close", () => {
      watching.close(() => {
        console.log("closed")
      });
    });
});
