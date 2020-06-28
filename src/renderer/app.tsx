import React, { createContext, useContext, useState } from "react"
import ReactDOM from "react-dom"
import {
  HashRouter, Route, Link, Switch,
} from "react-router-dom"
import { Button } from "antd"
import { PlusOutlined } from "@ant-design/icons"

import "@Src/renderer/helpers/contextMenu"
import "./app.less"

const Ctx = createContext({
  number: 1,
})

function NotFound() {
  return <p>
    404 Not Found: 该地址不存在, 请重新确认您的地址, 或者<Link to="/">返回首页</Link>
  </p>
}

function SubHome() {
  const { number } = useContext(Ctx)
  return <>
    here is SubHome: {number}
  </>
}

function Home() {
  const [number, setNumber] = useState(1)

  return <Ctx.Provider value={{ number }}>
    <div>
      <p>
        here is Home: {number}
        <Button type="primary" onClick={() => setNumber((val) => val + 1)}>
          <PlusOutlined />
        </Button>
      </p>
      <p>
        <SubHome />
      </p>
      link to a <Link to="/not-found">error page</Link>
    </div>
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
