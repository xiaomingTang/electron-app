import React, {
  createContext, useContext, useState,
} from "react"
import ReactDOM from "react-dom"
import {
  HashRouter, Route, Link, Switch,
} from "react-router-dom"
import { Button } from "antd"
import {
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons"

import "@Src/renderer/helpers/contextMenu"
import "./app.less"
import { remote } from "electron"

const Ctx = createContext({
  number: 1,
})

function NotFound() {
  return <p>
    404 Not Found: 该地址不存在, 请重新确认您的地址, 或者<Link to="/">返回首页</Link>
  </p>
}

function FileDroper() {
  return <Button
    onDragOver={(e) => {
      e.preventDefault()
    }}
    onDrop={(e) => {
      e.preventDefault();
      [...e.dataTransfer.files].forEach((f) => {
        console.log(f.path)
      })
    }}
  >
    drag and drop
  </Button>
}

function Home() {
  const [number, setNumber] = useState(1)

  return <Ctx.Provider value={{ number }}>
    <div>
      <FileDroper />
      <Button onClick={() => {
        remote.dialog.showOpenDialog({
          properties: ["multiSelections", "openFile", "showHiddenFiles", "treatPackageAsDirectory"],
        }).then((result) => {
          console.log(result.filePaths)
        })
      }}>
        <UploadOutlined /> Click to Upload
      </Button>
      <p>
        here is Home: {number}
        <Button type="primary" onClick={() => setNumber((val) => val + 1)}>
          <PlusOutlined />
        </Button>
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
