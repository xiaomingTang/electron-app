import React, {
  useState, useEffect, useCallback, HTMLAttributes, useMemo,
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
  DownOutlined, PauseOutlined, StepForwardOutlined, StepBackwardOutlined, CaretRightOutlined,
} from "@ant-design/icons"
import { clamp } from "lodash-es"
import path from "path"

import "@Renderer/helpers/contextMenu"
import NotFound from "@Renderer/pages/NotFound"
import { getStore, setStore } from "@Src/configStore"

import "./app.less"

interface AudioItem {
  label: string;
  src: string;
}

const audios: AudioItem[] = [
  {
    label: "JingSkill",
    src: "./static/medias/JingSkill.mp3",
  },
  {
    label: "标准铃声",
    src: "./static/medias/标准铃声.mp3",
  },
  {
    label: "林肯公园",
    src: "./static/medias/林肯公园.mp3",
  },
  {
    label: "门铃声音",
    src: "./static/medias/门铃声音.mp3",
  },
  {
    label: "人声提示",
    src: "./static/medias/人声提示.mp3",
  },
  {
    label: "向日葵",
    src: "./static/medias/向日葵.mp3",
  },
  {
    label: "音乐铃声",
    src: "./static/medias/音乐铃声.mp3",
  },
]

interface TimerToProps extends HTMLAttributes<HTMLDivElement> {
  target: Date;
  onTime?: (durationMs: number) => void;
}

function TimerTo({
  target,
  onTime,
  children,
  ...props
}: TimerToProps) {
  const curTime = new Date().getTime()
  const tarTime = target.getTime()
  const dur = tarTime - curTime

  useRaf(dur, 0)

  useEffect(() => {
    if (onTime && dur <= 0) {
      onTime(dur)
    }
  }, [dur, onTime])

  return <div {...props}>
    {
      dur >= 0
        ? `将在 ${Math.floor(dur / 1000)} s 后提醒你`
        : (children || "时间到")
    }
  </div>
}

function Home() {
  // 闹钟间隔, 分钟
  const [alarmDurationMin, setAlarmDurationMin] = useState(() => getStore("alarmDurationMin"))
  // 提示音持续时间
  const [audioDurationSec, setAudioDurationSec] = useState(() => getStore("audioDurationSec"))
  // 闹钟铃声索引
  const [audioObjectIdx, setAudioObjectIdx] = useState(() => getStore("audioObjectIdx"))
  // 闹钟铃声对象
  const audioObject = useMemo(() => audios[audioObjectIdx] || audios[0], [audioObjectIdx])
  // 下次闹钟的时间
  const [nextAlarmDate, _setNextAlarmDate] = useState(() => new Date(0))

  const [audioElem, audioState, audioControls] = useAudio({
    src: audioObject.src,
    autoPlay: false,
    loop: true,
  })

  const stopAudio = useCallback(() => {
    audioControls.pause()
    audioControls.seek(0)
  }, [audioControls])

  const resetNextAlarmDate = useCallback((date?: Date) => {
    _setNextAlarmDate(date || new Date(new Date().getTime() + alarmDurationMin * 60000))
  }, [alarmDurationMin])

  // 闹钟铃声菜单
  const menu = (<Menu selectedKeys={[audioObject.label]}>
    {
      audios.map((audio, i) => (<Menu.Item key={audio.label} onClick={() => {
        setAudioObjectIdx(i)
        resetNextAlarmDate(new Date())
      }}>
        {audio.label}
      </Menu.Item>))
    }
  </Menu>)

  useEffect(() => {
    setStore("alarmDurationMin", alarmDurationMin)
    _setNextAlarmDate(new Date(new Date().getTime() + alarmDurationMin * 60000))
  }, [alarmDurationMin])

  useEffect(() => {
    setStore("audioDurationSec", audioDurationSec)
  }, [audioDurationSec])

  useEffect(() => {
    setStore("audioObjectIdx", audioObjectIdx)
  }, [audioObjectIdx])

  return <>
    {audioElem}
    <Space direction="vertical">
      <div>
        每隔
        <InputNumber min={1} precision={0} value={alarmDurationMin} onChange={(newVal) => {
          if (typeof newVal === "number") {
            setAlarmDurationMin(newVal)
            // 这儿必须使用 setTimeout
            // 如果直接执行 stopAudio, 由于 _setNextAlarmDate 方法在 useEffect 中, 因此会在 stopAudio 后才会被调用
            // 在此期间, TimerTo.onTime 仍然会被触发, 其内有 audioControls.play 被再次调用
            // 因此使用 setTimeout 强行使 stopAudio 在 _setNextAlarmDate 之后执行
            window.setTimeout(stopAudio, 0)
          }
        }} />
        分钟
      </div>
      <div>
        提示音乐
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button>
            {audioObject.label}
            <DownOutlined />
          </Button>
        </Dropdown>
        <>
          {/* audio controls */}
          <Button disabled={audioObjectIdx <= 0} onClick={() => { // pre-audio
            const newIdx = clamp(audioObjectIdx - 1, 0, audios.length - 1)
            setAudioObjectIdx(newIdx)
            resetNextAlarmDate(new Date())
          }}>
            <StepBackwardOutlined />
          </Button>
          {
            audioState.paused ? <Button onClick={() => {
              resetNextAlarmDate(new Date())
            }}>
              <CaretRightOutlined />
            </Button> : <Button onClick={() => {
              stopAudio()
              resetNextAlarmDate()
            }}>
              <PauseOutlined />
            </Button>
          }
          <Button disabled={audioObjectIdx >= audios.length - 1} onClick={() => { // next-audio
            const newIdx = clamp(audioObjectIdx + 1, 0, audios.length - 1)
            setAudioObjectIdx(newIdx)
            resetNextAlarmDate(new Date())
          }}>
            <StepForwardOutlined />
          </Button>
        </>
      </div>
      <div>
        持续
        <InputNumber min={1} precision={0} value={audioDurationSec} onChange={(newVal) => {
          if (typeof newVal === "number") {
            setAudioDurationSec(newVal)
          }
        }} />
        秒
      </div>
      <TimerTo
        target={nextAlarmDate}
        onTime={(durationMs) => {
          if (durationMs < 0) {
            if (-durationMs < audioDurationSec * 1000) {
              audioControls.play()
            } else {
              stopAudio()
              resetNextAlarmDate()
            }
          }
        }}
      >
        要喝水了...
      </TimerTo>
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
