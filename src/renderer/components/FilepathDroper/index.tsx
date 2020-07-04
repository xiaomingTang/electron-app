import React from "react"
import { ResolvableHookState } from "react-use/lib/util/resolveHookState"
import { Button } from "antd"
import { remote } from "electron"
import {
  UploadOutlined,
} from "@ant-design/icons"

function unique<T>(arr: T[]): T[] {
  return [
    ...new Set(arr),
  ]
}

export default function FilepathDroper({ setPaths }: {
  setPaths: (state: ResolvableHookState<string[]>) => void;
}): JSX.Element {
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
