import CSS from './CSS'
import {
  Scalar,
  scalarToCSSValue,
  Directions,
  Diagonals,
  getDiagonalRules,
  getDirectionalRules,
  AlignContent,
  AlignItems,
  alignItemsShort,
  flexAlignToTextAlign,
  alignContentShort,
  JustifyContent,
  justifyContentShort,
  AlignSelf,
  alignSelfShort
} from './StyleTypes'
import { StyleInterpretations } from './StyleInterpretations'
import { textRules, TextProps } from './TextRules'

export const panelRules = new StyleInterpretations({})
  .add({
    display: (_: { display: CSS.CSSProperties['display'] }) => ({
      display: _.display
    })
  })
  .add({
    block: (_: { block: true }) =>
      _.block
        ? {
            display: 'block' as 'block'
          }
        : StyleInterpretations.Empty
  })
  .add({
    inline: (_: { inline: true }) =>
      _.inline
        ? {
            display: 'inline' as 'inline'
          }
        : StyleInterpretations.Empty
  })
  .add({
    relative: (_: { relative: boolean | Directions<Scalar> }) =>
      _.relative === false
        ? StyleInterpretations.Empty
        : _.relative === true
          ? { position: 'relative' as 'relative' }
          : {
              position: 'relative' as 'relative',
              ...getDirectionalRules<
                Scalar,
                Scalar,
                string | CSS.CSSStyleValue
              >(
                { t: 'top', b: 'bottom', l: 'left', r: 'right' },
                _.relative,
                scalarToCSSValue
              )
            }
  })
  .add({
    absolute: (_: { absolute: boolean | Directions<Scalar> }) =>
      _.absolute === false
        ? StyleInterpretations.Empty
        : _.absolute === true
          ? { position: 'absolute' as 'absolute' }
          : {
              position: 'absolute' as 'absolute',
              ...getDirectionalRules<
                Scalar,
                Scalar,
                string | CSS.CSSStyleValue
              >(
                { t: 'top', b: 'bottom', l: 'left', r: 'right' },
                _.absolute,
                scalarToCSSValue
              )
            }
  })
  .add({
    fixed: (_: { fixed: boolean | Directions<Scalar> }) =>
      _.fixed === false
        ? StyleInterpretations.Empty
        : _.fixed === true
          ? { position: 'fixed' as 'fixed' }
          : {
              position: 'fixed' as 'fixed',
              ...getDirectionalRules<
                Scalar,
                Scalar,
                string | CSS.CSSStyleValue
              >(
                { t: 'top', b: 'bottom', l: 'left', r: 'right' },
                _.fixed,
                scalarToCSSValue
              )
            }
  })
  .add({
    flex: (_: { flex: Scalar }) => ({
      flex: scalarToCSSValue(_.flex, 'fr')
    })
  })
  .add({
    order: (_: { order: Scalar }) => ({ order: +_.order })
  })
  .add({
    row: (_: { row: boolean }) => ({
      flexDirection: _.row ? 'row' as 'row' : 'column' as 'column'
    })
  })
  .add({
    wrap: (_: { wrap: boolean | 'reverse' }) => ({
      flexWrap:
        typeof _.wrap === 'boolean'
          ? _.wrap ? 'wrap' as 'wrap' : 'nowrap' as 'nowrap'
          : 'wrap-reverse' as 'wrap-reverse'
    })
  })
  .add({
    align: (_: {
      align: AlignContent
      row?: boolean
      wrap?: boolean | 'reverse'
    }) => ({
      alignItems: alignItemsShort[_.align],
      ...!_.row && flexAlignToTextAlign[_.align]
        ? { textAlign: flexAlignToTextAlign[_.align] }
        : {},
      ..._.wrap === true || _.wrap === 'reverse'
        ? { alignContent: alignContentShort[_.align] }
        : {}
    })
  })
  .add({
    alignItems: (_: { alignItems: AlignItems }) => ({
      alignItems: alignItemsShort[_.alignItems]
    })
  })
  .add({
    alignContent: (_: { alignContent: AlignContent }) => ({
      alignContent: alignContentShort[_.alignContent]
    })
  })
  .add({
    justify: (_: { justify: JustifyContent; row?: boolean }) =>
      _.row && flexAlignToTextAlign[_.justify]
        ? {
            justifyContent: justifyContentShort[_.justify],
            textAlign: flexAlignToTextAlign[_.justify]
          }
        : {
            justifyContent: justifyContentShort[_.justify]
          }
  })
  .add({
    center: (_: {
      center: boolean | 'horizontal' | 'vertical'
      row?: boolean
    }) =>
      _.center === true
        ? {
            justifyContent: 'center' as 'center',
            alignItems: 'center' as 'center',
            textAlign: 'center' as 'center'
          }
        : (_.center === 'horizontal' && _.row) ||
          (_.center === 'vertical' && !_.row)
          ? {
              textAlign: 'center' as 'center',
              alignItems: 'center' as 'center'
            }
          : {
              justifyContent: 'center' as 'center'
            }
  })
  .add({
    alignSelf: (_: { alignSelf: AlignSelf }) => ({
      alignSelf: alignSelfShort[_.alignSelf]
    })
  })
  .add({
    round: (_: { round: Scalar | Diagonals<Scalar> }) =>
      getDiagonalRules<Scalar, Scalar, string | CSS.CSSStyleValue>(
        {
          tl: 'border-top-left-radius',
          tr: 'border-top-right-radius',
          bl: 'border-bottom-left-radius',
          br: 'border-bottom-right-radius'
        },
        _.round,
        scalarToCSSValue
      )
  })
  .add({
    border: (_: { border: Scalar | Directions<Scalar> }) =>
      getDirectionalRules<Scalar, Scalar, string>(
        {
          t: 'border-top',
          b: 'border-bottom',
          l: 'border-left',
          r: 'border-right'
        },
        _.border,
        borderFromScalar
      )
  })
  .add({
    outline: (_: { outline: Scalar }) => ({
      outline: borderFromScalar(_.outline)
    })
  })
  .add({
    margin: (_: { margin: Scalar | Directions<Scalar> }) =>
      getDirectionalRules<Scalar, Scalar, CSS.CSSNumericValue>(
        {
          t: 'margin-top',
          b: 'margin-bottom',
          l: 'margin-left',
          r: 'margin-right'
        },
        _.margin,
        (_) => scalarToCSSValue(_)
      )
  })
  .add({
    padding: (_: { padding: Scalar | Directions<Scalar> }) =>
      getDirectionalRules<Scalar, Scalar, CSS.CSSNumericValue>(
        {
          t: 'padding-top',
          b: 'padding-bottom',
          l: 'padding-left',
          r: 'padding-right'
        },
        _.padding,
        (_) => scalarToCSSValue(_)
      )
  })
  .add({
    size: (_: { size: Scalar }) => ({
      width: scalarToCSSValue(_.size),
      height: scalarToCSSValue(_.size)
    })
  })
  .add({
    width: (_: { width: Scalar }) => ({
      width: scalarToCSSValue(_.width)
    })
  })
  .add({
    height: (_: { height: Scalar }) => ({
      height: scalarToCSSValue(_.height)
    })
  })
  .add({
    minWidth: (_: { minWidth: Scalar }) => ({
      minWidth: scalarToCSSValue(_.minWidth)
    })
  })
  .add({
    minHeight: (_: { minHeight: Scalar }) => ({
      minHeight: scalarToCSSValue(_.minHeight)
    })
  })
  .add({
    maxWidth: (_: { maxWidth: Scalar }) => ({
      maxWidth: scalarToCSSValue(_.maxWidth)
    })
  })
  .add({
    maxHeight: (_: { maxHeight: Scalar }) => ({
      maxHeight: scalarToCSSValue(_.maxHeight)
    })
  })
  .add({
    background: (_: { background: string }) => ({
      background: _.background
    })
  })
  .add({
    text: (_: { text: TextProps }) => textRules.exec(_.text)
  })
  .add({
    transform: (_: {
      transform: Array<CSS.CSSTransformComponent> | { [id: string]: Scalar }
    }) => {
      const { transform } = _
      return {
        transform:
          transform instanceof Array
            ? new CSS.CSSTransformValue(...transform)
            : Object.keys(transform)
                .map(
                  (k) =>
                    typeof transform[k] === 'string'
                      ? `${k}(${(transform[k] as string)
                          .split(',')
                          .map((word) =>
                            scalarToCSSValue(word.trim(), 'number')
                          )
                          .join(' ')})`
                      : `${k}(${scalarToCSSValue(transform[k], 'number')})`
                )
                .join(' ')
      }
    }
  })
  .add({
    move: (_: {
      move: { x: CSS.CSSNumberish; y: CSS.CSSNumberish; z?: CSS.CSSNumberish }
    }) => ({
      transform: new CSS.CSSTransformValue(
        new CSS.CSSTranslate(_.move.x, _.move.y, _.move.z)
      )
    })
  })
  .add({
    scale: (_: {
      scale:
        | Scalar
        | { x: CSS.CSSNumberish; y: CSS.CSSNumberish; z?: CSS.CSSNumberish }
    }) => {
      const { scale } = _
      if (typeof scale === 'object' && ('x' in scale || 'y' in scale)) {
        return {
          transform: new CSS.CSSTransformValue(
            new CSS.CSSScale(scale.x, scale.y, scale.z)
          )
        }
      }
      const value = scalarToCSSValue(scale)
      return {
        transform: new CSS.CSSTransformValue(new CSS.CSSScale(value, value))
      }
    }
  })
  .add({
    shadow: (_: { shadow: string }) => ({
      boxShadow: _.shadow.split(' ').map((w) => scalarToCSSValue(w)).join(' ')
    })
  })
  .add({
    elevation: (_: { elevation: Scalar }) => {
      const elevation = scalarToCSSValue(_.elevation)
      const inset = elevation instanceof CSS.CSSUnitValue && elevation.value < 0
      const Y = inset ? elevation.mul(-1) : elevation
      const spread = Y.mul(2)
      return {
        boxShadow: `${inset
          ? 'inset'
          : ''} 0 ${Y.toString()} ${spread.toString()} 0 rgba(0,0,0,0.3)`
      }
    }
  })
  .add({
    opacity: (_: { opacity: Scalar }) => ({
      opacity: scalarToCSSValue(_.opacity, 'number')
    })
  })
  .add({
    zIndex: (_: { zIndex: Scalar }) => ({
      zIndex: scalarToCSSValue(_.zIndex, 'number')
    })
  })
  .add({
    interactive: (_: { interactive: boolean }) =>
      _.interactive ? { cursor: 'pointer' } : { 'pointer-events': 'none' }
  })
  .add({
    scroll: (_: { scroll: boolean | 'auto' }) =>
      _.scroll === false
        ? { overflow: 'visible' as 'visible' }
        : _.scroll === true
          ? { overflow: 'scroll' as 'scroll' }
          : { overflow: 'auto' as 'auto' }
  })
  .add({
    scrollX: (_: { scrollX: boolean | 'auto' }) =>
      _.scrollX === false
        ? { overflowX: 'visible' as 'visible' }
        : _.scrollX === true
          ? { overflowX: 'scroll' as 'scroll' }
          : { overflowX: 'auto' as 'auto' }
  })
  .add({
    scrollY: (_: { scrollY: boolean | 'auto' }) =>
      _.scrollY === false
        ? { overflowY: 'visible' as 'visible' }
        : _.scrollY === true
          ? { overflowY: 'scroll' as 'scroll' }
          : { overflowY: 'auto' as 'auto' }
  })
  .add({
    clip: (_: { clip: boolean }) =>
      _.clip
        ? { overflow: 'hidden' as 'hidden' }
        : { overflow: 'visible' as 'visible' }
  })
  .add({
    clipX: (_: { clipX: boolean }) =>
      _.clipX
        ? { overflowX: 'hidden' as 'hidden' }
        : { overflowX: 'visible' as 'visible' }
  })
  .add({
    clipY: (_: { clipY: boolean }) =>
      _.clipY
        ? { overflowY: 'hidden' as 'hidden' }
        : { overflowY: 'visible' as 'visible' }
  })
  .add({
    transition: (_: {
      transition:
        | number
        | CSS.CSSUnitValue
        | Partial<{ [id: string]: number | CSS.CSSUnitValue }>
    }) => {
      const { transition } = _
      if (typeof transition === 'number') {
        return { transition: `all ${transition}ms` }
      }
      if (transition instanceof CSS.CSSUnitValue) {
        return { transition: `all ${transition}` }
      }
      return {
        transition: Object.keys(transition)
          .map((prop) =>
            (Panel2StyleAffection[prop]
              ? Panel2StyleAffection[prop]
              : [ prop ]).map(
              typeof transition === 'number'
                ? (affectedProp) => `${affectedProp} ${transition[prop]}ms`
                : (affectedProp) => `${affectedProp} ${transition[prop]}`
            )
          )
          .filter((l) => l != null)
          .reduce((r, i) => r.concat(i), [])
          .join()
      }
    }
  })

