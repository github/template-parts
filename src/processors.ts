import type {TemplatePart} from './stamped-template.js'
import {AttributeValueSetter} from './attribute-template-part.js'

export function propertyIdentity(parts: Iterable<TemplatePart>, params: Record<string, unknown>): void {
  for (const part of parts) {
    const key = part.expression
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: any = key in params ? params[key] : ''
    part.replaceWith(value)
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
    const attributeParentPart = part.parentNode
    if (attributeParentPart instanceof AttributeValueSetter && attributeParentPart?.partList.length === 1) {
      const element = attributeParentPart.element
      const attr = attributeParentPart.parentNode
      if (value === false) {
        element.removeAttribute(attr.name)
      } else {
        element.setAttribute(attr.name, value === true ? attr.name : value)
      }
    } else {
      part.replaceWith(value)
    }
  }
}
