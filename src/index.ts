export {TemplateInstance} from './template-instance.js'
export {parse} from './template-string-parser.js'
export {AttributeTemplatePart, AttributeValueSetter} from './attribute-template-part.js'
export {InnerTemplatePart} from './inner-template-part.js'
export {NodeTemplatePart} from './node-template-part.js'
export {
  createProcessor,
  processPropertyIdentity,
  processBooleanAttribute,
  propertyIdentity,
  propertyIdentityOrBooleanAttribute,
} from './processors.js'
export type {TemplatePart, TemplateTypeInit} from './types.js'
