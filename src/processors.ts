import type {Part} from './stamped-template.js'
import {AttributeValueSetter} from './attribute-template-part.js'

export function propertyIdentity(parts: Iterable<Part>, params: Record<string, unknown>): void {
  for (const part of parts) {
    const key = part.expression
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: any = key in params ? params[key] : ''
    part.replaceWith(value)
  }
}

export function propertyIdentityOrBooleanAttribute(parts: Iterable<Part>, params: Record<string, unknown>): void {
  for (const part of parts) {
    const key = part.expression
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: any = key in params ? params[key] : ''
    const parent = part.parentNode
    const attributeParentPart = part.parentPart.parentNode
    if (
      parent instanceof Element &&
      attributeParentPart instanceof AttributeValueSetter &&
      attributeParentPart?.partList.length === 1
    ) {
      if (value === false) {
        parent.removeAttribute(part.attribute!.name)
      } else {
        parent.setAttribute(part.attribute!.name, value === true ? part.attribute!.name : value)
      }
    } else {
      part.replaceWith(value)
    }
  }
}
