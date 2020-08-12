import type {TemplatePart} from './stamped-template.js'
import {AttributeTemplatePart} from './attribute-template-part.js'

export function propertyIdentity(parts: Iterable<TemplatePart>, params: Record<string, unknown>): void {
  for (const part of parts) {
    const key = part.expression
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: any = key in params ? params[key] : ''
    if (part instanceof AttributeTemplatePart) {
      part.replaceWith(value)
    } else {
      part.replace(value)
    }
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
    } else if (part instanceof AttributeTemplatePart) {
      part.replaceWith(value)
    } else {
      part.replace(value)
    }
  }
}
