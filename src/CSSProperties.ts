import { CSSProperties as ReactCSSProperties } from 'react'
import { CSS } from './CSS'

export type CSSPropertiesNames = keyof ReactCSSProperties

export type CSSProperties = {
  [id in CSSPropertiesNames]: ReactCSSProperties[id] | CSS.CSSStyleValue
}
