import {
  CSSProperties as CSSProperties_,
  CSSPropertiesNames
} from './CSSProperties'
import { tokenizeScope } from './CSStokenize'
import { lccToSnake } from './CSSPropertyCasing'

namespace CSSTyped {
  export const supports =
    typeof CSS === 'undefined' ? () => false : CSS.supports

  export type CSSProperties = CSSProperties_

  export class CSSStyleValue {
    static parseAll(property: CSSPropertiesNames, cssText: string) {
      // TODO actual parsing to avoid spliting on non-top-level commas
      return cssText.split(',').map((l) => CSSStyleValue.parse(property, l))
    }

    static parse(property: CSSPropertiesNames, cssText: string) {
      const sv = CSSStyleValue.parseText(cssText)
      sv.associatedProperty = lccToSnake[property] || property
      return sv
    }

    static parseText(cssText: string) {
      return new CSSStyleValue(cssText)
    }

    constructor(protected readonly cssText: string) {
      this.cssText = cssText
    }

    associatedProperty: CSSPropertiesNames

    toString() {
      return this.cssText
    }
  }

  export class CSSKeywordValue<T extends string> extends CSSStyleValue {
    constructor(value: T) {
      super(value)
      this.keywordValue = value
    }

    private keywordValue: T
    get value() {
      return this.keywordValue
    }
  }

  export abstract class CSSTransformComponent {
    is2D: boolean = true
    abstract toString(): string
  }

  export class CSSTranslate extends CSSTransformComponent {
    readonly x: CSSNumericValue
    readonly y: CSSNumericValue
    readonly z: CSSNumericValue

    constructor(x: CSSNumberish, y: CSSNumberish, z?: CSSNumberish) {
      super()
      this.x = numberishToNumeric(x)
      this.y = numberishToNumeric(y)
      if (z == null) {
        this.z = new CSSUnitValue(0, 'px')
      } else {
        this.z = numberishToNumeric(z)
        this.is2D = false
      }
    }

    toString() {
      return this.is2D
        ? `translate(${this.x.toString()}, ${this.y.toString()})`
        : `translate3d(${this.x.toString()}, ${this.y.toString()}, ${this.z.toString()})`
    }
  }

  export class CSSRotate extends CSSTransformComponent {
    readonly x: CSSNumericValue
    readonly y: CSSNumericValue
    readonly z: CSSNumericValue
    readonly angle: CSSNumericValue

    constructor(angle: CSSNumericValue)
    constructor(
      x: CSSNumberish,
      y: CSSNumberish,
      z: CSSNumberish,
      angle: CSSNumericValue
    )
    constructor(...values) {
      super()
      switch (values.length) {
        case 4: {
          this.x = numberishToNumeric(values[0])
          this.y = numberishToNumeric(values[1])
          this.z = numberishToNumeric(values[2])
          this.angle = values[4]
          this.is2D = false
          break
        }
        case 1: {
          this.x = new CSSUnitValue(0, 'px')
          this.y = new CSSUnitValue(0, 'px')
          this.z = new CSSUnitValue(1, 'px')
          this.angle = values[4]
          break
        }
        default: {
          throw new Error()
        }
      }
    }

    toString() {
      return `rotate${this.is2D ? '' : '3d'}(${(this.is2D
        ? [ this.x, this.y, this.z, this.angle ]
        : [ this.angle ])
        .map(toString)
        .join(', ')})`
    }
  }

  export class CSSScale extends CSSTransformComponent {
    x: CSSNumericValue
    y: CSSNumericValue
    z: CSSNumericValue

    constructor(x: CSSNumberish, y: CSSNumberish, z?: CSSNumberish) {
      super()
      this.x = numberishToNumeric(x)
      this.y = numberishToNumeric(y)
      if (z == null) {
        this.z = new CSSUnitValue(1, 'number')
      } else {
        this.z = numberishToNumeric(z)
        this.is2D = false
      }
    }

