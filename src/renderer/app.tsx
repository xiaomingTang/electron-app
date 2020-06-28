import React from "react"
import ReactDOM from "react-dom"
import { shell } from "electron"

import "@Src/renderer/helpers/contextMenu"
import "./app.less"

function Link({
  href, onClick, children, ...props
}: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) {
  const curUrl = new URL(window.location.href)
  const tarUrl = new URL(href || "", window.location.href)
  const isSameOrigin = curUrl.origin === tarUrl.origin

  const defaultOnclick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isSameOrigin) { return }
    event.preventDefault()
    shell.openExternal(tarUrl.href)
  }

  return <a {...props} href={href} onClick={onClick || defaultOnclick}>{children}</a>
}

function App() {
  return <div>
    <Link href="#text">#text</Link>
    <p />
    <Link href="https://www.baidu.com/">https://www.baidu.com/</Link>
  </div>
}

const container = document.querySelector("#app")

ReactDOM.render(
  <App />,
  container,
)
