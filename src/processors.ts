import type {TemplatePart} from './types.js'
import type {TemplateInstance} from './template-instance.js'
import {AttributeTemplatePart} from './attribute-template-part.js'

export const propertyIdentity = {
  createCallback(parts: Iterable<TemplatePart>, params: Record<string, unknown>): void {
    this.processCallback(parts, params)
  },
  processCallback(parts: Iterable<TemplatePart>, params: Record<string, unknown>): void {
    for (const part of parts) {
      part.value = String(params[part.expression] ?? '')
    }
  }
}

export const propertyIdentityOrBooleanAttribute = {
  createCallback(parts: Iterable<TemplatePart>, params: Record<string, unknown>): void {
    this.processCallback(parts, params)
  },
  processCallback(parts: Iterable<TemplatePart>, params: Record<string, unknown>): void {
    for (const part of parts) {
      const value: unknown = params[part.expression] ?? ''
      if (
        typeof value === 'boolean' &&
        part instanceof AttributeTemplatePart &&
        typeof part.element[part.attributeName as keyof Element] === 'boolean'
      ) {
        part.booleanValue = value
      } else {
        part.value = String(value)
      }
    }
  }
}