    toString() {
      return `scale${this.is2D ? '' : '3d'}(${this.is2D
        ? [ this.x, this.y, this.z ].map(toString).join(', ')
        : [ this.x, this.y ].map(toString).join(', ')})`
    }
  }

  export class CSSSkew extends CSSTransformComponent {
    ax: CSSNumericValue
    ay: CSSNumericValue

    constructor(ax: CSSNumericValue, ay: CSSNumericValue) {
      super()
      this.ax = ax
      this.ay = ay
    }

    toString() {
      const { ax, ay } = this
      return `skew(${(ay instanceof CSSUnitValue && ay.value === 0
        ? [ ax ]
        : [ ax, ay ])
        .map(toString)
        .join(', ')})`
    }
  }

  export class CSSSkewX extends CSSTransformComponent {
    constructor(public ax: CSSNumericValue) {
      super()
    }

    toString() {
      return `skewX(${this.ax.toString()})`
    }
  }

  export class CSSSkewY extends CSSTransformComponent {
    constructor(public ay: CSSNumericValue) {
      super()
    }

    toString() {
      return `skewY(${this.ay.toString()})`
    }
  }

  export class CSSPerspective extends CSSTransformComponent {
    constructor(public length: CSSNumericValue) {
      super()
      this.is2D = false
    }

    toString() {
      return `perspective(${this.length.toString()})`
    }
  }

  // TODO DOMMatrix type missing
  export class CSSMatrixComponent extends CSSTransformComponent {
    constructor(public matrix: { is2D: boolean; toString: () => string }) {
      super()
      this.is2D = matrix.is2D
    }

    toString() {
      return this.matrix.toString()
    }
  }

  export class CSSTransformValue extends CSSStyleValue {
    readonly is2D: boolean
    readonly length: number
    readonly transforms: CSSTransformComponent[]
    constructor(...transforms: CSSTransformComponent[]) {
      super(transforms.map(toString).join(' '))
      this.is2D = this.transforms.reduce<boolean>((r, i) => r && i.is2D, true)
      this.length = this.transforms.length
      this.transforms = transforms
      if (transforms.length === 0) {
        throw new Error()
      }
    }
  }

  export class CSSPositionValue extends CSSStyleValue {
    readonly x: CSSNumericValue
    readonly y: CSSNumericValue
    constructor(x: CSSNumericValue, y: CSSNumericValue) {
      super(`${x.toString()} ${y.toString()}`)
      this.x = x
      this.y = y
    }
  }

  export type CSSNumberish = number | CSSNumericValue
  function numberishToNumeric(v: CSSNumberish): CSSNumericValue {
    if (typeof v === 'number') {
      return new CSSUnitValue(v, 'number')
    }
    return v
  }

  export enum CSSNumericBaseType {
    'length',
    'angle',
    'time',
    'frequency',
    'resolution',
    'flex',
    'percent'
  }

  export interface CSSNumericType {
    length?: number
    angle?: number
    time?: number
    frequency?: number
    resolution?: number
    flex?: number
    percent?: number
    percentHint?: CSSNumericBaseType
  }

  const numberWithUnit = /([0-9\.]+)([a-z]+|%)/
  const numberWOUnit = /([0-9\.]+)/
  export abstract class CSSNumericValue extends CSSStyleValue {
    static parse(value: string): CSSNumericValue {
      const nWU = numberWithUnit.exec(value)
      if (nWU) {
        return new CSSUnitValue(parseFloat(nWU[1]), nWU[2] as Unit)
      }
      const nWO = numberWOUnit.exec(value)
      if (nWO) {
        return new CSSUnitValue(parseFloat(nWO[1]), 'number')
      }
      throw new TypeError('CSSNumericValue.parse cannot parse ' + value)
    }

    type(): CSSNumericType {
      return {}
    }

    to(unit: Unit): CSSNumericValue {
      return new CSSUnitValue(0, unit)
    }

