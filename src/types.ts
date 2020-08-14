import type {TemplateInstance} from './template-instance.js'

export interface TemplatePart {
  expression: string
  value: string | null
}

type TemplateProcessCallback = (instance: TemplateInstance, parts: Iterable<TemplatePart>, params: Params) => void

export type Params = Record<string, unknown>

export type TemplateTypeInit = {
  processCallback: TemplateProcessCallback
  createCallback?: TemplateProcessCallback
}
