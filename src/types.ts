import type {TemplateInstance} from './template-instance.js'

export interface TemplatePart {
  expression: string
  value: Node | string | null
}

type TemplateProcessCallback = (instance: TemplateInstance, parts: Iterable<TemplatePart>, params: unknown) => void

export type TemplateTypeInit = {
  processCallback: TemplateProcessCallback
  createCallback?: TemplateProcessCallback
}
