export interface TemplatePart {
  expression: string
  value: string | null
}

export type TemplateTypeInit = (parts: Iterable<TemplatePart>, params: Params) => void

export type Params = Record<string, unknown>
