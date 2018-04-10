export function tokenizeScope(text: string): CSSParseResult {
  const values = [] as CSSParseToken[]
  let remainingText = text
  while (true) {
    const { result, rest } = tokenizeValue(remainingText)
    if (result) {
      values.push(result)
    }
    remainingText = rest
    if (remainingText.length === 0) {
      break
    }
    if (remainingText[0] === ',') {
      continue
    }
    if (remainingText[0] === ')') {
      break
    }
  }
  if (values.length === 0) {
    return { result: null, rest: remainingText }
  }
  if (values.length === 1) {
    return { result: values[0], rest: remainingText }
  }
  return { result: { type: 'values', values }, rest: remainingText }
}

export function tokenizeValue(text: string): CSSParseResult {
  const parts = [] as CSSParseToken[]
  let remainingText = text
  let currentToken = ''
  let i = 0
  for (; i < remainingText.length; i++) {
    if (text[i] === ')') {
      i--
      break
    }
    if (text[i] === ',') {
      i--
      break
    }
    if (text[i] === ' ') {
      parts.push({ type: 'word', word: currentToken })
      currentToken = ''
      continue
    }
    if (text[i] === '(') {
      parts.push({ type: 'word', word: currentToken })
      currentToken = ''
      const { result, rest } = tokenizeScope(text.slice(i + 1))
      if (result) {
        parts.push(result)
      }
      remainingText = rest
      i = 0
      continue
    }
    currentToken += text[i]
  }
  if (currentToken.length > 0) {
    parts.push({ type: 'word', word: currentToken })
  }
  if (parts.length === 0) {
    return { result: null, rest: text.slice(i) }
  }
  if (parts.length === 1) {
    return { result: parts[0], rest: text.slice(i) }
  }
  return { result: { type: 'parts', parts }, rest: text.slice(i) }
}

export interface CSSParseResult {
  result: CSSParseToken | null
  rest: string
}

export type CSSParseToken =
  | {
      type: 'values'
      values: CSSParseToken[]
    }
  | {
      type: 'parts'
      parts: CSSParseToken[]
    }
  | {
      type: 'word'
      word: string
    }
