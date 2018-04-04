import { CSSProperties } from './CSSProperties'

interface StyleInterpretation<T> {
  (input: T): CSSProperties
}

class StyleInterpretations<T extends object> {
  static Empty: CSSProperties = {}

  typeSample: T

  readonly keys: Array<keyof T>

  constructor(
    private ruleSet: { [id in keyof T]: ((input: T) => CSSProperties) }
  ) {
    this.keys = [] as Array<keyof T>
    for (const k in ruleSet) {
      if (!ruleSet.hasOwnProperty(k)) {
        continue
      }
      this.keys.push(k)
    }
  }

  add<U extends object, Uk extends keyof U = keyof U>(
    next: { [id in Uk]: StyleInterpretation<U> }
  ): StyleInterpretations<T & U> {
    return new StyleInterpretations<T & U>(
      Object.assign(
        {} as { [id in keyof (T & U)]: StyleInterpretation<T & U> },
        this.ruleSet,
        next
      )
    )
  }

  exec(input: Partial<T>) {
    const result: CSSProperties = {}
    for (const propName in input) {
      if (!input.hasOwnProperty(propName)) {
        continue
      }
      if (input[propName] == null) {
        continue
      }
      const ruleExecution = this.ruleSet[propName](input as T)
      if (ruleExecution !== StyleInterpretations.Empty) {
        if (process.env.NODE_ENV !== 'production') {
          Object.keys(ruleExecution).forEach((k) => {
            if (k in result) {
              console.warn(
                `Rule ${propName} tries to override property ${k} on ruleset: ${JSON.stringify(
                  input
                )}`
              )
            }
          })
        }
        Object.assign(result, ruleExecution)
      }
    }
    return result
  }

  execSubSet(input: Partial<T>, subset: Array<keyof T>) {
    const result: CSSProperties = {}
    for (const propName of subset) {
      if (input[propName] == null) {
        continue
      }
      const ruleExecution = this.ruleSet[propName](input as T)
      if (ruleExecution !== StyleInterpretations.Empty) {
        if (process.env.NODE_ENV !== 'production') {
          Object.keys(ruleExecution).forEach((k) => {
            if (k in ruleExecution) {
              console.warn(
                `Rule ${propName} tries to override property ${k} on ruleset: ${JSON.stringify(
                  input
                )}`
              )
            }
          })
        }
        Object.assign(ruleExecution, this.ruleSet[propName](input as T))
      }
    }
    return result
  }
}

export { StyleInterpretation, StyleInterpretations }
