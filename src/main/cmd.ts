import { exec } from "child_process"
import { confirm, formatFullTime } from "@Src/utils"

export function cancelShutdown(): Promise<void> {
  return new Promise((resolve, reject) => {
    exec("chcp 65001 && shutdown /a", (err) => {
      if (err && !err.message.includes("Unable to abort the system shutdown because no shutdown was in progress")) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export function shutdownAfter(sec: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (sec < 600 && !confirm(`【警告】您正在设置定时关机...\n将会在 ${formatFullTime(sec)} 后关机, 确定吗?`)) {
      resolve(false)
    }
    cancelShutdown().then(() => {
      exec(`chcp 65001 && shutdown /s /t ${sec}`, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
    }).catch(reject)
  })
}
