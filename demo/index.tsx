import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { StyleSinkContext, StyleSink } from '../src/StylesSink'
import { Demo } from './demo'

console.clear()
console.log(new Date().toString())

const style: HTMLStyleElement =
  Array.from(document.getElementsByTagName('style')).filter(
    (e) => e.id === 'sandboxStyle'
  )[0] || document.createElement('style')
style.setAttribute('id', 'sandboxStyle')
const sheet = style.sheet as CSSStyleSheet
if (sheet) {
  const sheetLenght = sheet.cssRules.length
  for (let i = 0; i < sheetLenght; i++) {
    sheet.deleteRule(0)
  }
}
if (!document.getElementById('sandboxStyle')) {
  document.body.appendChild(style)
}
const ss = new StyleSink(style.sheet as CSSStyleSheet, 2)

class App extends React.Component {
  render() {
    return (
      <StyleSinkContext sink={ss}>
        <Demo />
      </StyleSinkContext>
    )
  }
}

const mount: HTMLDivElement =
  Array.from(document.getElementsByTagName('div')).filter(
    (e) => e.id === 'mount'
  )[0] || document.createElement('div')
if (!document.getElementById('mount')) {
  document.body.appendChild(mount)
}
ReactDOM.unmountComponentAtNode(mount)
mount.setAttribute('id', 'mount')
ReactDOM.render(<App />, mount)
