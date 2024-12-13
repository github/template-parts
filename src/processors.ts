import type {TemplatePart, TemplateTypeInit} from './types.js'
import {TemplateInstance} from './template-instance.js'
import {InnerTemplatePart} from './inner-template-part.js'
import {AttributeTemplatePart} from './attribute-template-part.js'

type PartProcessor = (part: TemplatePart, value: unknown, state: unknown) => void

export function createProcessor(processPart: PartProcessor): TemplateTypeInit {
  return {
    processCallback(_: TemplateInstance, parts: Iterable<TemplatePart>, state: unknown): void {
      if (typeof state !== 'object' || !state) return
      for (const part of parts) {
        if (part instanceof InnerTemplatePart) {
          processPart(part, part.expression, state)
        } else if (part.expression in state) {
          const value = (state as Record<string, unknown>)[part.expression] ?? ''
          processPart(part, value, state)
        }
      }
    },
  }
}

export function processPropertyIdentity(part: TemplatePart, value: unknown, state?: unknown): void {
  if (part instanceof InnerTemplatePart) {
    const instance = new TemplateInstance(part.template, state)
    part.template.content.replaceChildren(instance)
  } else {
    part.value = value instanceof Node ? value : String(value)
  }
}

export function processBooleanAttribute(part: TemplatePart, value: unknown, state?: unknown): boolean {
  if (part instanceof InnerTemplatePart) {
    const instance = new TemplateInstance(part.template, state, propertyIdentityOrBooleanAttribute)
    part.template.content.replaceChildren(instance)

    return true
  } else if (
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
export const propertyIdentityOrBooleanAttribute = createProcessor(
  (part: TemplatePart, value: unknown, state: unknown) => {
    if (!processBooleanAttribute(part, value, state)) {
      processPropertyIdentity(part, value, state)
    }
  },
)
