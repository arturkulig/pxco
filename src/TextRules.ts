import CSS from './CSS'
import { Scalar, scalarToCSSValue, textAlignToFlexAlign } from './StyleTypes'
import { StyleInterpretations } from './StyleInterpretations'

const Nothing = {}

export const textRules = new StyleInterpretations({})
  .add({
    display: (_: { display: CSS.CSSProperties['display'] }) => ({
      display: _.display
    })
  })
  .add({
    flex: (_: { flex: Scalar }) => ({
      display: 'flex' as 'flex',
      flex: scalarToCSSValue(_.flex, 'fr')
    })
  })
  .add({
    serif: (_: { serif: boolean }) => ({
      fontFamily: _.serif
        ? 'var(--serif-font, serif)'
        : 'var(--sans-serif-font, sans-serif)'
    })
  })
  .add({
    mono: (_: { mono: boolean }) => ({
      fontFamily: _.mono
        ? 'var(--monospace-font, monospace)'
        : 'var(--sans-serif-font, sans-serif)'
    })
  })
  .add({
    size: (_: { size: Scalar; lh?: Scalar; lineHeight?: Scalar }) => ({
      fontSize: scalarToCSSValue(_.size),
      lineHeight: scalarToCSSValue(
        _.lh != null
          ? _.lh
          : _.lineHeight != null
            ? _.lineHeight
            : scalarToCSSValue(_.size).mul(1.2),
        'number'
      )
    })
  })
  .add({
    font: (_: { font: string }) => ({ fontFamily: _.font })
  })
  .add({
    color: (_: { color: string }) => ({ color: _.color })
  })
  .add({
    weight: (_: { weight: Scalar }) =>
      _.weight !== false && _.weight != null
        ? { fontWeight: scalarToCSSValue(_.weight, 'number') }
        : { fontWeight: 'normal' }
  })
  .add({
    thin: (_: { thin: boolean }) =>
      _.thin ? { fontWeight: '100' } : { fontWeight: 'normal' }
  })
  .add({
    light: (_: { light: boolean }) =>
      _.light ? { fontWeight: '300' } : { fontWeight: 'normal' }
  })
  .add({
    bold: (_: { bold: boolean }) =>
      _.bold ? { fontWeight: '700' } : { fontWeight: 'normal' }
  })
  .add({
    black: (_: { black: boolean }) =>
      _.black ? { fontWeight: '900' } : { fontWeight: 'normal' }
  })
  .add({
    italic: (_: { italic: boolean }) =>
      _.italic
        ? { fontStyle: 'italic' as 'italic' }
        : { fontStyle: 'normal' as 'normal' }
  })
  .add({
    lh: (_: { lh: Scalar }) => ({
      lineHeight: scalarToCSSValue(_.lh, 'number')
    })
  })
  .add({
    lineHeight: (_: { lineHeight: Scalar }) => ({
      lineHeight: scalarToCSSValue(_.lineHeight, 'number')
    })
  })
  .add({
    ls: (_: { ls: Scalar }) => ({
      letterSpacing: scalarToCSSValue(_.ls, 'px')
    })
  })
  .add({
    spacing: (_: { spacing: Scalar }) => ({
      letterSpacing: scalarToCSSValue(_.spacing, 'px')
    })
  })
  .add({
    letterSpacing: (_: { letterSpacing: Scalar }) => ({
      letterSpacing: scalarToCSSValue(_.letterSpacing, 'px')
    })
  })
  .add({
    align: (_: { align: keyof typeof textAlignToFlexAlign }) => ({
      textAlign: _.align,
      justifyContent: textAlignToFlexAlign[_.align]
    })
  })
  .add({
    center: (_: { center: boolean }) =>
      _.center ? { 'text-align': 'center' } : Nothing
  })
  .add({
    left: (_: { left: boolean }) =>
      _.left ? { 'text-align': 'left' } : Nothing
  })
  .add({
    right: (_: { right: boolean }) =>
      _.right ? { 'text-align': 'right' } : Nothing
  })
  .add({
    width: (_: { width: Scalar }) => ({
      width: scalarToCSSValue(_.width)
    })
  })
  .add({
    minWidth: (_: { minWidth: Scalar }) => ({
      minWidth: scalarToCSSValue(_.minWidth, 'px')
    })
  })
  .add({
    maxWidth: (_: { maxWidth: Scalar }) => ({
      maxWidth: scalarToCSSValue(_.maxWidth, 'px')
    })
  })
  .add({
    transition: (_: { transition: number }) => ({
      transition: Object.keys(_)
        .map(
          (textProp) =>
            Text2StyleAffection[textProp]
              ? Text2StyleAffection[textProp].map(
                  (styleProp) => `${styleProp} ${_.transition}ms`
                )
              : null
        )
        .filter((l) => l != null)
        .reduce((r, i) => r.concat(i), [])
        .join()
    })
  })

const Text2StyleAffection = {
  size: [ 'font-size', 'line-height' ],
  lh: [ 'line-height' ],
  lineHeight: [ 'line-height' ],
  color: [ 'color' ],
  weight: [ 'fontWeight' ],
  bold: [ 'fontWeight' ],
  light: [ 'fontWeight' ],
  ls: [ 'line-spacing' ],
  spacing: [ 'line-spacing' ],
  letterSpacing: [ 'line-spacing' ],
  width: [ 'width' ],
  minWidth: [ 'min-width' ],
  maxWidth: [ 'max-width' ]
}

export type TextProps = Partial<typeof textRules.typeSample>
