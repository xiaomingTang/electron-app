import React, {
  createContext, useContext, useState,
} from "react"
import ReactDOM from "react-dom"
import {
  HashRouter, Route, Link, Switch,
} from "react-router-dom"
import { Button, Space } from "antd"
import {
  PlusOutlined, MinusOutlined,
} from "@ant-design/icons"

import "@Src/renderer/helpers/contextMenu"
import "./app.less"

const Ctx = createContext({
  number: 1,
})

function NotFound() {
  return <p>
    <p>
      404 Not Found
    </p>
    <p>
      该地址不存在, 请确认您的地址, 或者<Link to="/">返回首页</Link>
    </p>
  </p>
}

function Comp() {
  const { number } = useContext(Ctx)
  return <p>
    here is Child Component, and the number is {number};
  </p>
}

function Home() {
  const [number, setNumber] = useState(1)

  return <Ctx.Provider value={{ number }}>
    <p>
      here is Home, the number is {number};
    </p>
    <p>
      <Space>
        <Button type="default" onClick={() => setNumber((val) => val - 1)}>
          <MinusOutlined />
        </Button>
        <Button type="primary" onClick={() => setNumber((val) => val + 1)}>
          <PlusOutlined />
        </Button>
      </Space>
    </p>
    <Comp />
    <p>
      link to an <Link to="/not-found">error page</Link>
    </p>
  </Ctx.Provider>
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
