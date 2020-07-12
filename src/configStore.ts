import Store from "electron-store"

interface Config {
  alarmDurationMin: number;
  audioDurationSec: number;
  audioObjectIdx: number;
}

const defaultConfig: Config = {
  alarmDurationMin: 10,
  audioDurationSec: 10,
  audioObjectIdx: 0,
}

function geneStore(): Store<Config> {
  const name = "electron-store--config"
  try {
    return new Store<Config>({
      name,
      schema: {
        alarmDurationMin: {
          type: "number",
          minimum: 1,
          default: defaultConfig.alarmDurationMin,
        },
        audioDurationSec: {
          type: "number",
          minimum: 1,
          default: defaultConfig.audioDurationSec,
        },
        audioObjectIdx: {
          type: "number",
          minimum: 0,
          maximum: 3,
          default: defaultConfig.audioObjectIdx,
        },
      },
    })
  } catch (err) {
    return new Store<Config>({
      name,
      defaults: defaultConfig,
    })
  }
}

const store = geneStore()

export function getStore<T extends keyof Config>(key: T, defaultValue: Config[T] = defaultConfig[key]): Config[T] {
  let result: Config[T] = defaultValue
  try {
    result = store.get(key, defaultValue)
  } catch (error) {
    // pass
  }
  if (typeof result !== typeof defaultValue) {
    return defaultValue
  }
  return result
}

export function setStore<T extends keyof Config>(key: T, value: Config[T] = defaultConfig[key]): void {
  try {
    store.set(key, value)
  } catch (error) {
    store.set(key, defaultConfig[key])
  }
}
