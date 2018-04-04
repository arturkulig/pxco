import * as React from 'react'
import CSS from './CSS'
import { CSSProperties, CSSPropertiesNames } from './CSSProperties'
import { lccToSnake } from './CSSPropertyCasing'

export class StyleSinkContext extends React.Component<{ sink: StyleSink }> {
  static childContextTypes = {
    styleSink: () => null
  }

  getChildContext() {
    return { styleSink: this.props.sink }
  }

  componentWillUnmount() {
    this.props.sink.reset()
  }

  render() {
    return this.props.children
  }
}

export class StyleSink {
  constructor(private styleSheet: IStyleSheet, private maxNonOptimized = 10) {
    this.reset()
  }

  reset() {
    this.propertiesByClass = {}
    this.classesPerProperty = {}
    this.classesCombination = {
      name: null,
      occurences: 0,
      next: {}
    }
  }

  private propertiesByClass: { [id: string]: string[] }

  public get cssRules() {
    return Object.keys(
      (aClass) => `.${aClass} { ${this.propertiesByClass[aClass].join(';\n')}`
    )
  }

  private classesPerProperty: {
    [id in CSSPropertiesNames]?: {
      [id: string]: { name: string; occurences: number }
    }
  }

  public getDesc(styles: CSSProperties) {
    const { classNames, style } = (Object.keys(styles) as CSSPropertiesNames[])
      .map((prop) => this.getSingleRuleDesc(prop, styles[prop]))
      .reduce<{ classNames: string[]; style: CSSProperties }>(
        (r, i) => ({
          classNames:
            typeof i === 'string' ? r.classNames.concat(i) : r.classNames,
          style: typeof i === 'object' ? { ...r.style, ...i } : r.style
        }),
        { classNames: [], style: {} }
      )
    return { className: this.compressClasses(classNames), style }
  }

  private getSingleRuleDesc(
    rule: CSSPropertiesNames,
    value: string | number | CSS.CSSStyleValue
  ): string | CSSProperties {
    const classesPerValue =
      this.classesPerProperty[rule] || (this.classesPerProperty[rule] = {})
    const classEntry =
      classesPerValue[value.toString()] ||
      (classesPerValue[value.toString()] = {
        name: null,
        occurences: 0
      })
    if (
      typeof window === 'undefined' ||
      classEntry.occurences++ < this.maxNonOptimized
    ) {
      return { [rule]: value }
    }
    if (!classEntry.name) {
      classEntry.name = this.insertRule(`${lccToSnake[rule]}: ${value}`)
    }
    return classEntry.name
  }

  classesCombination: ClassesCombination

  compressClasses(classes: string[]): string {
    if (classes.length === 0) {
      return ''
    }
    const sortedClasses = [ ...classes ].sort()
    let classesCombination = this.classesCombination
    for (const aClass of sortedClasses) {
      if (classesCombination.next[aClass]) {
        classesCombination = classesCombination.next[aClass]
      } else {
        classesCombination = null
        break
      }
    }
    if (!classesCombination) {
      classesCombination = this.classesCombination
      for (const aClass of sortedClasses) {
        classesCombination.next[aClass] = classesCombination.next[aClass] || {
          name: null,
          occurences: 0,
          next: {}
        }
        classesCombination = classesCombination.next[aClass]
      }
    }
    classesCombination.occurences++
    if (classesCombination.occurences < this.maxNonOptimized) {
      return sortedClasses.join(' ')
    }
    return (
      classesCombination.name ||
      (classesCombination.name = this.insertRule(
        sortedClasses
          .map((aClass) => this.propertiesByClass[aClass])
          .reduce((r, i) => r.concat(i), [])
      ))
    )
  }

  insertRule(properties: string | string[]) {
    const name = `💅${hash(
      properties instanceof Array ? properties.join(' ') : properties
    )}`
    this.propertiesByClass[name] =
      properties instanceof Array ? properties : [ properties ]
    this.styleSheet.insertRule(
      `.${name} { ${this.propertiesByClass[name].join(';\n')} }`,
      this.styleSheet.cssRules.length
    )
    return name
  }
}

function hash(subject: string) {
  let hash = 5381
  let i = subject.length
  while (i) {
    hash = (hash * 33) ^ subject.charCodeAt(--i)
  }
  return hash >>> 0
}

interface ClassesCombination {
  name: string
  occurences: number
  next: { [id: string]: ClassesCombination }
}

interface IStyleSheet {
  cssRules: { length: number }
  insertRule(rule: string, index?: number)
}

export class SyntheticStyleSheet implements IStyleSheet {
  cssRules = []
  insertRule(rule: string, index?: number) {
    if (typeof index === 'number') {
      this.cssRules.splice(index, 0, rule)
    } else {
      this.cssRules.push(rule)
    }
  }
}
