import React, {
  createContext, useContext, useState, useEffect,
} from "react"
import ReactDOM from "react-dom"
import {
  HashRouter, Route, Link, Switch,
} from "react-router-dom"
import { useRaf } from "react-use"
import {
  Button, Space, Input, InputNumber, Menu, Dropdown,
} from "antd"
import {
  PlusOutlined, MinusOutlined, DownOutlined,
} from "@ant-design/icons"

import "@Renderer/helpers/contextMenu"
import NotFound from "@Renderer/pages/NotFound"

import "./app.less"

interface AudioItem {
  label: string;
  src: string;
}

const audios: AudioItem[] = [
  {
    label: "标准铃声",
    src: "/resources/media/标准铃声.mp3",
  },
  {
    label: "音乐铃声",
    src: "/resources/media/音乐铃声.mp3",
  },
  {
    label: "门铃声音",
    src: "/resources/media/门铃声音.mp3",
  },
  {
    label: "人声提示",
    src: "/resources/media/人声提示.mp3",
  },
]

interface AlarmState {
  /**
   * 间隔时间
   */
  durationMin: number;
  /**
   * 提醒持续时间
   */
  alramDurationSec: number;
  /**
   * 提示音src
   */
  audio: AudioItem;
}

const defaultAlarmState: AlarmState = {
  durationMin: 10,
  alramDurationSec: 10,
  audio: audios[0],
}

function TimerTo({ target }: {
  target: Date;
}) {
  const curTime = new Date().getTime()
  const tarTime = target.getTime()
  const dur = tarTime - curTime

  if (dur >= 0) {
    return <>
      {Math.floor(dur / 1000)}
      s 后提醒你
    </>
  }
  return <>暂未生效</>
}

function Home() {
  const [state, setState] = useState<AlarmState>(defaultAlarmState)

  const [nextAlarmDate, setNextAlarmDate] = useState(() => new Date(0))

  const menu = (<Menu selectedKeys={[state.audio.label]}>
    {
      audios.map((audio) => (<Menu.Item key={audio.label} onClick={() => {
        setState((prev) => ({
          ...prev,
          audio,
        }))
      }}>
        {audio.label}
      </Menu.Item>))
    }
  </Menu>)

  useEffect(() => {
    if (state) {
      setNextAlarmDate(new Date(new Date().getTime() + state.durationMin * 60000))
    }
  }, [state])

  return <>
    <Space direction="vertical">
      <div>
        <TimerTo target={nextAlarmDate} />
      </div>
      <div>
        每隔
        <InputNumber value={state.durationMin} onChange={(newVal) => {
          if (typeof newVal === "number") {
            setState((prev) => ({
              ...prev,
              durationMin: newVal,
            }))
          }
        }} />
        分钟
      </div>
      <div>
        响铃提示
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button>
            {state.audio.label}
            <DownOutlined />
          </Button>
        </Dropdown>
      </div>
      <div>
        持续
        <InputNumber value={state.alramDurationSec} onChange={(newVal) => {
          if (typeof newVal === "number") {
            setState((prev) => ({
              ...prev,
              alramDurationSec: newVal,
            }))
          }
        }} />
        秒
      </div>
    </Space>
  </>
}

const container = document.querySelector("#app")

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route path="/" exact component={Home} />
      <Route component={NotFound} />
    </Switch>
  </HashRouter>,
  container,
)