    toString(nested?: boolean) {
      return nested ? this.cssText : `calc( ${this.cssText} )`
    }

    add(...values: CSSNumberish[]): CSSNumericValue {
      if (values.length === 0) {
        return this
      }
      let result = [] as CSSNumericValue[]
      for (const v of values) {
        if (v instanceof CSSMathMin) {
          for (const sumItem of v.values) {
            result.push(sumItem)
          }
        } else {
          result.push(numberishToNumeric(v))
        }
      }
      return new CSSMathSum(result)
    }

    sub(...values: CSSNumberish[]): CSSNumericValue {
      if (values.length === 0) {
        return this
      }
      return this.add(
        ...values.map((v) => {
          const positive = numberishToNumeric(v)
          if (positive instanceof CSSMathNegate) {
            return positive.value
          }
          if (positive instanceof CSSUnitValue) {
            return new CSSUnitValue(-positive.value, positive.unit)
          }
          return new CSSMathNegate(positive)
        })
      )
    }

    mul(...values: CSSNumberish[]): CSSNumericValue {
      if (values.length === 0) {
        return this
      }
      let result = [] as CSSNumericValue[]
      for (const v of values) {
        if (v instanceof CSSMathMin) {
          for (const sumItem of v.values) {
            result.push(sumItem)
          }
        } else {
          result.push(numberishToNumeric(v))
        }
      }
      return new CSSMathProduct(result)
    }

    div(...values: CSSNumberish[]): CSSNumericValue {
      if (values.length === 0) {
        return this
      }
      return this.mul(
        ...values.map((v) => {
          const positive = numberishToNumeric(v)
          if (positive instanceof CSSMathInvert) {
            return positive.value
          }
          if (positive instanceof CSSUnitValue) {
            return new CSSUnitValue(-positive.value, positive.unit)
          }
          return new CSSMathInvert(positive)
        })
      )
    }

    min(...values: CSSNumberish[]): CSSNumericValue {
      if (values.length === 0) {
        return this
      }
      let result = [] as CSSNumericValue[]
      for (const v of values) {
        if (v instanceof CSSMathMin) {
          for (const sumItem of v.values) {
            result.push(sumItem)
          }
        } else {
          result.push(numberishToNumeric(v))
        }
      }
      return new CSSMathMin(result)
    }

    max(...values: CSSNumberish[]): CSSNumericValue {
      if (values.length === 0) {
        return this
      }
      let result = [] as CSSNumericValue[]
      for (const v of values) {
        if (v instanceof CSSMathMin) {
          for (const sumItem of v.values) {
            result.push(sumItem)
          }
        } else {
          result.push(numberishToNumeric(v))
        }
      }
      return new CSSMathMax(result)
    }

    // abstract equals(...value: CSSNumberish[]): boolean
    // equals(...value: CSSNumberish[]): boolean {
    //   if (value.length===0) {return true}
    //   const [aValue, ...values] = value
    //   const aCSSValue = CSSNumberish2CSSNumericValue(aValue)
    //   throw new Error('override')
    // }
  }

  export abstract class CSSMathValue extends CSSNumericValue {}

  export class CSSMathOfManyValues extends CSSMathValue {
    constructor(public readonly values: CSSNumericValue[], cssText: string) {
      super(cssText)
    }

    to(unit: Unit) {
      if (this.values.length === 0) {
        return new CSSUnitValue(0, unit)
      }
      if (this.values.length === 1) {
        return this.values[0].to(unit)
      }
      throw new TypeError('Cannot cast to a unit')
    }
  }

  export class CSSMathSum extends CSSMathOfManyValues {
    constructor(public readonly values: CSSNumericValue[]) {
      super(
        values,
        values
          .map(
            (l, i) =>
              i === 0
                ? l.toString(true)
                : l instanceof CSSMathNegate
                  ? ' - ' + l.value.toString(true)
                  : ' + ' + l.toString(true)
          )
          .join('')
      )
    }
  }

