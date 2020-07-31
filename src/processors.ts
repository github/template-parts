import type {Part} from './stamped-template.js'

export function propertyIdentity(parts: Iterable<Part>, params: Record<string, unknown>): void {
  for (const part of parts) {
    const key = part.expression.trim()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: any = key in params ? params[key] : ''
    part.replaceWith(value)
  }
}
