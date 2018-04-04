import * as React from 'react'
import { CSSProperties, CSSPropertiesNames } from './CSSProperties'
import { StyleSink } from './StylesSink'

const isBrowser = typeof window !== 'undefined'
const TARGET_FRAME_RATE = 60
const STACK_CONTEXT_TRIGGERS: Array<CSSPropertiesNames> = [
  'position',
  'transform',
  'opacity',
  'zIndex',
  'filter',
  'perspective',
  'mask',
  'maskBorder'
]

const now =
  typeof window !== 'undefined' && window.performance && window.performance.now
    ? () => window.performance.now()
    : () => now()

class Styled extends React.Component<{
  component
  componentProps
  style: CSSProperties
}> {
  static contextTypes = {
    styleSink: () => null
  }

  context: {
    styleSink: StyleSink
  }

  ref: HTMLElement
  get element() {
    if (Styled.stylingApplicationQueue.indexOf(this) >= 0) {
      Styled.stylingApplicationQueue.splice(
        Styled.stylingApplicationQueue.indexOf(this),
        1
      )
      this.applyStylesImmediately()
    }
    return this.ref
  }
  changingStyles: string[] = []
  currentVisualDesc: { className: string; style: CSSProperties } = {
    className: '',
    style: {}
  }

  static lastFlushTS: number = 0
  static stylingApplicationQueue: Styled[] = []
  static flushApplicationQueue() {
    Styled.lastFlushTS = now()
    requestAnimationFrame(Styled.applyMostStyling)
  }
  static applyMostStyling() {
    if (document.visibilityState === 'hidden') {
      Styled.lastFlushTS = now()
      requestAnimationFrame(Styled.applyMostStyling)
      return
    }

    while (Styled.stylingApplicationQueue.length) {
      if (now() - Styled.lastFlushTS > 1000 / TARGET_FRAME_RATE) {
        Styled.lastFlushTS = now()
        requestAnimationFrame(Styled.applyMostStyling)
        return
      }

      Styled.stylingApplicationQueue.splice(0, 1)[0].applyStylesImmediately()
    }
  }

  componentDidUpdate(prevProps) {
    for (const k in this.props.style) {
      if (
        STACK_CONTEXT_TRIGGERS.indexOf(k as CSSPropertiesNames) < 0 &&
        this.props.style[k] !== prevProps.style[k]
      ) {
        if (this.changingStyles.indexOf(k) < 0) {
          this.changingStyles.push(k)
        }
      }
    }

    this.requestStyleApplication()
  }

  componentWillUnmount() {
    this.ref = null
    this.changingStyles = null
    this.currentVisualDesc = null
  }

  handleRef = (ref) => {
    if (!ref) {
      return
    }
    if (this.element == null) {
      this.ref = ref
      this.applyStylesImmediately()
    } else {
      this.ref = ref
      this.requestStyleApplication()
    }
  }

  requestStyleApplication() {
    if (Styled.stylingApplicationQueue.length === 0) {
      Styled.flushApplicationQueue()
    }
    if (Styled.stylingApplicationQueue.indexOf(this) < 0) {
      Styled.stylingApplicationQueue.push(this)
    }
  }

  applyStylesImmediately() {
    if (!this.element) {
      return
    }
    const currentStyle = this.currentVisualDesc.style
    const currentClassNames = this.currentVisualDesc.className
    const visualDesc = this.getVisualDesc()

    const nextClassNames = `${visualDesc.className || ''} ${this.props
      .componentProps.className || ''}`
    if (currentClassNames !== nextClassNames) {
      this.currentVisualDesc.className = this.element.className = nextClassNames
    }

    const mentionedProperties = []
    for (const k in visualDesc.style) {
      if (mentionedProperties.indexOf(k) < 0) {
        mentionedProperties.push(k)
      }
    }
    for (const k in currentStyle) {
      if (mentionedProperties.indexOf(k) < 0) {
        mentionedProperties.push(k)
      }
    }

    for (const k of mentionedProperties) {
      const newValue =
        typeof visualDesc.style[k] === 'string'
          ? visualDesc.style[k]
          : visualDesc.style[k] ? visualDesc.style[k].toString() : null
      if (newValue !== currentStyle[k]) {
        const oldValue = this.element.style[k]
        currentStyle[k] = this.element.style[k] = newValue
        if (process.env.NODE_ENV !== 'production') {
          if (oldValue === this.element.style[k]) {
            console.warn(
              { element: this.element },
              `did not update\n${k}="${oldValue}"\nwith\n"${newValue}"`
            )
          }
        }
      }
    }
  }

  getVisualDesc = isBrowser
    ? () => {
        return { className: '', style: this.props.style }
      }
    : () => {
        if (!this.context.styleSink) {
          throw new Error(
            'StyleSinkContext required above Styled component placement'
          )
        }
        return this.context.styleSink.getDesc(this.props.style)
      }

  render() {
    const Root = this.props.component as any

    if (isBrowser) {
      return <Root {...this.props.componentProps} ref={this.handleRef} />
    }

    const visualDesc = this.getVisualDesc()

    const {
      componentProps: { className = null, ...componentProps }
    } = this.props

    return (
      <Root
        {...this.props.componentProps}
        className={
          visualDesc.className ? (
            [ visualDesc.className, className || '' ].join(' ')
          ) : (
            className
          )
        }
        style={kebabKeysToSnakeKeys(visualDesc.style)}
      />
    )
  }
}

function kebabKeysToSnakeKeys(styles: CSSProperties) {
  if (styles == null) {
    return null
  }
  return styles
    ? Object.keys(styles).reduce<CSSProperties>(
        (r, key) => ({
          ...r,
          [kebabToSnake(key)]: styles[key]
        }),
        {} as CSSProperties
      )
    : null
}

const kebabToSnakeCache = {}
function kebabToSnake(subject: string) {
  if (kebabToSnakeCache[subject]) {
    return kebabToSnakeCache[subject]
  }
  return (kebabToSnakeCache[subject] = subject
    .split('-')
    .map(
      (word, i) =>
        i === 0 ? word : word.slice(0, 1).toUpperCase() + word.slice(1)
    )
    .join(''))
}

export { Styled }
