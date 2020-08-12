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
    if (part instanceof AttributeTemplatePart && part.parentNode.partList.length === 1) {
      const element = part.parentNode.element
      const attr = part.parentNode.parentNode
      if (value === false) {
        element.removeAttribute(attr.name)
      } else {
        element.setAttribute(attr.name, value === true ? attr.name : value)
      }
    } else if (part instanceof AttributeTemplatePart) {
      part.replaceWith(value)
    } else {
      part.replace(value)
    }
  }
}
