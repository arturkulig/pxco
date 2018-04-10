import * as React from 'react'
import { Panel } from '../src/Panel'

export class Demo extends React.Component<{}, { n: number }> {
  state = { n: 0 }

  componentDidMount() {
    this.increase()
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.raf)
  }

  raf = null

  increase = () => {
    this.setState(({ n }) => ({ n: n + 1 }))
    this.raf = requestAnimationFrame(this.increase)
  }

  render() {
    return (
      <Panel width="100%" height="100%" row center background="black">
        {Array.from(Array(200), (_, i) => {
          const color =
            '#' +
            [
              Math.floor(
                (Math.sin(this.state.n / 5 + 0.2 * i) + 1) * 128
              ).toString(16),
              Math.floor(
                (Math.sin(this.state.n / 7 + 0.1 * i) + 1) * 128
              ).toString(16),
              Math.floor(
                (Math.sin(this.state.n / 13 + 0.1 * i) + 1) * 128
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
