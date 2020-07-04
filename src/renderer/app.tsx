import React, {
  createContext, useEffect,
} from "react"
import ReactDOM from "react-dom"
import {
  HashRouter, Route, Link, Switch,
} from "react-router-dom"
import { useList } from "react-use"
import fs from "fs"
import path from "path"
import isEqual from "lodash/isEqual"

import "@Renderer/helpers/contextMenu"

import RenameArea from "@Renderer/components/RenameArea"
import FilepathDroper from "@Renderer/components/FilepathDroper"

import "./app.less"

const Ctx = createContext({
  number: 1,
})

function NotFound() {
  return <p>
    404 Not Found: 该地址不存在, 请重新确认您的地址, 或者<Link to="/">返回首页</Link>
  </p>
}

function Home() {
  const [paths, pathsActions] = useList<string>([
    "C:/Users/10387/Desktop/汤秋林的保存文件/爬虫2",
    "C:/Users/10387/Desktop/electron-app/src/renderer/app.less",
    "C:/Users/10387/Desktop/electron-app/src/renderer/helpers",
    "C:/Users/10387/Desktop/electron-app/src/renderer",
  ])

  useEffect(() => {
    if (paths) {
      const newPaths = paths.map((p) => path.normalize(p).replace(/\\/g, "/")).filter((p) => fs.existsSync(p))
      if (!isEqual(newPaths, paths)) {
        pathsActions.set(newPaths)
      }
    }
  }, [paths, pathsActions])

  return <Ctx.Provider value={{ number: 1 }}>
    <div>
      <FilepathDroper setPaths={pathsActions.set} />
    </div>
    {
      paths.length > 0 && <RenameArea paths={paths} />
    }
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
