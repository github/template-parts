import {parse} from './template-string-parser.js'
import {AttributeValueSetter, AttributeTemplatePart} from './attribute-template-part.js'
import {NodeTemplatePart} from './node-template-part.js'
import {propertyIdentity} from './processors.js'
import {TemplatePart, TemplateTypeInit} from './types.js'

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
              const part = new AttributeTemplatePart(valueSetter, token.value)
              valueSetter.append(part)
              yield part
            }
          }
        }
      }
    } else if (node instanceof Text && node.textContent && node.textContent.includes('{{')) {
      for (const token of parse(node.textContent)) {
        if (token.end < node.textContent.length) node.splitText(token.end)
        if (token.type === 'part') yield new NodeTemplatePart(node, token.value)
        break
      }
    }
  }
}

export class TemplateInstance extends DocumentFragment {
  #processor: TemplateTypeInit
  #parts: Iterable<TemplatePart>

  constructor(template: HTMLTemplateElement, params: unknown, processor: TemplateTypeInit = propertyIdentity) {
    super()
    // This is to fix an inconsistency in Safari which prevents us from
    // correctly sub-classing DocumentFragment.
    // https://bugs.webkit.org/show_bug.cgi?id=195556
    if (Object.getPrototypeOf(this) !== TemplateInstance.prototype) {
      Object.setPrototypeOf(this, TemplateInstance.prototype)
    }
    this.appendChild(template.content.cloneNode(true))
    this.#parts = Array.from(collectParts(this))
    this.#processor = processor
    this.#processor.createCallback?.(this, this.#parts, params)
  }

  update(params: unknown): void {
    this.#processor.processCallback(this, this.#parts, params)
  }
}
