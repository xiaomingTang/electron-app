import React, {
  createContext, useEffect, useMemo,
} from "react"
import ReactDOM from "react-dom"
import {
  HashRouter, Route, Link, Switch,
} from "react-router-dom"
import { Button, Space } from "antd"
import { useList } from "react-use"
import fs from "fs"
import { remote } from "electron"
import { ResolvableHookState } from "react-use/lib/util/resolveHookState"
import path from "path"
import { Base } from "tang-base-node-utils"
import isEqual from "lodash/isEqual"

import {
  UploadOutlined, FileTextFilled, FolderFilled,
} from "@ant-design/icons"

import "@Renderer/helpers/contextMenu"
import Rename from "@Renderer/rename"

import "./app.less"

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

function FilepathDroper({ setPaths }: {
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
                ...itemStr.replace(/\r/g, "").split("\n"),
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
  </>
}

const renameMap: Record<string, Rename> = {}
function geneRename(p: string): Rename {
  if (!renameMap[p]) {
    const newRename = new Rename(p)
    renameMap[p] = newRename
    return newRename
  }
  return renameMap[p]
}

function Home() {
  const [paths, pathsActions] = useList<string>([
    "C:/Users/ciro/Desktop/electron-app/src/renderer/app.tsx",
    "C:/Users/ciro/Desktop/electron-app/src/renderer/app.less",
    "C:/Users/ciro/Desktop/electron-app/src/renderer/helpers",
    "C:/Users/ciro/Desktop/electron-app/src/renderer",
  ])
  const renames = useMemo(() => paths.map((p) => geneRename(p)), [paths])

  useEffect(() => {
    if (paths) {
      const newPaths = paths.map((p) => path.normalize(p).replace(/\\/g, "/")).filter((p) => fs.existsSync(p))
      if (!isEqual(newPaths, paths)) {
        console.log("set")
        pathsActions.set(newPaths)
      }
    }
  }, [paths, pathsActions])

  return <Ctx.Provider value={{ number: 1 }}>
    <FilepathDroper setPaths={pathsActions.set} />
    <p></p>
    {
      renames.map((rename) => (<Space key={rename.base.path}>
        {
          rename.base.isFile
            ? <FileTextFilled />
            : <FolderFilled style={{ color: "#ad8300" }} />
        }
        {rename.base.path}
      </Space>))
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
