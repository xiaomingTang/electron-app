import React, {
  useState, useEffect, useCallback, useMemo,
} from "react"
import ReactDOM from "react-dom"
import { shell, remote } from "electron"
import moment from "moment"
import { useRaf } from "react-use"
import {
  TimePicker, Button, Checkbox, List, Space, Menu, Dropdown, message, Modal, Alert,
} from "antd"
import PlusOutlined from "@ant-design/icons/PlusOutlined"
import CloseOutlined from "@ant-design/icons/CloseOutlined"
import DownOutlined from "@ant-design/icons/DownOutlined"

import { shutdownAfter, cancelShutdown } from "@Main/cmd"
import "@Renderer/helpers/contextMenu"
import { confirm, formatFullTime } from "@Src/utils"
import UserData from "./helpers/userData"

import "./app.less"

function Link({
  href, onClick, children, ...props
}: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) {
  const curUrl = new URL(window.location.href)
  const tarUrl = new URL(href || "", window.location.href)
  const isSameOrigin = curUrl.origin === tarUrl.origin

  const defaultOnclick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isSameOrigin) { return }
    event.preventDefault()
    shell.openExternal(tarUrl.href)
  }

  return <a {...props} href={href} onClick={onClick || defaultOnclick}>{children}</a>
}

const MomentFormatter = "HH:mm:ss"

function formatOnlyTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`
}

interface TimerData {
  enabled: boolean;
  /**
   * 是否每一天都执行, 暂无效果
   */
  everyday: boolean;
  time: Date;
}

interface TimerProps extends TimerData {
  active: boolean;
  onChange: (newData: TimerData, action?: TimerAction) => void;
}

type TimerAction = "edit" | "append" | "delete"

function Timer({
  active, onChange, ...props
}: TimerProps) {
  // const curKey = props.everyday ? "everyday" : "once"

  // const menu = (<Menu selectedKeys={[curKey]} onClick={({ key }) => {
  //   onChange({
  //     ...props,
  //     everyday: key === "everyday",
  //   })
  // }}>
  //   <Menu.Item key="everyday">每天</Menu.Item>
  //   <Menu.Item key="once">仅一次</Menu.Item>
  // </Menu>)

  return <div style={{ margin: "8px 0" }}>
    <Space align="center" size="middle">
      <Checkbox
        checked={props.enabled}
        onChange={(e) => {
          onChange({
            ...props,
            enabled: e.target.checked,
          })
        }}
      >
        <span
          title={active ? "正在执行该计划..." : ""}
          style={active ? { color: "#1890FF" } : {}}
        >启用</span>
      </Checkbox>
      <TimePicker
        onChange={(m) => {
          onChange({
            ...props,
            time: m ? m.toDate() : new Date(),
          })
        }}
        value={moment(props.time, MomentFormatter)}
      />
      {/* <Dropdown overlay={menu} trigger={["click"]}>
        <Button type="primary" ghost block>
          {props.everyday ? "每天" : "仅一次"}
          <DownOutlined />
        </Button>
      </Dropdown> */}
      <Button title="删除该关机计划" size="small" danger onClick={() => {
        onChange(props, "delete")
      }}><CloseOutlined /></Button>
    </Space>
  </div>
}

const defaultShutdownDate = new Date(new Date().getTime() - 1000)

function TimeCounter({ date }: { date: Date }) {
  const durationSec = Math.floor((date.getTime() - new Date().getTime()) / 1000)

  useRaf(durationSec * 1000)

  return <Alert
    type="warning"
    closable={false}
    message={durationSec >= 0 ? `将会在 ${formatFullTime(durationSec)} 后关机` : "无定时关机任务"}
    style={{ marginBottom: "8px" }}
  />
}

function App() {
  const userData = useMemo(() => new UserData("userData/timers.json", true), [])
  const [shutdownDate, setShutdownDate] = useState(defaultShutdownDate)
  const [curIdx, setCurIdx] = useState(-1)

  const [datas, setDatas] = useState<TimerData[]>((userData.get() || []).map((item: TimerData/* 其实这儿参数类型 item.time 是string, 只是 moment 能兼容, 我就懒得写类型了 */) => ({
    ...item,
    time: moment(item.time, MomentFormatter).toDate(),
  })))

  useEffect(() => {
    if (datas) {
      const curTime = new Date().getTime()
      const leftTimeList = datas.map((data) => {
        if (!data.enabled) { return Infinity }
        let realTime = moment(formatOnlyTime(data.time), MomentFormatter).toDate().getTime()
        if (realTime < curTime) {
          // 加一天
          realTime += 1000 * 60 * 60 * 24
        }
        return realTime - curTime
      })
      const minTime = Math.min(...leftTimeList)
      const minIdx = leftTimeList.findIndex((item) => item === minTime)
      if (minTime > 0 && minTime < Infinity) {
        const minSec = Math.floor(minTime / 1000)
        shutdownAfter(minSec).then((res) => {
          if (res) {
            setShutdownDate(new Date(new Date().getTime() + minTime))
            setCurIdx(minIdx)
          }
        }).catch((err) => {
          message.error(<>
            <p>设置定时关机 时出错了:</p>
            <p>{err.message}</p>
          </>)
        })
      } else {
        cancelShutdown().then((res) => {
          if (res) {
            setShutdownDate(defaultShutdownDate)
            setCurIdx(-1)
          }
        }).catch((err) => {
          if (!err.message.includes("Unable to abort the system shutdown because no shutdown was in progress")) {
            message.error(<>
              <p>取消定时关机 时出错了:</p>
              <p>{err.message}</p>
            </>)
          }
        })
      }
    }
  }, [datas])

  const setData = useCallback((i: number) => (newData: TimerData, action?: TimerAction) => {
    const newDatas = [...datas]
    const limitLength = 10
    if (action === "append" && datas.length > limitLength) {
      remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
        message: `计划数量不得超过 ${limitLength} 个`,
      })
      return
    }
    if (action !== "delete" && newData.enabled) {
      const deltaSec = Math.floor((newData.time.getTime() - new Date().getTime()) / 1000)
      if (deltaSec >= 0 && deltaSec <= 600 && !confirm(`距离当前仅剩 ${formatFullTime(deltaSec)} , 确定是这个时间吗?`)) { // 10分钟以内
        return
      }
    }
    switch (action) {
    case "append":
      newDatas.splice(i, 0, newData)
      break
    case "delete":
      newDatas.splice(i, 1)
      break
    default: // edit
      newDatas.splice(i, 1, newData)
      break
    }
    setDatas(newDatas)
    userData.set(newDatas.map((item) => ({
      ...item,
      time: formatOnlyTime(item.time),
    })))
  }, [datas, userData])

  return <List style={{ padding: "14px" }}>
    <TimeCounter date={shutdownDate} />

    <Button // 新增定时关机计划
      type="primary"
      style={{ width: "5em", marginRight: "1em" }}
      title="新增定时关机计划"
      onClick={() => {
        setData(datas.length)({
          enabled: false,
          everyday: true,
          time: new Date(new Date().getTime() + 3600000),
        }, "append")
      }}
    >
      <PlusOutlined />
    </Button>

    <Button // 强制取消一切定时关机计划
      type="default"
      danger
      onClick={() => {
        cancelShutdown().then((res) => {
          if (res) {
            setShutdownDate(defaultShutdownDate)
            setCurIdx(-1)
          }
        }).catch((err) => {
          if (!err.message.includes("Unable to abort the system shutdown because no shutdown was in progress")) {
            message.error(<>
              <p>取消定时关机 时出错了:</p>
              <p>{err.message}</p>
            </>)
          }
        })
      }}
    >
      取消一切定时关机计划
    </Button>

    {
      datas.map((data, i) => (<Timer
        key={i}
        {...data}
        active={curIdx === i}
        onChange={setData(i)}
      />))
    }
  </List>
}

const container = document.querySelector("#app")

ReactDOM.render(
  <App />,
  container,
)
