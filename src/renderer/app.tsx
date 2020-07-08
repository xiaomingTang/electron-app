import React, {
  useState, useEffect,
} from "react"
import ReactDOM from "react-dom"
import {
  HashRouter, Route, Switch,
} from "react-router-dom"
import { useRaf, useAudio } from "react-use"
import {
  Button, Space, InputNumber, Menu, Dropdown,
} from "antd"
import {
  DownOutlined,
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
    src: "./media/标准铃声.mp3",
  },
  {
    label: "音乐铃声",
    src: "./media/音乐铃声.mp3",
  },
  {
    label: "门铃声音",
    src: "./media/门铃声音.mp3",
  },
  {
    label: "人声提示",
    src: "./media/人声提示.mp3",
  },
]

function TimerTo({ target, onTime }: {
  target: Date;
  onTime?: (durationMs: number) => void;
}) {
  const curTime = new Date().getTime()
  const tarTime = target.getTime()
  const dur = tarTime - curTime

  useRaf(dur, 0)

  useEffect(() => {
    if (onTime && dur <= 0) {
      onTime(dur)
    }
  }, [dur, onTime])

  if (dur >= 0) {
    return <>
      {Math.floor(dur / 1000)}
      s 后提醒你
    </>
  }
  return <>暂未生效</>
}

function Home() {
  // 闹钟间隔, 分钟
  const [alarmDurationMin, setAlarmDurationMin] = useState(10)
  // 提示音持续时间
  const [audioDurationSec, setAudioDurationSec] = useState(10)
  // 闹钟铃声对象
  const [audioObject, setAudioObject] = useState<AudioItem>(audios[0])
  // 下次闹钟的时间
  const [nextAlarmDate, setNextAlarmDate] = useState(() => new Date(0))

  const [audioElem, audioState, audioControls] = useAudio({
    src: audioObject.src,
  })

  useEffect(() => {
    if (audioObject && audioControls) {
      audioControls.play()
    }
  }, [audioObject, audioControls])

  // 闹钟铃声菜单
  const menu = (<Menu selectedKeys={[audioObject.label]}>
    {
      audios.map((audio, i) => (<Menu.Item key={audio.label} onClick={() => {
        setAudioObject(audios[i])
      }}>
        {audio.label}
      </Menu.Item>))
    }
  </Menu>)

  // 闹钟间隔修改时, 修改 nextAlarmDate
  useEffect(() => {
    if (alarmDurationMin > 0) {
      setNextAlarmDate(new Date(new Date().getTime() + alarmDurationMin * 60000))
    }
  }, [alarmDurationMin])

  return <>
    {audioElem}
    <Space direction="vertical">
      <div>
        <TimerTo target={nextAlarmDate} onTime={(durationMs) => {
          if (-durationMs < audioDurationSec * 1000) {
            console.log(durationMs)
          }
        }} />
      </div>
      <div>
        每隔
        <InputNumber value={alarmDurationMin} onChange={(newVal) => {
          if (typeof newVal === "number") {
            setAlarmDurationMin(newVal)
          }
        }} />
        分钟
      </div>
      <div>
        响铃提示
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button>
            {audioObject.label}
            <DownOutlined />
          </Button>
        </Dropdown>
      </div>
      <div>
        持续
        <InputNumber value={audioDurationSec} onChange={(newVal) => {
          if (typeof newVal === "number") {
            setAudioDurationSec(newVal)
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
