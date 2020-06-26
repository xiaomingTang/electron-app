import { dialog, remote } from "electron"

const envDialog = dialog || remote.dialog

export function alert(msg: string): void {
  envDialog.showMessageBoxSync({
    message: msg,
    buttons: ["yes"],
    defaultId: 0,
  })
}

export function confirm(msg: string, defaultAsTrue = true): boolean {
  return envDialog.showMessageBoxSync({
    message: msg,
    buttons: ["no", "yes"],
    defaultId: defaultAsTrue ? 1 : 0,
  }) === 1
}

export function formatFullTime(sec: number): string {
  const day = Math.floor(sec / (3600 * 24))
  const hour = Math.floor((sec % (3600 * 24)) / 3600)
  const min = Math.floor((sec % 3600) / 60)
  const realSec = Math.floor(sec % 60)
  if (day > 0) { return `${day} 天 ${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${realSec.toString().padStart(2, "0")}` }
  if (hour > 0) { return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${realSec.toString().padStart(2, "0")}` }
  if (min > 0) { return `${min} 分 ${realSec} 秒` }
  return `${realSec} 秒`
}
