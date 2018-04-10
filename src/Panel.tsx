import * as React from 'react'
import CSS from './CSS'
import { panelRules, StaticPanelProps } from './PanelRules'
import { HTMLProperties } from './HTMLProperties'
import { EventProperties } from './EventProperties'
import { Styled } from './Styled'

import {
  hoverReactive,
  pressReactive,
  focusReactive,
  Interactions,
  InteractiveComponent
} from './Interactions'

export type StateDependentMaybe<T> = T | ((state: Interactions) => T)
export type StateDependentProps<T extends object> = {
  [id in keyof T]: StateDependentMaybe<T[id]>
}

export interface PanelOwnProps extends StateDependentProps<StaticPanelProps> {}
export interface PanelHTMLProps<ELEM = HTMLElement>
  extends StateDependentProps<HTMLProperties>,
    EventProperties<ELEM> {}
export interface PanelProps<ELEM = HTMLElement>
  extends PanelHTMLProps<ELEM>,
    PanelOwnProps {
  still?: boolean | string | number
  children?:
    | StateDependentMaybe<React.ReactNode>
    | StateDependentMaybe<React.ReactNode>[]
}

const STYLES_RESET: CSS.CSSProperties = {
  marginLeft: '0',
  marginRight: '0',
  marginTop: '0',
  marginBotton: '0',
  paddingLeft: '0',
  paddingRight: '0',
  paddingTop: '0',
  paddingBotton: '0',
  boxSizing: 'border-box'
}

export class Panel<
  ELEM extends HTMLElement = HTMLDivElement
