const webpack = require("webpack")

const {
  development: envDevelopment,
  production: envProduction,
} = require("./env")

const isProduction = process.env.NODE_ENV !== "development"

function injectEnv(envObj) {
  const envList = Object.entries(envObj).filter(([key, val]) => {
    if (typeof val !== "string") {
      console.error(`[injectEnv error]: value is not string: ${val}`)
      return false
    }
    if (!/^ELECTRON_ENV_\w+/.test(key)) {
      console.error(`[injectEnv error]: key is not start with 'ELECTRON_ENV_': ${key}`)
      return false
    }
    return true
  }).map(([key, val]) => {
    process.env[key] = val
    return [`process.env.${key}`, JSON.stringify(val)]
  })

  const definePluginOptions = envList.reduce((prev, cur) => ({
    ...prev,
    [cur[0]]: cur[1],
  }), {})

  const definePlugin = new webpack.DefinePlugin(definePluginOptions)

  return definePlugin
}

module.exports = isProduction ? injectEnv(envProduction) : injectEnv(envDevelopment)
