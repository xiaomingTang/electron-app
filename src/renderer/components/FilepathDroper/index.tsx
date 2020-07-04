import React, { HTMLAttributes } from "react"
import { ResolvableHookState } from "react-use/lib/util/resolveHookState"
import { remote } from "electron"

function unique<T>(arr: T[]): T[] {
  return [
    ...new Set(arr),
  ]
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  setPaths: (state: ResolvableHookState<string[]>) => void;
}

export default function FilepathDroper({
  setPaths, children, ...props
}: Props): JSX.Element {
  return <div
    {...props}
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
    {children}
  </div>
}