> extends React.Component<PanelProps<ELEM>, Interactions>
  implements InteractiveComponent<ELEM> {
  protected component:
    | React.Component<{ className: string; style: CSS.CSSProperties }>
    | string = 'div'

  protected elemStyles: CSS.CSSProperties = {
    ...STYLES_RESET,
    display: 'flex' as 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  }

  state: Interactions = { focus: false, press: false, hover: false }
  styled: Styled | null = null
  get element(): ELEM {
    return ((this.styled ? this.styled.element : null) as any) as ELEM
  }

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.still === false ||
      nextProps.still == null ||
      nextProps.still !== this.props.still
    )
  }

  componentWillUnmount() {
    this.styled = null
    hoverReactive.delete(this)
    pressReactive.delete(this)
    focusReactive.delete(this)
  }

  handleRef = (ref: Styled) => {
    if (!ref) {
      return
    }
    this.styled = ref
  }

  getInteractions(): Interactions {
    if (this.props.interactive === false) {
      return { hover: false, focus: false, press: false }
    }
    const { hover, press, focus } = this.state
    return Object.defineProperties(
      {},
      {
        hover: {
          get: () => {
            hoverReactive.add(this)
            return hover
          },
          enumerable: true,
          configurable: false
        },
        press: {
          get: () => {
            pressReactive.add(this)
            return press
          },
          enumerable: true,
          configurable: false
        },
        focus: {
          get: () => {
            focusReactive.add(this)
            return focus
          },
          enumerable: true,
          configurable: false
        }
      }
    )
  }

  render() {
    const { props } = this
    const ownProps: { still; style } = {
      still: false,
      style: null
    }
    const panelDescription: StaticPanelProps = {}
    const rootProps = {} as PanelHTMLProps<ELEM> & {
      children?: React.ReactFragment
    }

    let interactions: Interactions | null = null

    for (const propName in props) {
      if (propName === 'still') {
        ownProps[propName] = props[propName]
      } else if (propName.slice(0, 2) === 'on') {
        rootProps[propName] = props[propName]
      } else {
        const valOrPropGen = props[propName]

        if (propName === 'children' && valOrPropGen[Symbol.iterator] != null) {
          rootProps[propName] = React.createElement(
            React.Fragment,
            null,
            ...[
              ...valOrPropGen
            ].map(
              (singleValOrPropGen: StateDependentMaybe<React.ReactNode>) => {
                return typeof singleValOrPropGen === 'function'
                  ? singleValOrPropGen(
                      interactions || (interactions = this.getInteractions())
                    )
                  : singleValOrPropGen
              }
            )
          )
        } else {
          const val =
            typeof valOrPropGen === 'function'
              ? valOrPropGen(
                  interactions || (interactions = this.getInteractions())
                )
              : valOrPropGen

          if (propName === 'style') {
            ownProps[propName] = val
          }
          if (panelRules.keys.indexOf(propName as any) >= 0) {
            panelDescription[propName] = val
          } else {
            rootProps[propName] = val
          }
        }
      }
    }

    const panelStyle: CSS.CSSProperties = panelRules.exec(panelDescription)

    const joinedStyle: CSS.CSSProperties = ownProps.style
      ? {
          ...this.elemStyles,
          ...panelStyle,
          ...ownProps.style
        }
      : { ...this.elemStyles, ...panelStyle }

    return (
      <Styled
        ref={this.handleRef}
        component={this.component}
        componentProps={rootProps}
        style={joinedStyle}
      />
    )
  }

  static createOfPrimitive<ELEM extends HTMLElement>(
    component: string,
    defaultStyles?: CSS.CSSProperties
  ) {
    if (defaultStyles) {
      return class PanelDescendantWStyles extends Panel<ELEM> {
        protected component = component
        protected elemStyles = defaultStyles!
      }
    }
    return class PanelDescendant extends Panel<ELEM> {
      protected component = component
    }
  }

  static CSS = CSS

  static a = Panel.createOfPrimitive<HTMLAnchorElement>('a')
  static abbr = Panel.createOfPrimitive<HTMLElement>('abbr')
  static address = Panel.createOfPrimitive<HTMLElement>('address')
  static area = Panel.createOfPrimitive<HTMLElement>('area')
  static article = Panel.createOfPrimitive<HTMLElement>('article')
  static aside = Panel.createOfPrimitive<HTMLElement>('aside')
  static audio = Panel.createOfPrimitive<HTMLElement>('audio')
  static b = Panel.createOfPrimitive<HTMLElement>('b')
  static base = Panel.createOfPrimitive<HTMLElement>('base')
  static bdi = Panel.createOfPrimitive<HTMLElement>('bdi')
  static bdo = Panel.createOfPrimitive<HTMLElement>('bdo')
  static big = Panel.createOfPrimitive<HTMLElement>('big')
  static blockquote = Panel.createOfPrimitive<HTMLElement>('blockquote')
  static body = Panel.createOfPrimitive<HTMLElement>('body')
  static br = Panel.createOfPrimitive<HTMLElement>('br')
  static button = Panel.createOfPrimitive<HTMLButtonElement>('button')
  static canvas = Panel.createOfPrimitive<HTMLCanvasElement>('canvas')
  static caption = Panel.createOfPrimitive<HTMLElement>('caption', {
    display: 'table-caption'
  })
  static cite = Panel.createOfPrimitive<HTMLElement>('cite')
  static code = Panel.createOfPrimitive<HTMLElement>('code')
  static col = Panel.createOfPrimitive<HTMLElement>('col', {
    display: 'table-column'
  })
  static colgroup = Panel.createOfPrimitive<HTMLElement>('colgroup', {
    display: 'table-column-group'
  })
  static data = Panel.createOfPrimitive<HTMLElement>('data')
  static datalist = Panel.createOfPrimitive<HTMLElement>('datalist')
  static dd = Panel.createOfPrimitive<HTMLElement>('dd')
  static del = Panel.createOfPrimitive<HTMLElement>('del')
  static details = Panel.createOfPrimitive<HTMLElement>('details')
  static dfn = Panel.createOfPrimitive<HTMLElement>('dfn')
  static dialog = Panel.createOfPrimitive<HTMLElement>('dialog')
  static div = Panel.createOfPrimitive<HTMLElement>('div')
  static dl = Panel.createOfPrimitive<HTMLElement>('dl')
  static dt = Panel.createOfPrimitive<HTMLElement>('dt')
  static em = Panel.createOfPrimitive<HTMLElement>('em')
  static embed = Panel.createOfPrimitive<HTMLEmbedElement>('embed')
  static fieldset = Panel.createOfPrimitive<HTMLElement>('fieldset')
  static figcaption = Panel.createOfPrimitive<HTMLElement>('figcaption')
  static figure = Panel.createOfPrimitive<HTMLElement>('figure')
  static footer = Panel.createOfPrimitive<HTMLElement>('footer')
  static form = Panel.createOfPrimitive<HTMLElement>('form')
  static h1 = Panel.createOfPrimitive<HTMLElement>('h1')
  static h2 = Panel.createOfPrimitive<HTMLElement>('h2')
  static h3 = Panel.createOfPrimitive<HTMLElement>('h3')
  static h4 = Panel.createOfPrimitive<HTMLElement>('h4')
  static h5 = Panel.createOfPrimitive<HTMLElement>('h5')
  static h6 = Panel.createOfPrimitive<HTMLElement>('h6')
  static header = Panel.createOfPrimitive<HTMLElement>('header')
  static hgroup = Panel.createOfPrimitive<HTMLElement>('hgroup')
  static hr = Panel.createOfPrimitive<HTMLElement>('hr')
  static i = Panel.createOfPrimitive<HTMLElement>('i')
  static iframe = Panel.createOfPrimitive<HTMLIFrameElement>('iframe')
  static img = Panel.createOfPrimitive<HTMLElement>('img', { display: 'block' })
  static input = Panel.createOfPrimitive<HTMLInputElement>('input')
  static ins = Panel.createOfPrimitive<HTMLElement>('ins')
  static kbd = Panel.createOfPrimitive<HTMLElement>('kbd')
  static keygen = Panel.createOfPrimitive<HTMLElement>('keygen')
  static label = Panel.createOfPrimitive<HTMLLabelElement>('label')
  static legend = Panel.createOfPrimitive<HTMLElement>('legend')
  static li = Panel.createOfPrimitive<HTMLElement>('li', {
    display: 'list-item'
  })
  static main = Panel.createOfPrimitive<HTMLElement>('main')
  static map = Panel.createOfPrimitive<HTMLElement>('map')
  static mark = Panel.createOfPrimitive<HTMLElement>('mark')
  static menu = Panel.createOfPrimitive<HTMLElement>('menu')
  static menuitem = Panel.createOfPrimitive<HTMLElement>('menuitem')
  static meta = Panel.createOfPrimitive<HTMLElement>('meta')
  static meter = Panel.createOfPrimitive<HTMLElement>('meter')
  static nav = Panel.createOfPrimitive<HTMLElement>('nav')
  static object = Panel.createOfPrimitive<HTMLObjectElement>('object')
  static ol = Panel.createOfPrimitive<HTMLElement>('ol')
  static optgroup = Panel.createOfPrimitive<HTMLElement>('optgroup')
  static option = Panel.createOfPrimitive<HTMLOptionElement>('option')
  static output = Panel.createOfPrimitive<HTMLOutputElement>('output')
  static p = Panel.createOfPrimitive<HTMLElement>('p')
  static param = Panel.createOfPrimitive<HTMLElement>('param')
  static picture = Panel.createOfPrimitive<HTMLElement>('picture')
  static pre = Panel.createOfPrimitive<HTMLElement>('pre')
  static progress = Panel.createOfPrimitive<HTMLProgressElement>('progress')
  static q = Panel.createOfPrimitive<HTMLElement>('q')
  static rp = Panel.createOfPrimitive<HTMLElement>('rp')
  static rt = Panel.createOfPrimitive<HTMLElement>('rt')
  static ruby = Panel.createOfPrimitive<HTMLElement>('ruby')
  static s = Panel.createOfPrimitive<HTMLElement>('s')
  static samp = Panel.createOfPrimitive<HTMLElement>('samp')
  static section = Panel.createOfPrimitive<HTMLElement>('section')
  static select = Panel.createOfPrimitive<HTMLSelectElement>('select')
  static small = Panel.createOfPrimitive<HTMLElement>('small')
  static source = Panel.createOfPrimitive<HTMLElement>('source')
  static span = Panel.createOfPrimitive<HTMLElement>('span')
  static strong = Panel.createOfPrimitive<HTMLElement>('strong')
  static style = Panel.createOfPrimitive<HTMLElement>('style', {
    display: 'none'
  })
  static sub = Panel.createOfPrimitive<HTMLElement>('sub')
  static summary = Panel.createOfPrimitive<HTMLElement>('summary')
  static sup = Panel.createOfPrimitive<HTMLElement>('sup')
  static table = Panel.createOfPrimitive<HTMLElement>('table', {
    display: 'table'
  })
  static tbody = Panel.createOfPrimitive<HTMLElement>('tbody', {
    display: 'table-row-group'
  })
  static td = Panel.createOfPrimitive<HTMLElement>('td', {
    display: 'table-cell'
  })
  static textarea = Panel.createOfPrimitive<HTMLTextAreaElement>('textarea')
  static tfoot = Panel.createOfPrimitive<HTMLElement>('tfoot', {
    display: 'table-footer-group'
  })
  static th = Panel.createOfPrimitive<HTMLElement>('th')
  static thead = Panel.createOfPrimitive<HTMLElement>('thead', {
    display: 'table-header-group'
  })
  static time = Panel.createOfPrimitive<HTMLTimeElement>('time')
  static tr = Panel.createOfPrimitive<HTMLElement>('tr', {
    display: 'table-row'
  })
  static track = Panel.createOfPrimitive<HTMLTrackElement>('track')
  static u = Panel.createOfPrimitive<HTMLElement>('u')
  static ul = Panel.createOfPrimitive<HTMLElement>('ul')
  static video = Panel.createOfPrimitive<HTMLVideoElement>('video')
  static wbr = Panel.createOfPrimitive<HTMLElement>('wbr')
  static webview = Panel.createOfPrimitive<HTMLWebViewElement>('webview')
}
