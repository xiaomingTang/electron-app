import React, {
  createContext, useEffect,
} from "react"
import ReactDOM from "react-dom"
import {
  HashRouter, Route, Link, Switch,
} from "react-router-dom"
import { Base } from "tang-base-node-utils"
import { Button } from "antd"
import { useList } from "react-use"
import fs from "fs"
import {
  UploadOutlined,
} from "@ant-design/icons"

import "@Src/renderer/helpers/contextMenu"
import "./app.less"
import { remote } from "electron"
import { ResolvableHookState } from "react-use/lib/util/resolveHookState"

const Ctx = createContext({
  number: 1,
})

function NotFound() {
  return <p>
    404 Not Found: 该地址不存在, 请重新确认您的地址, 或者<Link to="/">返回首页</Link>
  </p>
}

function unique<T>(arr: T[]): T[] {
  return [
    ...new Set(arr),
  ]
}

function FilepathDroper({ paths, setPaths }: {
  paths: string[];
  setPaths: (state: ResolvableHookState<string[]>) => void;
}) {
  return <>
    <Button
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={(e) => {
        e.preventDefault();
        [...e.dataTransfer.items].forEach((item) => {
          if (item.kind === "string" && item.type === "text/plain") {
            item.getAsString((itemStr) => {
              setPaths((prev) => unique([
                ...prev,
                ...itemStr.split("\n"),
              ]))
            })
          }
          if (item.kind === "file") {
            const f = item.getAsFile()
            if (f) {
              if (typeof f.path === "string") {
                setPaths((prev) => unique([
                  ...prev,
                  f.path,
                ]))
              } else {
                setPaths((prev) => unique([
                  ...prev,
                  ...f.path,
                ]))
              }
            }
          }
        })
      }}
      onClick={() => {
        remote.dialog.showOpenDialog({
          properties: ["multiSelections", "openFile", "showHiddenFiles", "treatPackageAsDirectory"],
        }).then((result) => {
          if (result.filePaths.length > 0) {
            setPaths((prev) => unique([
              ...prev,
              ...result.filePaths,
            ]))
          }
        })
      }}
    >
      <UploadOutlined /> drag and drop
    </Button>
    {
      paths.map((s) => (<p key={s}>{s}</p>))
    }
  </>
}

function Home() {
  const [paths, pathsActions] = useList<string>([])

  useEffect(() => {
    if (paths) {
      paths.forEach((p, i) => {
        const { isFile, isDir } = new Base(p)
        if (!isFile && !isDir) {
          pathsActions.removeAt(i)
        }
      })
    }
  }, [paths, pathsActions])

  return <Ctx.Provider value={{ number: 1 }}>
    <FilepathDroper paths={paths} setPaths={pathsActions.set} />
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
