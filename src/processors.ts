import type {TemplatePart} from './types.js'
import {AttributeTemplatePart} from './attribute-template-part.js'
import {NodeTemplatePart} from './node-template-part.js'

export function propertyIdentity(parts: Iterable<TemplatePart>, params: Record<string, unknown>): void {
  for (const part of parts) {
    part.value = String(params[part.expression] ?? '')
  }
}

export function propertyIdentityOrBooleanAttribute(
  parts: Iterable<TemplatePart>,
  params: Record<string, unknown>
): void {
  for (const part of parts) {
    const key = part.expression
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: any = key in params ? params[key] : ''
    if (part instanceof AttributeTemplatePart && part.booleanValue) {
      const element = part.element
      const name = part.attributeName
      if (value === false) {
        element.removeAttribute(name)
      } else {
        element.setAttribute(name, value === true ? name : value)
      }
    } else if (part instanceof NodeTemplatePart) {
      part.replace(value)
    } else {
      part.value = value
    }
  }
}
