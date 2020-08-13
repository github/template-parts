import type {TemplatePart} from './types.js'
import {AttributeTemplatePart} from './attribute-template-part.js'

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
    const value: unknown = params[part.expression] ?? ''
    if (typeof value === 'boolean' && part instanceof AttributeTemplatePart) {
        part.booleanValue = value
    } else {
      part.value = String(value)
    }
  }
}
