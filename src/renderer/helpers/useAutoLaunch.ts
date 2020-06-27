import { remote } from "electron"
import AutoLaunch from "auto-launch"
import {
  useState, useEffect, useCallback, useMemo,
} from "react"

type SettingReturn = (val: boolean) => Promise<void>

/**
 * 注意, 该返回值仅仅表示启动项是否含有本应用, 至于启动项是否被禁用, 该方法无从得知
 */
export default function useAutoLaunch(isHidden = false): [boolean | undefined, SettingReturn] {
  const autoLauncher = useMemo(() => new AutoLaunch({
    name: remote.app.getName(),
    isHidden,
  }), [isHidden])

  const [isAutoLaunch, setIsAutoLaunch] = useState<boolean | undefined>(undefined)

  const setAutoLaunch: SettingReturn = useCallback((val: boolean) => new Promise((resolve, reject) => {
    const realVal = !!val
    if (realVal === isAutoLaunch) { resolve() }
    if (realVal) {
      autoLauncher
        .enable()
        .then(() => {
          setIsAutoLaunch(true)
          resolve()
        })
        .catch(reject)
    } else {
      autoLauncher
        .disable()
        .then(() => {
          setIsAutoLaunch(false)
          resolve()
        })
        .catch(reject)
    }
  }), [isAutoLaunch, autoLauncher])

  useEffect(() => {
    autoLauncher
      .isEnabled()
      .then(setIsAutoLaunch)
      .catch(console.error)
  }, [autoLauncher])

  return [isAutoLaunch, setAutoLaunch]
}
