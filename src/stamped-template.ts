import {parse} from './template-string-parser.js'
import {AttributeValueSetter, AttributeTemplatePart} from './attribute-template-part.js'
import {propertyIdentity} from './processors.js'

type Params = Record<string, unknown>
export type StampedTemplateProcessor = (parts: Iterable<TemplatePart>, params: Params) => void

export type TemplatePart = Part | AttributeTemplatePart

export class Part {
  constructor(
    public parentNode: ChildNode,
    public parentPart: ChildNode | AttributeTemplatePart,
    public expression: string
  ) {}

  get attribute(): Attr | null {
    return this.parentPart instanceof AttributeTemplatePart ? this.parentPart.parentNode.parentNode : null
  }

  replaceWith(node: string | ChildNode): void {
    if (typeof node === 'string') node = new Text(node)
    this.parentPart = this.parentPart.replaceWith(node) || node
  }
}

function* collectParts(el: DocumentFragment): Generator<TemplatePart> {
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false)
  let node
  while ((node = walker.nextNode())) {
    if (node instanceof Element && node.hasAttributes()) {
      for (let i = 0; i < node.attributes.length; i += 1) {
        const attr = node.attributes.item(i)
        if (attr && attr.value.includes('{{')) {
          const valueSetter = new AttributeValueSetter(node, attr)
          for (const token of parse(attr.value)) {
            if (token.type === 'string') {
              valueSetter.append(token.value)
            } else {
              const part = new AttributeTemplatePart(valueSetter, '', token.value)
              valueSetter.append(part)
              yield part
            }
          }
        }
      }
    } else if (node instanceof Text && node.textContent && node.textContent.includes('{{')) {
      for (const token of parse(node.textContent)) {
        if (token.end < node.textContent.length) node.splitText(token.end)
        if (token.type === 'part') yield new Part(node, node, token.value)
        break
      }
    }
  }
}

export class StampedTemplate extends DocumentFragment {
  #processor: StampedTemplateProcessor
  #parts: Iterable<TemplatePart>

  constructor(template: HTMLTemplateElement, params: Params, processor: StampedTemplateProcessor = propertyIdentity) {
    super()
    this.appendChild(template.content.cloneNode(true))
    this.#parts = Array.from(collectParts(this))
    this.#processor = processor
    this.update(params)
  }

  update(params: Record<string, unknown>): void {
    this.#processor(this.#parts, params)
  }
}
