import CSS from './CSS'

export const Empty = {}

export type Scalar = string | boolean | CSS.CSSNumberish

export function scalarToCSSValue(
  subject: Scalar,
  unit: CSS.Unit = 'px'
): CSS.CSSNumericValue {
  if (typeof subject === 'boolean') {
    return new CSS.CSSUnitValue(subject ? 1 : 0, unit)
  }
  if (typeof subject === 'number') {
    return new CSS.CSSUnitValue(subject, unit)
  }
  if (typeof subject === 'string') {
    const result = CSS.CSSNumericValue.parse(subject)
    if (result instanceof CSS.CSSUnitValue && result.unit === 'number') {
      return result.to(unit)
    }
    return result
  }
  return subject
}

export type AlignItems = 'stretch' | 'center' | 'start' | 'end' | 'initial'

export const alignItemsShort: {
  [id in AlignItems]: CSS.CSSProperties['alignItems']
} = {
  stretch: 'stretch',
  center: 'center',
  start: 'flex-start',
  end: 'flex-end',
  initial: 'initial'
}

export type AlignContent =
  | 'stretch'
  | 'center'
  | 'start'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'initial'

export const alignContentShort: {
  [id in AlignContent]: CSS.CSSProperties['alignContent']
} = {
  stretch: 'stretch',
  center: 'center',
  start: 'flex-start',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  initial: 'initial'
}

export type JustifyContent =
  | 'start'
  | 'end'
  | 'center'
  | 'between'
  | 'around'
  | 'evenly'
  | 'stretch'

export const justifyContentShort: {
  [id in JustifyContent]: CSS.CSSProperties['justifyContent']
} = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
  stretch: 'stretch'
}

export type AlignSelf =
  | 'auto'
  | 'start'
  | 'end'
  | 'center'
  | 'baseline'
  | 'stretch'

export const alignSelfShort: {
  [id in AlignSelf]: CSS.CSSProperties['alignSelf']
} = {
  auto: 'auto',
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  baseline: 'baseline',
  stretch: 'stretch'
}

export const flexAlignToTextAlign: {
  [id in AlignContent]?: CSS.CSSProperties['textAlign']
} = {
  center: 'center',
  start: 'left',
  end: 'right',
  initial: 'initial'
}

export const textAlignToFlexAlign = {
  center: 'center' as CSS.CSSProperties['justifyContent'],
  left: 'flex-start' as CSS.CSSProperties['justifyContent'],
  right: 'flex-end' as CSS.CSSProperties['justifyContent']
}

export interface Directions<T> {
  t?: T
  b?: T
  l?: T
  r?: T
}

export interface Diagonals<T> extends Directions<T> {
  tl?: T
  tr?: T
  bl?: T
  br?: T
  lt?: T
  rt?: T
  lb?: T
  rb?: T
}

export function getDiagonalRules<T, U = T, R = string | CSS.CSSStyleValue>(
  names: { tl: string; tr: string; bl: string; br: string },
  subject: T | Diagonals<U>,
  processor: (v: T | U) => R
) {
  if (subject == null) {
    return Empty
  }
  return isDiagonal(subject)
    ? {
        ...subject.t != null
          ? {
              [names.tl]: processor(subject.t),
              [names.tr]: processor(subject.t)
            }
          : Empty,
        ...subject.b != null
          ? {
              [names.bl]: processor(subject.b),
              [names.br]: processor(subject.b)
            }
          : Empty,
        ...subject.l != null
          ? {
              [names.tl]: processor(subject.l),
              [names.bl]: processor(subject.l)
            }
          : Empty,
        ...subject.r != null
          ? {
              [names.tr]: processor(subject.r),
              [names.br]: processor(subject.r)
            }
          : Empty,

        ...subject.tr != null ? { [names.tr]: processor(subject.tr) } : Empty,
        ...subject.rt != null ? { [names.tr]: processor(subject.rt) } : Empty,

        ...subject.tl != null ? { [names.tl]: processor(subject.tl) } : Empty,
        ...subject.lt != null ? { [names.tl]: processor(subject.lt) } : Empty,

        ...subject.br != null ? { [names.br]: processor(subject.br) } : Empty,
        ...subject.rb != null ? { [names.br]: processor(subject.rb) } : Empty,

        ...subject.bl != null ? { [names.bl]: processor(subject.bl) } : Empty,
        ...subject.lb != null ? { [names.bl]: processor(subject.lb) } : Empty
      }
    : {
        [names.tr]: processor(subject),
        [names.tl]: processor(subject),
        [names.br]: processor(subject),
        [names.bl]: processor(subject)
      }
}

export function isDiagonal<T>(subject: Diagonals<T>): subject is Diagonals<T> {
  return !!(
    typeof subject === 'object' &&
    (isDirectional(subject) ||
      'tl' in (subject as object) ||
      'bl' in (subject as object) ||
      'tr' in (subject as object) ||
      'br' in (subject as object) ||
      'lt' in (subject as object) ||
      'lb' in (subject as object) ||
      'rt' in (subject as object) ||
      'rb' in (subject as object) ||
      Object.keys(subject).length === 0)
  )
}

export function getDirectionalRules<T, U = T, R = string | CSS.CSSStyleValue>(
  names: Directions<string>,
  subject: T | Directions<U>,
  processor: (v: T | U) => R
) {
  const processed = processDirectional(
    normalizeToDirectional(subject),
    processor
  )

  const result: CSS.CSSProperties = {}
  if (processed.t != null) {
    result[names.t] = processed.t
  }
  if (processed.b != null) {
    result[names.b] = processed.b
  }
  if (processed.l != null) {
    result[names.l] = processed.l
  }
  if (processed.r != null) {
    result[names.r] = processed.r
  }
  return result
}

export function processDirectional<T, U>(
  subject: Directions<T>,
  processor: (item: T) => U
): Directions<U> {
  const result: Directions<U> = {}
  if (subject.t != null) {
    result.t = processor(subject.t)
  }
  if (subject.b != null) {
    result.b = processor(subject.b)
  }
  if (subject.l != null) {
    result.l = processor(subject.l)
  }
  if (subject.r != null) {
    result.r = processor(subject.r)
  }
  return result
}

export function normalizeToDirectional<T>(subject: T | Directions<T>) {
  if (isDirectional<T>(subject)) {
    return subject
  }
  return { t: subject, b: subject, l: subject, r: subject }
}

export function isDirectional<T>(
  subject: Directions<T>
): subject is Directions<T> {
  return !!(
    typeof subject === 'object' &&
    ('t' in (subject as object) ||
      'b' in (subject as object) ||
      'l' in (subject as object) ||
      'r' in (subject as object) ||
      Object.keys(subject).length === 0)
  )
}