  export class CSSMathProduct extends CSSMathOfManyValues {
    constructor(public readonly values: CSSNumericValue[]) {
      super(
        values,
        values
          .map(
            (l, i) =>
              i === 0
                ? l.toString(true)
                : l instanceof CSSMathInvert
                  ? ' / ' + l.value.toString(true)
                  : ' * ' + l.toString(true)
          )
          .join('')
      )
    }
  }

  export class CSSMathMin extends CSSMathOfManyValues {
    constructor(public readonly values: CSSNumericValue[]) {
      super(values, `min( ${values.map((l) => l.toString(true)).join(', ')} )`)
    }
  }

  export class CSSMathMax extends CSSMathOfManyValues {
    constructor(public readonly values: CSSNumericValue[]) {
      super(values, `max( ${values.map((l) => l.toString(true)).join(', ')} )`)
    }
  }

  export class CSSMathNegate extends CSSMathValue {
    constructor(public readonly value: CSSNumericValue) {
      super(`-${value.toString()}`)
    }

    to(unit: Unit) {
      return new CSSMathNegate(this.value.to(unit))
    }

    toString() {
      return this.cssText
    }
  }

  export class CSSMathInvert extends CSSMathValue {
    constructor(public readonly value: CSSNumericValue) {
      super(`1 / ${value.toString(true)}`)
    }

    to(unit: Unit) {
      return new CSSMathInvert(this.value.to(unit))
    }
  }

  export type Unit =
    | 'number'
    | 'percent'
    | 'em'
    | 'ex'
    | 'ch'
    | 'rem'
    | 'vw'
    | 'vh'
    | 'vmin'
    | 'vmax'
    | 'cm'
    | 'mm'
    | 'Q'
    | 'in'
    | 'pc'
    | 'pt'
    | 'px'
    | 'turn'
    | 'rad'
    | 'grad'
    | 'deg'
    | 's'
    | 'ms'
    | 'hz'
    | 'khz'
    | 'dppx'
    | 'x'
    | 'dpcm'
    | 'dpi'
    | 'fr'
  export class CSSUnitValue extends CSSNumericValue {
    constructor(public readonly value: number, public readonly unit: Unit) {
      super(
        value === 0
          ? '0'
          : `${value}${unit === 'number'
              ? ''
              : unit === 'percent' ? '%' : unit === 'fr' ? '' : unit}`
      )
    }

    toString() {
      return this.cssText
    }

    type(): CSSNumericType {
      switch (this.unit) {
        case 'number':
          return {}
        case 'percent':
          return { percent: 1 }
        case 'em':
        case 'ex':
        case 'ch':
        case 'rem':
        case 'vw':
        case 'vh':
        case 'vmin':
        case 'vmax':
        case 'cm':
        case 'mm':
        case 'Q':
        case 'in':
        case 'pc':
        case 'pt':
        case 'px':
          return { length: 1 }
        case 'turn':
        case 'rad':
        case 'grad':
        case 'deg':
          return { angle: 1 }
        case 's':
        case 'ms':
          return { time: 1 }
        case 'hz':
        case 'khz':
          return { frequency: 1 }
        case 'dppx':
        case 'x':
        case 'dpcm':
        case 'dpi':
          return { resolution: 1 }
        case 'fr':
          return { flex: 1 }
      }
      throw new TypeError(`Unrecognized type`)
    }

