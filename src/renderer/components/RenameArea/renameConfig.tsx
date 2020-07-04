import React, { useState } from "react"
import path from "path"
import {
  Popover, Button, Radio, Space, InputNumber, Input, Tag, Divider,
} from "antd"
import {
  CaretDownOutlined, CaretUpOutlined, CloseOutlined, PlusOutlined,
} from "@ant-design/icons"

type ConfigType = "name" | "suffix" | "number" | "staticString"

type Config = {
  type: ConfigType;
}

interface NameConfig extends Config {
  type: "name";
}

interface SuffixConfig extends Config {
  type: "suffix";
}

interface NumberConfig extends Config {
  type: "number";
  start: number;
  added: number;
  width: number;
}

interface StaticStringConfig extends Config {
  type: "staticString";
  value: string;
}

export type RenameConfig = NameConfig | SuffixConfig | NumberConfig | StaticStringConfig

const labelMap: Record<ConfigType, string> = {
  name: "文件(夹)名",
  suffix: "后缀名",
  number: "自增数字",
  staticString: "固定字符串",
}

const radioOptions = Object.entries(labelMap).map(([value, label]) => ({ label, value }))

export function normalizeConfig(config: Partial<RenameConfig> & Pick<RenameConfig, "type">): RenameConfig {
  switch (config.type) {
  case "number":
    return {
      start: 1,
      added: 1,
      width: 1,
      ...config,
    }
  case "staticString":
    return {
      value: "",
      ...config,
    }
  case "suffix":
    return { type: "suffix" }
  default:
    return { type: "name" }
  }
}

export function configToString(p: string, config: RenameConfig, idx: number): string {
  const { ext, name } = path.parse(p)
  switch (config.type) {
  case "suffix":
    return ext
  case "number":
    return `${config.start + config.added * idx}`.padStart(config.width, "0")
  case "staticString":
    return config.value
  default:
    return name
  }
}

interface Props {
  config: RenameConfig;
  setConfig: (val: RenameConfig) => void;
  onRemove: () => void;
  insertBefore: () => void;
  insertAfter: () => void;
}

export function RenameConfigElement({
  config, setConfig, onRemove, insertBefore, insertAfter,
} : Props): JSX.Element {
  const [panelVisible, setPanelVisible] = useState(false)

  const Element = <Popover visible={panelVisible} title={null} placement="bottomLeft" content={<>
    <h5 style={{ position: "relative" }}>
      请选择类目
      <Button
        type="default"
        size="small"
        shape="circle-outline"
        style={{
          position: "absolute",
          right: "-16px",
          top: "-12px",
          transform: "translate(50%,-50%)",
        }}
        onClick={() => setPanelVisible(false)}
      >
        <CloseOutlined />
      </Button>
    </h5>
    <Radio.Group
      value={config.type}
      style={{
        display: "block",
        margin: ".5em 0",
      }}
      options={radioOptions}
      optionType="button"
      buttonStyle="solid"
      onChange={(e) => {
        setConfig({
          ...config,
          type: e.target.value,
        })
      }}
    />
    {
      config.type === "number" && <Space direction="vertical">
        <div>
          从
          <InputNumber style={{ width: "4em", margin: "0 .5em" }} value={config.start} onChange={(newVal = 0) => {
            if (typeof newVal === "number") {
              setConfig({
                ...config,
                start: newVal,
              })
            }
          }} />
          开始
        </div>
        <div>
          递增
          <InputNumber style={{ width: "4em", margin: "0 .5em" }} value={config.added} onChange={(newVal = 0) => {
            if (typeof newVal === "number") {
              setConfig({
                ...config,
                added: newVal,
              })
            }
          }} />
        </div>
        <div>
          字符串宽度
          <InputNumber style={{ width: "4em", margin: "0 .5em" }} value={config.width} onChange={(newVal = 0) => {
            if (typeof newVal === "number") {
              setConfig({
                ...config,
                width: newVal,
              })
            }
          }} />
          (宽度不足则前补0)
        </div>
      </Space>
    }
    {
      config.type === "staticString" && <Input placeholder="请输入字符串..." value={config.value} onChange={(e) => {
        setConfig({
          ...config,
          value: e.target.value || "",
        })
      }} />
    }
    <Divider />
    <h5>更多操作</h5>
    <Space>
      <Button size="small" onClick={insertBefore}>
        <PlusOutlined />
        在前面新增项
      </Button>
      <Button size="small" danger onClick={onRemove}>移除该项</Button>
      <Button size="small" onClick={insertAfter}>
        在后面新增项
        <PlusOutlined />
      </Button>
    </Space>
  </>}>
    <Button onClick={() => setPanelVisible(!panelVisible)}>
      {labelMap[config.type]}
      {
        config.type === "number" && <Tag color="processing">{config.start} + {config.added} 宽度 {config.width}</Tag>
      }
      {
        config.type === "staticString" && config.value.length > 0 && <Tag color="default">{config.value}</Tag>
      }
      {
        panelVisible ? <CaretUpOutlined /> : <CaretDownOutlined />
      }
    </Button>
  </Popover>

  return Element
}