const Panel2StyleAffection = {
  relative: [ 'top', 'left', 'right', 'bottom' ],
  absolute: [ 'top', 'left', 'right', 'bottom' ],
  fixed: [ 'top', 'left', 'right', 'bottom' ],
  round: [ 'border-radius' ],
  border: [ 'border' ],
  outline: [ 'outline' ],
  margin: [ 'margin' ],
  padding: [ 'padding' ],
  size: [ 'width', 'height' ],
  width: [ 'width' ],
  height: [ 'height' ],
  minWidth: [ 'min-width' ],
  minHeight: [ 'min-height' ],
  maxWidth: [ 'max-width' ],
  maxHeight: [ 'max-height' ],
  background: [ 'background' ],
  transform: [ 'transform' ],
  shadow: [ 'box-shadow' ],
  elevation: [ 'box-shadown' ],
  opacity: [ 'opacity' ]
}

export type StaticPanelProps = Partial<typeof panelRules.typeSample>

function borderFromScalar(subject: Scalar): string {
  if (typeof subject === 'boolean') {
    return subject ? '1px solid black' : ''
  }
  if (typeof subject === 'number') {
    return `${new CSS.CSSUnitValue(subject, 'px')} solid black`
  }
  if (typeof subject === 'string') {
    const words = subject.split(' ')
    if (words.length === 0) {
      return '1px solid black'
    }
    if (words.length === 1) {
      try {
        return `${scalarToCSSValue(words[0])} solid black`
      } catch (e) {
        return `1px solid ${words[0]}`
      }
    }
    if (words.length === 2) {
      return `${scalarToCSSValue(words[0])} solid ${words[1]}`
    }
    return `${scalarToCSSValue(words[0])} ${words[1]} ${words[2]}`
  }
  return ''
}
