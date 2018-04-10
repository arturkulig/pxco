import * as React from 'react'
import { Panel } from '../src/Panel'

export class Demo extends React.Component<{}, { n: number }> {
  state = { n: 0 }

  componentDidMount() {
    this.increase()
  }

  increase = () => {
    this.setState(({ n }) => ({ n: n + 1 }))
    requestAnimationFrame(this.increase)
  }

  render() {
    return (
      <Panel width="100%" height="100%" row center background="black">
        {Array.from(Array(200), (_, i) => {
          const color =
            '#' +
            [
              Math.floor(
                (Math.sin(Date.now() / 50 + 0.2 * i) + 1) * 128
              ).toString(16),
              Math.floor(
                (Math.sin(Date.now() / 70 + 0.1 * i) + 1) * 128
              ).toString(16),
              Math.floor(
                (Math.sin(Date.now() / 130 + 0.1 * i) + 1) * 128
              ).toString(16)
            ]
              .map((n) => (n.length < 1 ? '00' : n.length < 2 ? `0${n}` : n))
              .join('')

          return <Panel key={i} size={10} background={color} center />
        })}
      </Panel>
    )
  }
}
