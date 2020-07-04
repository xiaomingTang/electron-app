import React from "react"
import ReactDOM from "react-dom"
import {
  HashRouter, Route, Switch,
} from "react-router-dom"

import "@Renderer/helpers/contextMenu"

import NotFound from "@Renderer/pages/NotFound"
import RenameArea from "@Renderer/components/RenameArea"

import "./app.less"

const container = document.querySelector("#app")

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route path="/" exact component={RenameArea} />
      <Route component={NotFound} />
    </Switch>
  </HashRouter>,
  container,
)