    to(unit: Unit) {
      switch (this.unit) {
        case 'number':
          return new CSSUnitValue(this.value, unit)
        case 'percent':
          throw new TypeError()

        case 'em':
          throw new TypeError()
        case 'ex':
          throw new TypeError()
        case 'ch':
          throw new TypeError()
        case 'rem':
          throw new TypeError()
        case 'vw':
          throw new TypeError()
        case 'vh':
          throw new TypeError()
        case 'vmin':
          throw new TypeError()
        case 'vmax':
          throw new TypeError()
        case 'cm':
          switch (unit) {
            case 'in':
              return new CSSUnitValue(this.value / 2.54, unit)
            case 'mm':
              return new CSSUnitValue(this.value * 10, unit)
          }
          throw new TypeError()
        case 'mm':
          switch (unit) {
            case 'in':
              return new CSSUnitValue(this.value / 0.254, unit)
            case 'cm':
              return new CSSUnitValue(this.value / 10, unit)
          }
          throw new TypeError()
        case 'Q':
          throw new TypeError()
        case 'in':
          switch (unit) {
            case 'cm':
              return new CSSUnitValue(this.value * 2.54, unit)
            case 'mm':
              return new CSSUnitValue(this.value * 25.4, unit)
          }
          throw new TypeError()
        case 'pc':
          throw new TypeError()
        case 'pt':
          throw new TypeError()
        case 'px':
          throw new TypeError()

        // TODO
        case 'turn':
          throw new TypeError()
        case 'rad':
          throw new TypeError()
        case 'grad':
          throw new TypeError()
        case 'deg':
          throw new TypeError()

        case 's':
          switch (unit) {
            case 'ms':
              return new CSSUnitValue(this.value * 1000, unit)
          }
          throw new TypeError()
        case 'ms':
          switch (unit) {
            case 'ms':
              return new CSSUnitValue(this.value / 1000, unit)
          }
          throw new TypeError()

        case 'hz':
          switch (unit) {
            case 'khz':
              return new CSSUnitValue(this.value / 1000, unit)
          }
          throw new TypeError()
        case 'khz':
          switch (unit) {
            case 'hz':
              return new CSSUnitValue(this.value * 1000, unit)
          }
          throw new TypeError()

        case 'dppx':
          throw new TypeError()
        case 'x':
          throw new TypeError()
        case 'dpcm':
          throw new TypeError()
        case 'dpi':
          throw new TypeError()

        case 'fr':
          throw new TypeError()
      }
    }

    private static areAllNonUnit(
      values: CSSNumberish[]
    ): values is Array<number | CSSUnitValue> {
      return values.reduce(
        (r, i) =>
          r &&
          (typeof i === 'number' ||
            (i instanceof CSSUnitValue && i.unit === 'number')),
        true
      )
    }

    private static numberUnitToNumber(
      values: Array<number | CSSUnitValue>
    ): number[] {
      return values.map((v) => (typeof v === 'number' ? v : v.value))
    }

    add(...values: CSSNumberish[]): CSSNumericValue {
      if (values.length === 0) {
        return this
      }
      if (CSSUnitValue.areAllNonUnit(values)) {
        return new CSSUnitValue(
          CSSUnitValue.numberUnitToNumber(values).reduce(
            (r, i) => r + i,
            this.value
          ),
          this.unit
        )
      }
      return CSSNumericValue.prototype.add.apply(this, values)
    }

    sub(...values: CSSNumberish[]): CSSNumericValue {
      if (values.length === 0) {
        return this
      }
      if (CSSUnitValue.areAllNonUnit(values)) {
        return new CSSUnitValue(
          CSSUnitValue.numberUnitToNumber(values).reduce(
            (r, i) => r - i,
            this.value
          ),
          this.unit
        )
      }
      return CSSNumericValue.prototype.sub.apply(this, values)
    }

    mul(...values: CSSNumberish[]): CSSNumericValue {
      if (values.length === 0) {
        return this
      }
      if (CSSUnitValue.areAllNonUnit(values)) {
        return new CSSUnitValue(
          CSSUnitValue.numberUnitToNumber(values).reduce(
            (r, i) => r * i,
            this.value
          ),
          this.unit
        )
      }
      return CSSNumericValue.prototype.mul.apply(this, values)
    }

