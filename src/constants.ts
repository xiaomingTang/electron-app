import { remote } from "electron"

const envProcess = remote ? remote.process : process

export const isProduction = envProcess.env.ELECTRON_ENV_name !== "development"
