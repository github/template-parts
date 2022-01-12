import type {TemplatePart, TemplateTypeInit} from './types.js'
import type {TemplateInstance} from './template-instance.js'
import {AttributeTemplatePart} from './attribute-template-part.js'

type PartProcessor = (part: TemplatePart, value: unknown) => void

export function createProcessor(processPart: PartProcessor): TemplateTypeInit {
  return {
    processCallback(_: TemplateInstance, parts: Iterable<TemplatePart>, params: unknown): void {
      if (typeof params !== 'object' || !params) return
      for (const part of parts) {
        if (part.expression in params) {
          const value = (params as Record<string, unknown>)[part.expression] ?? ''
          processPart(part, value)
        }
      }
    }
  }
}

export function processPropertyIdentity(part: TemplatePart, value: unknown): void {
  part.value = String(value)
}

export function processBooleanAttribute(part: TemplatePart, value: unknown): boolean {
  if (
    typeof value === 'boolean' &&
    part instanceof AttributeTemplatePart &&
    typeof part.element[part.attributeName as keyof Element] === 'boolean'
  ) {
    part.booleanValue = value
    return true
  }
  return false
}

export const propertyIdentity = createProcessor(processPropertyIdentity)
export const propertyIdentityOrBooleanAttribute = createProcessor((part: TemplatePart, value: unknown) => {
  processBooleanAttribute(part, value) || processPropertyIdentity(part, value)
})
