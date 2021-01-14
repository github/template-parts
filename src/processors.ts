import type {TemplatePart, TemplateTypeInit} from './types.js'
import type {TemplateInstance} from './template-instance.js'
import {AttributeTemplatePart} from './attribute-template-part.js'

type PartProcessor = (part: TemplatePart, params: unknown) => void

export function createProcessor(processPart: PartProcessor): TemplateTypeInit {
  return {
    createCallback(instance: TemplateInstance, parts: Iterable<TemplatePart>, params: unknown): void {
      this.processCallback(instance, parts, params)
    },
    processCallback(_: TemplateInstance, parts: Iterable<TemplatePart>, params: unknown): void {
      if (typeof params !== 'object' || !params) return
      for (const part of parts) if (part.expression in params) processPart(part, params)
    }
  }
}

export function processPropertyIdentity(part: TemplatePart, params: unknown): void {
  part.value = String((params as Record<string, unknown>)[part.expression] ?? '')
}

export function processBooleanAttribute(part: TemplatePart, params: unknown): boolean {
  const value = (params as Record<string, unknown>)[part.expression] ?? ''
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
export const propertyIdentityOrBooleanAttribute = createProcessor((part: TemplatePart, params: unknown) => {
  processBooleanAttribute(part, params) || processPropertyIdentity(part, params)
})
