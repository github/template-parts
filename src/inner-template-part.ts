import {NodeTemplatePart} from './node-template-part.js'

export class InnerTemplatePart extends NodeTemplatePart {
  constructor(public template: HTMLTemplateElement) {
    super(template, template.getAttribute('expression') ?? '')
  }

  get directive(): string {
    return this.template.getAttribute('directive') ?? ''
  }
}
