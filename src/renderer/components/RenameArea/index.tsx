import React, { useMemo, useEffect } from "react"
import { useList } from "react-use"
import path from "path"
import jetpack from "fs-jetpack"
import fs from "fs"
import { Base } from "tang-base-node-utils"
import isEqual from "lodash/isEqual"
import {
  Button, Space, Divider, Modal, List, Collapse,
} from "antd"
import {
  PlusOutlined, FileTextFilled, FolderFilled, CloseOutlined, DragOutlined, CloseCircleOutlined,
} from "@ant-design/icons"
import {
  ReactSortable,
} from "react-sortablejs"

import FilepathDroper from "@Renderer/components/FilepathDroper"
import { ClipText } from "@Renderer/components/ClipText"

import {
  RenameConfig, RenameConfigElement, normalizeConfig, configToString,
} from "./renameConfig"
import Styles from "./index.module.less"

interface ListItem {
  id: string;
}

export default function RenameArea(): JSX.Element {
  const [errorMsgList, errorMsgListActions] = useList<string>([])

  const [paths, pathsActions] = useList<string>([])

  const bases = useMemo(() => paths.map((p) => new Base(p)), [paths])

  const sortList: ListItem[] = useMemo(() => paths.map((p) => ({ id: p })), [paths])
  const setSortList = (newList: ListItem[]) => pathsActions.set(newList.map(({ id }) => id))

  const [configs, configsAction] = useList<RenameConfig>([
    { type: "name" },
    { type: "staticString", value: "-" },
    {
      type: "number", start: 1, added: 1, width: 1,
    },
    { type: "suffix" },
  ])

  useEffect(() => {
    if (paths) {
      const newPaths = paths.map((p) => path.normalize(p)).filter((p) => jetpack.exists(p) === "file")
      if (!isEqual(newPaths, paths)) {
        pathsActions.set(newPaths)
      }
    }
  }, [paths, pathsActions])

  return <>
    {/* 加载文件区 */}
    <FilepathDroper setPaths={pathsActions.set} className={`${Styles.uploadArea} unselectable`}>
      <div>点击选择或拖拽文件(夹)到此处</div>
      <div>也可以直接拖拽路径字符串</div>
    </FilepathDroper>
    {/* 错误信息展示区 */}
    {
      errorMsgList.length > 0 && <Collapse>
        <Collapse.Panel
          header={`错误信息: ${errorMsgList.length}`}
          key="error-msg"
          extra={<CloseCircleOutlined
            title="清空错误信息"
            onClick={(e) => {
              e.stopPropagation()
              errorMsgListActions.clear()
            }}
          />}
        >
          {
            errorMsgList.map((msg, i) => (<p key={i}>{i + 1}: {msg}</p>))
          }
        </Collapse.Panel>
      </Collapse>
    }
    <Divider />
    <div className={Styles.renameArea}>
      {/* 文件名组成编辑 */}
      <h5 className="unselectable">新文件名组成部分</h5>
      {
        configs.map((config, i) => (<RenameConfigElement
          key={i}
          config={config}
          setConfig={(newItem) => configsAction.updateAt(i, normalizeConfig(newItem))}
          onRemove={() => configsAction.removeAt(i)}
          insertBefore={() => configsAction.insertAt(i, { type: "name" })}
          insertAfter={() => configsAction.insertAt(i + 1, { type: "name" })}
        />))
      }
      {
        configs.length === 0 && <Button type="primary" onClick={() => {
          configsAction.push({ type: "name" })
        }}>
          <PlusOutlined />
        </Button>
      }
      <Divider />
      {/* 操作区 */}
      <h5 className="unselectable">操作</h5>
      {/* 执行重命名 */}
      <Button disabled={paths.length === 0} type="primary" onClick={() => {
        const result = bases.map((base, idx) => {
          const newName = configs.reduce((prev, config) => `${prev}${configToString(base.path, config, idx)}`, "")
          return [
            base.path,
            path.join(base.dirname, newName),
          ]
        })

        Modal.confirm({
          title: "警告! 同名文件将直接覆盖!!!",
          width: "700px",
          content: <>
            确定按如下执行重命名吗?
            <List
              style={{ height: "50vh", overflowY: "auto" }}
              dataSource={result}
              renderItem={(item) => (<div>
                <Divider />
                <div style={{ color: "#ff4949" }}>- {item[0]}</div>
                <div style={{ color: "green" }}>+ {item[1]}</div>
              </div>)}
            />
          </>,
          okButtonProps: { danger: true },
          okText: "重命名",
          cancelText: "取消",
          keyboard: true,
          maskClosable: true,
          onOk() {
            let theErrorLength = 0
            result.forEach(([origin, target]) => {
              try {
                jetpack.move(origin, target)
              } catch (error) {
                theErrorLength += 1
                errorMsgListActions.push(error.message)
              }
            })
            Modal.warning({
              title: "执行完成",
              content: <>
                <div>总计重命名文件(夹)数: {paths.length}</div>
                <div>重命名错误数: {theErrorLength}</div>
                <div>即将更新页面</div>
              </>,
              onOk: () => {
                pathsActions.push("")
              },
            })
          },
        })
      }}>
        根据如下所示, 对文件(夹)执行重命名
      </Button>
      <Divider />
      {/* 按文件名排序 */}
      <Button title="从小到大" disabled={paths.length === 0} onClick={() => {
        pathsActions.sort((a, b) => a.localeCompare(b))
      }}>
        按文件名排序
      </Button>
      {/* 按创建时间排序 */}
      <Button title="从小到大" disabled={paths.length === 0} onClick={() => {
        pathsActions.sort((a, b) => {
          try {
            const statA = fs.statSync(a)
            const statB = fs.statSync(b)
            return statA.birthtimeMs - statB.birthtimeMs
          } catch (error) {
            return a.localeCompare(b)
          }
        })
      }}>
        按创建时间排序
      </Button>
      {/* 按最后修改时间排序 */}
      <Button title="从小到大" disabled={paths.length === 0} onClick={() => {
        pathsActions.sort((a, b) => {
          try {
            const statA = fs.statSync(a)
            const statB = fs.statSync(b)
            return statA.mtimeMs - statB.mtimeMs
          } catch (error) {
            return a.localeCompare(b)
          }
        })
      }}>
        按最后修改时间排序
      </Button>
      {/* 按文件大小排序 */}
      <Button title="从小到大" disabled={paths.length === 0} onClick={() => {
        pathsActions.sort((a, b) => {
          try {
            const statA = fs.statSync(a)
            const statB = fs.statSync(b)
            return statA.size - statB.size
          } catch (error) {
            return a.localeCompare(b)
          }
        })
      }}>
        按文件大小排序
      </Button>
      <Divider />
      <h5 className="unselectable">预览 [{paths.length}]</h5>
      <ReactSortable list={sortList} setList={setSortList} handle={`.${Styles.dragHandler}`}>
        {
          bases.map((base, idx) => (<div key={base.path} style={{ margin: ".5em 0" }}>
            <Space>
              <Button title="上下拖拽排序" type="text" size="small" className={Styles.dragHandler}>
                {
                  base.isFile
                    ? <FileTextFilled />
                    : <FolderFilled style={{ color: "#ad8300" }} />
                }
                <DragOutlined />
              </Button>

              <div title={`父目录: ${base.dirname}`} className={Styles.dirname}>
                <ClipText text={base.dirname} maxWidth={50} tailWidth={10} />
                <span>{path.sep}</span>
              </div>

              {
                configs.map((config, key) => {
                  const text = configToString(base.path, config, idx) || "\u00A0"
                  return <div key={key} className={Styles.dirname} title={text}>
                    <ClipText
                      text={text}
                      maxWidth={config.type === "name" ? 20 : 10}
                      tailWidth={4}
                    />
                  </div>
                })
              }
              <Button title="移除该项" danger size="small" onClick={() => pathsActions.removeAt(idx)}>
                <CloseOutlined />
              </Button>
            </Space>
          </div>))
        }
      </ReactSortable>
    </div>
  </>
}
