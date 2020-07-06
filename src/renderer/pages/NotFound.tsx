import React from "react"
import { Link } from "react-router-dom"

export default function NotFound(): JSX.Element {
  return <p>
    404 Not Found: 该地址不存在, 请重新确认您的地址, 或者<Link to="/">返回首页</Link>
  </p>
}
