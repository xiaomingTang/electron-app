import React, {
  useMemo, useState, useEffect, useCallback,
} from "react"
import path from "path"
import {
  Space, Input, InputNumber, Checkbox, Button,
} from "antd"
import {
  FileTextFilled, FolderFilled, EditOutlined,
} from "@ant-design/icons"
import { useUpdate, useList } from "react-use"

import { ClipText } from "@Renderer/components/ClipText"

import Styles from "./index.module.less"
import {
  geneRename, Rename,
} from "./rename"

interface ConfigProps {
  enabled: boolean;
  start: number;
  added: number;
  zeroLength: number;
  prefix: string;
  suffix: string;
}

function useConfig({
  enabled: defaultEnabled = false,
  start: defaultStart = 0,
  added: defaultAdded = 1,
  zeroLength: defaultZeroLength = 1,
  prefix: defaultPrefix = "",
  suffix: defaultSuffix = "",
} : Partial<ConfigProps>): [ConfigProps, JSX.Element] {
  const [enabled, setEnabled] = useState(defaultEnabled)
  const [start, setStart] = useState(defaultStart)
  const [added, setAdded] = useState(defaultAdded)
  const [zeroLength, setZeroLength] = useState(defaultZeroLength)
  const [prefix, setPrefix] = useState(defaultPrefix)
  const [suffix, setSuffix] = useState(defaultSuffix)

  return [
    {
      enabled,
      start,
      added,
      zeroLength,
      prefix,
      suffix,
    },
    <Space key={1} direction="vertical" className={`unselectable ${Styles.configItem}`}>
      <div>
        <Checkbox checked={enabled} onChange={(e) => setEnabled(e.target.checked)}>启用</Checkbox>
      </div>
      <div>
        从
        <InputNumber disabled={!enabled} style={{ width: "4em" }} value={start} onChange={(newVal) => {
          if (typeof newVal === "number") {
            setStart(newVal)
          } else {
            setStart(0)
          }
        }} />
        开始
      </div>
      <div>
        递增
        <InputNumber disabled={!enabled} style={{ width: "4em" }} value={added} onChange={(newVal) => {
          if (typeof newVal === "number") {
            setAdded(newVal)
          } else {
            setAdded(0)
          }
        }} />
      </div>
      <div title={`小于等于${0}: 内容置空\n大于0: 前补0到指定长度\n长度计算时不计算前缀/后缀`}>
        字符长度
        <InputNumber disabled={!enabled} style={{ width: "4em", color: zeroLength <= 0 ? "orange" : "inherit" }} value={zeroLength} onChange={(newVal) => {
          if (typeof newVal === "number") {
            setZeroLength(newVal)
          } else {
            setZeroLength(0)
          }
        }} />
      </div>
      <div>
        前缀
        <Input disabled={!enabled} style={{ width: "4em" }} value={prefix} onChange={(e) => {
          setPrefix(e.target.value || "")
        }} />
      </div>
      <div>
        后缀
        <Input disabled={!enabled} style={{ width: "4em" }} value={suffix} onChange={(e) => {
          setSuffix(e.target.value || "")
        }} />
      </div>
    </Space>,
  ]
}

const configToString = (config: ConfigProps, i: number, defaultVal = "") => {
  if (!config.enabled) { return defaultVal }
  let s = `${config.start + config.added * i}`.padStart(config.zeroLength, "0")
  if (config.zeroLength <= 0) { s = "" }
  return `${config.prefix}${s}${config.suffix}`
}

interface Props {
  paths: string[];
}

export default function RenameArea({ paths }: Props): JSX.Element {
  const [namePrefixConfig, NamePrefixConfigElement] = useConfig({ enabled: true, zeroLength: 0 })
  const [nameConfig, NameConfigElement] = useConfig({})
  const [nameSuffixConfig, NameSuffixConfigElement] = useConfig({ enabled: true, zeroLength: 1, prefix: "-" })
  const [suffixConfig, SuffixConfigElement] = useConfig({})

  const [renames, renamesActions] = useList<Rename>(() => paths.map((p, i) => {
    const rename = geneRename(p)
    const { ext, name } = path.parse(rename.base.path)
    rename.namePrefix = configToString(namePrefixConfig, i)
    rename.name = configToString(nameConfig, i, name)
    rename.nameSuffix = configToString(nameSuffixConfig, i)
    rename.suffix = configToString(suffixConfig, i, ext)
    return rename
  }))

  // const renames = useMemo(() => paths.map((p, i) => {
  //   const rename = geneRename(p)
  //   const { ext, name } = path.parse(rename.base.path)
  //   rename.namePrefix = namePrefixConfig.enabled ? `${namePrefixConfig.start + namePrefixConfig.added * i}`.padStart(namePrefixConfig.zeroLength, "0") : ""
  //   rename.name = nameConfig.enabled ? `${nameConfig.start + nameConfig.added * i}`.padStart(nameConfig.zeroLength, "0") : name
  //   rename.nameSuffix = nameSuffixConfig.enabled ? `${nameSuffixConfig.start + nameSuffixConfig.added * i}`.padStart(nameSuffixConfig.zeroLength, "0") : ""
  //   rename.suffix = suffixConfig.enabled ? `${suffixConfig.start + suffixConfig.added * i}`.padStart(suffixConfig.zeroLength, "0") : ext
  //   return rename
  // }), [
  //   paths, namePrefixConfig, nameConfig, nameSuffixConfig, suffixConfig,
  // ])

  return <div className={Styles.wrapper}>
    <Space align="end" style={{
      marginBottom: "1em",
    }}>
      <Button type="primary" size="small" ghost>
        <EditOutlined />
      </Button>
      <div className={Styles.dirname} style={{
        color: "transparent",
        backgroundColor: "transparent",
      }}>
        <ClipText text="" maxWidth={50} tailWidth={10} />
        _
      </div>
      {NamePrefixConfigElement}
      {NameConfigElement}
      {NameSuffixConfigElement}
      {SuffixConfigElement}
    </Space>

    {
      renames.map((rename) => (<Space key={rename.base.path}>
        <Button type="text" size="small">
          {
            rename.base.isFile
              ? <FileTextFilled />
              : <FolderFilled style={{ color: "#ad8300" }} />
          }
        </Button>

        <div className={Styles.dirname}>
          <ClipText text={rename.dirname} maxWidth={50} tailWidth={10} />
          <span>{path.sep}</span>
        </div>

        <Input className={Styles.input} value={rename.namePrefix} placeholder="前缀" />

        <Input className={Styles.input} value={rename.name} placeholder="文件名" />

        <Input className={Styles.input} value={rename.nameSuffix} placeholder="后缀" />

        <Input className={Styles.input} value={rename.suffix} placeholder="文件名后缀" />
      </Space>))
    }
  </div>
}
