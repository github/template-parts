import {parse} from './template-string-parser.js'
import {AttributeValueSetter, AttributeValuePart} from './attribute-value.js'
import {propertyIdentity} from './processors.js'

type Params = Record<string, unknown>
export type StampedTemplateProcessor = (parts: Iterable<Part>, params: Params) => void

export class Part {
  constructor(
    public parentNode: ChildNode,
    public parentPart: ChildNode | AttributeValuePart,
    public expression: string
  ) {}

  get attribute(): Attr | null {
    return this.parentPart instanceof AttributeValuePart ? this.parentPart.parentNode.parentNode : null
  }

  replaceWith(node: string | ChildNode): void {
    if (typeof node === 'string') node = new Text(node)
    this.parentPart = this.parentPart.replaceWith(node) || node
  }
}

function* collectParts(el: DocumentFragment): Generator<Part> {
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false)
  let node
  while ((node = walker.nextNode())) {
    if (node instanceof Element && node.hasAttributes()) {
      for (let i = 0; i < node.attributes.length; i += 1) {
        const attr = node.attributes.item(i)
        if (attr && attr.value.includes('{{')) {
          let part = new AttributeValueSetter(attr).partList[0]
          for (const token of parse(attr.value)) {
            if (token.end < attr.value.length) {
              const oldPart = part
              part = part.split(token.end - token.start)
              if (token.type === 'part') {
                yield new Part(node, oldPart, token.value)
              }
            } else if (token.type === 'part') {
              yield new Part(node, part, token.value)
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
  #parts: Iterable<Part>

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