    div(...values: CSSNumberish[]): CSSNumericValue {
      if (values.length === 0) {
        return this
      }
      if (CSSUnitValue.areAllNonUnit(values)) {
        return new CSSUnitValue(
          CSSUnitValue.numberUnitToNumber(values).reduce(
            (r, i) => r / i,
            this.value
          ),
          this.unit
        )
      }
      return CSSNumericValue.prototype.div.apply(this, values)
    }
  }

  export function number(value: number) {
    return new CSSUnitValue(value, 'number')
  }
  export function percent(value: number) {
    return new CSSUnitValue(value, 'percent')
  }
  export function em(value: number) {
    return new CSSUnitValue(value, 'em')
  }
  export function ex(value: number) {
    return new CSSUnitValue(value, 'ex')
  }
  export function ch(value: number) {
    return new CSSUnitValue(value, 'ch')
  }
  export function rem(value: number) {
    return new CSSUnitValue(value, 'rem')
  }
  export function vw(value: number) {
    return new CSSUnitValue(value, 'vw')
  }
  export function vh(value: number) {
    return new CSSUnitValue(value, 'vh')
  }
  export function vmin(value: number) {
    return new CSSUnitValue(value, 'vmin')
  }
  export function vmax(value: number) {
    return new CSSUnitValue(value, 'vmax')
  }
  export function cm(value: number) {
    return new CSSUnitValue(value, 'cm')
  }
  export function mm(value: number) {
    return new CSSUnitValue(value, 'mm')
  }
  export function Q(value: number) {
    return new CSSUnitValue(value, 'Q')
  }
  export function ic(value: number) {
    return new CSSUnitValue(value, 'in')
  }
  export function pc(value: number) {
    return new CSSUnitValue(value, 'pc')
  }
  export function pt(value: number) {
    return new CSSUnitValue(value, 'pt')
  }
  export function px(value: number) {
    return new CSSUnitValue(value, 'px')
  }
  export function turn(value: number) {
    return new CSSUnitValue(value, 'turn')
  }
  export function rad(value: number) {
    return new CSSUnitValue(value, 'rad')
  }
  export function grad(value: number) {
    return new CSSUnitValue(value, 'grad')
  }
  export function deg(value: number) {
    return new CSSUnitValue(value, 'deg')
  }
  export function s(value: number) {
    return new CSSUnitValue(value, 's')
  }
  export function ms(value: number) {
    return new CSSUnitValue(value, 'ms')
  }
  export function Hz(value: number) {
    return new CSSUnitValue(value, 'hz')
  }
  export function kHz(value: number) {
    return new CSSUnitValue(value, 'khz')
  }
  export function dppx(value: number) {
    return new CSSUnitValue(value, 'dppx')
  }
  export function x(value: number) {
    return new CSSUnitValue(value, 'x')
  }
  export function dpcm(value: number) {
    return new CSSUnitValue(value, 'dpcm')
  }
  export function dpi(value: number) {
    return new CSSUnitValue(value, 'dpi')
  }
  export function fr(value: number) {
    return new CSSUnitValue(value, 'fr')
  }

  export class CSSURLImageValue extends CSSStyleValue {
    constructor(public readonly url: string) {
      super(`url(${url})`)
    }
  }

  export class CSSVariableReferenceValue extends CSSStyleValue {
    constructor(
      public readonly variable: string,
      public readonly fallback?: CSSUnparsedValue
    ) {
      super(`var(--${variable}${fallback ? `, ${fallback.toString()}` : ''}`)
    }
  }

  export class CSSUnparsedValue extends CSSStyleValue {
    constructor(public readonly members: CSSUnparsedSegment[]) {
      super(
        members
          .map(
            (m) =>
              typeof m === 'string'
                ? m
                : m && m instanceof CSSVariableReferenceValue
                  ? m.toString()
                  : ''
          )
          .join(', ')
      )
    }
  }

  export type CSSUnparsedSegment = string | CSSVariableReferenceValue
}

function toString(t: { toString: () => string }) {
  return t.toString()
}

export { CSSTyped as CSS, CSSTyped as default }
