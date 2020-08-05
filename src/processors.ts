import type {Part} from './stamped-template.js'

export function propertyIdentity(parts: Iterable<Part>, params: Record<string, unknown>): void {
  for (const part of parts) {
    const key = part.expression.trim()
    if (key in params) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      part.replaceWith(params[key] as any)
    }
  }
}

export function propertyIdentityOrBooleanAttribute(parts: Iterable<Part>, params: Record<string, unknown>): void {
  for (const part of parts) {
    const key = part.expression.trim()
    if (key in params) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = params[key] as any
      const parent = part.parentNode
      if (part.attribute && parent instanceof HTMLElement && part.parentPart.parentNode?.children.length === 1) {
        if (value === false) {
          parent.removeAttribute(part.attribute.name)
        } else {
          parent.setAttribute(part.attribute.name, value === true ? part.attribute.name : value)
        }
      } else {
        part.replaceWith(value)
      }
    }
  }
}
