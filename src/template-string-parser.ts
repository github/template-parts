interface StringToken {
  type: 'string'
  start: number
  end: number
  value: string
}
interface PartToken {
  type: 'part'
  start: number
  end: number
  value: string
}
export type Token = StringToken | PartToken
const mem = new Map<string, readonly Token[]>()
export function parse(text: string): readonly Token[] {
  if (mem.has(text)) return mem.get(text)!
  const length = text.length
  let lastPos = 0
  let tokenStart = 0
  let open = 0
  const items: Token[] = []
  for (let i = 0; i < length; i += 1) {
    const char = text[i]
    const lookAhead = text[i + 1]
    const lookBehind = text[i - 1]
    if (char === '{' && lookAhead === '{' && lookBehind !== '\\') {
      open += 1
      if (open === 1) tokenStart = i
      i += 1
    } else if (char === '}' && lookAhead === '}' && lookBehind !== '\\' && open) {
      open -= 1
      if (open === 0) {
        if (tokenStart > lastPos) {
          items.push(
            Object.freeze({
              type: 'string',
              start: lastPos,
              end: tokenStart,
              value: text.slice(lastPos, tokenStart)
            })
          )
          lastPos = tokenStart
        }
        items.push(
          Object.freeze({
            type: 'part',
            start: tokenStart,
            end: i + 2,
            value: text.slice(lastPos + 2, i).trim()
          })
        )
        i += 1
        lastPos = i + 1
      }
    }
  }
  if (lastPos < length)
    items.push(Object.freeze({type: 'string', start: lastPos, end: length, value: text.slice(lastPos, length)}))
  mem.set(text, Object.freeze(items))
  return mem.get(text)!
}
