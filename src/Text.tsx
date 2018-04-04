import * as React from 'react'
import { CSSProperties } from './CSSProperties'
import { Scalar, scalarToCSSValue } from './StyleTypes'
import { Styled } from './Styled'
import { textRules, TextProps } from './TextRules'

const defaultFontSize = '10px'
const defaultLineHeight = '12px'

const defaultTextStyles: CSSProperties = {
  display: 'inline',
  'fontFamily': 'var(--sans-serif-font, sans-serif)',
  'flexDirection': 'row',
  'alignItems': 'center',
  'fontSize': defaultFontSize,
  'lineHeight': defaultLineHeight,
  'verticalAlign': 'bottom',
  'pointerEvents': 'none'
}

export interface TextContext {
  lh: Scalar
}

export class Text<
  T = React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >
> extends React.Component<TextProps & T & { still?: boolean }> {
  static contextTypes = {
    inText: () => null
  }

  context: { inText: TextContext }

  // ---

  static childContextTypes = {
    inText: () => null
  }

  getChildContext(): { inText: TextContext } {
    return {
      inText: {
        lh:
          this.props.lh ||
          this.props.lineHeight ||
          (this.props.size &&
            scalarToCSSValue(this.props.size).mul(1.2)) ||
          defaultLineHeight
      }
    }
  }

  // ---

  protected component:
    | React.Component<{ className: string; style: CSSProperties }>
    | string
  protected defaultStyles = defaultTextStyles

  getComponent() {
    if (this.component != null) {
      return this.component
    }
    return this.context.inText ? 'span' : 'p'
  }

  render() {
    const props: { still: boolean; style: CSSProperties } = {
      still: false,
      style: null
    }
    const textDescription: TextProps = {}
    const rootProps = {}

    for (const propName in this.props) {
      if (propName === 'still' || propName === 'style') {
        props[propName] = this.props[propName]
      } else if (textRules.keys.indexOf(propName as any) >= 0) {
        textDescription[propName] = this.props[propName]
      } else {
        rootProps[propName] = this.props[propName]
      }
    }

    const panelStyle: CSSProperties = textRules.exec(textDescription)

    const joinedStyle: CSSProperties = {
      ...this.defaultStyles,
      ...props.style ? { ...props.style } : {},
      ...panelStyle
    }
    if (this.context.inText) {
      joinedStyle['line-height'] = scalarToCSSValue(
        this.context.inText.lh
      )
      joinedStyle['margin-top'] = `calc( ${joinedStyle[
        'line-height'
      ]} / 2 - ${scalarToCSSValue(this.context.inText.lh)} / 2 )`
    }

    const Root = this.getComponent()

    return (
      <Styled component={Root} componentProps={rootProps} style={joinedStyle} />
    )
  }

  static createOfPrimitive<K extends keyof JSX.IntrinsicElements>(
    component: K,
    defaultStyles?: typeof defaultTextStyles
  ) {
    if (defaultStyles) {
      return class TextDescendant extends Text<JSX.IntrinsicElements[K]> {
        protected component = component
        protected defaultStyles = defaultStyles
      }
    }
    return class TextDescendant extends Text<JSX.IntrinsicElements[K]> {
      protected component = component
    }
  }

  static a = Text.createOfPrimitive<'a'>('a' as 'a')
  static span = Text.createOfPrimitive<'span'>('span' as 'span')
  static h1 = Text.createOfPrimitive<'h1'>('h1' as 'h1', {
    ...defaultTextStyles,
    display: 'block',
    'fontSize': `${10 * Math.pow(1.2, 6)}px`,
    'lineHeight': `${10 * Math.pow(1.2, 6 + 1)}px`
  })
  static h2 = Text.createOfPrimitive<'h2'>('h2' as 'h2', {
    ...defaultTextStyles,
    display: 'block',
    'fontSize': `${10 * Math.pow(1.2, 5)}px`,
    'lineHeight': `${10 * Math.pow(1.2, 5 + 1)}px`
  })
  static h3 = Text.createOfPrimitive<'h3'>('h3' as 'h3', {
    ...defaultTextStyles,
    display: 'block',
    'fontSize': `${10 * Math.pow(1.2, 4)}px`,
    'lineHeight': `${10 * Math.pow(1.2, 4 + 1)}px`
  })
  static h4 = Text.createOfPrimitive<'h4'>('h4' as 'h4', {
    ...defaultTextStyles,
    display: 'block',
    'fontSize': `${10 * Math.pow(1.2, 3)}px`,
    'lineHeight': `${10 * Math.pow(1.2, 3 + 1)}px`
  })
  static h5 = Text.createOfPrimitive<'h5'>('h5' as 'h5', {
    ...defaultTextStyles,
    display: 'block',
    'fontSize': `${10 * Math.pow(1.2, 2)}px`,
    'lineHeight': `${10 * Math.pow(1.2, 2 + 1)}px`
  })
  static h6 = Text.createOfPrimitive<'h6'>('h6' as 'h6', {
    ...defaultTextStyles,
    display: 'block',
    'fontSize': `${10 * Math.pow(1.2, 1)}px`,
    'lineHeight': `${10 * Math.pow(1.2, 1 + 1)}px`
  })
  static p = Text.createOfPrimitive<'p'>('p' as 'p', {
    ...defaultTextStyles,
    display: 'block'
  })
  static u = Text.createOfPrimitive<'u'>('u' as 'u')
  static b = Text.createOfPrimitive<'b'>('b' as 'b')
  static i = Text.createOfPrimitive<'i'>('i' as 'i')
}

export { Text as T, TextProps }
