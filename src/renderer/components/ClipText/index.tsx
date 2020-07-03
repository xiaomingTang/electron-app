import React, { useMemo, HTMLAttributes } from "react"
import Styles from "./index.module.less"

export function getStringWidth(s: string): number {
  const regMatch = s.match(/[^ -~]/g)
  if (!regMatch) { return s.length }
  return s.length + regMatch.length
}

interface Props extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  /**
   * >= 0
   */
  maxWidth: number;
  /**
   * >= 0 && <= maxWidth
   */
  tailWidth?: number;
  alwaysMaxWidth?: boolean;
}

export function ClipText({
  text, maxWidth, tailWidth = 0, alwaysMaxWidth = true, className, style, ...props
}: Props): JSX.Element {
  const len = useMemo(() => getStringWidth(text), [text])

  // 明明计算下来能放下的, 可浏览器偏偏放不下
  // 例如, 理论上 40 个英文字符仅占用 20em, 可实际上需要 21em 才能放下
  if (len < maxWidth - 3) {
    return <span
      {...props}
      className={`${Styles.clipText} ${className}`}
      style={{
        ...style,
        [alwaysMaxWidth ? "width" : "maxWidth"]: `${maxWidth / 2}em`,
      }}
    >
      {text}
    </span>
  }

  const preWidth = Math.max(maxWidth - tailWidth, 0)
  const availableTailWidth = Math.min(maxWidth, tailWidth)

  return <span {...props} className={className} style={style}>
    <span
      className={Styles.clipText}
      style={{ [alwaysMaxWidth ? "width" : "maxWidth"]: `${preWidth / 2}em` }}
    >
      {text}
    </span>
    {
      availableTailWidth > 0 && <span
        className={Styles.tail}
        style={{
          [alwaysMaxWidth ? "width" : "maxWidth"]: `${availableTailWidth / 2}em`,
        }}
      >
        {text}
      </span>
    }
  </span>
}
