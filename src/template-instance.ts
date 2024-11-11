import {parse} from './template-string-parser.js'
import {AttributeValueSetter, AttributeTemplatePart} from './attribute-template-part.js'
import {NodeTemplatePart} from './node-template-part.js'
import {propertyIdentity} from './processors.js'
import {TemplatePart, TemplateTypeInit} from './types.js'

function* collectParts(el: DocumentFragment): Generator<TemplatePart> {
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null)
  let node
  while ((node = walker.nextNode())) {
    if (node instanceof HTMLTemplateElement) {
      for (const part of collectParts(node.content)) {
        yield part
      }
    } else if (node instanceof Element && node.hasAttributes()) {
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
      const parsed = parse(node.textContent)
      // A for..of loop would be nicer here, unfortunately Safari had a runtime error on this loop.
      // https://github.com/github/template-parts/pull/55
      for (let i = 0; i < parsed.length; i += 1) {
        const token = parsed[i]
        if (token.end < node.textContent.length) node.splitText(token.end)
        if (token.type === 'part') yield new NodeTemplatePart(node, token.value)
        break
      }
    }
  }
}

const processors = new WeakMap<TemplateInstance, TemplateTypeInit>()
const parts = new WeakMap<TemplateInstance, Iterable<TemplatePart>>()
export class TemplateInstance extends (globalThis.DocumentFragment || EventTarget) {
  constructor(template: HTMLTemplateElement, params: unknown, processor: TemplateTypeInit = propertyIdentity) {
    super()
    // This is to fix an inconsistency in Safari which prevents us from
    // correctly sub-classing DocumentFragment.
    // https://bugs.webkit.org/show_bug.cgi?id=195556
    if (Object.getPrototypeOf(this) !== TemplateInstance.prototype) {
      Object.setPrototypeOf(this, TemplateInstance.prototype)
    }
    this.appendChild(template.content.cloneNode(true))
    parts.set(this, Array.from(collectParts(this)))
    processors.set(this, processor)
    processors.get(this)!.createCallback?.(this, parts.get(this)!, params)
    processors.get(this)!.processCallback(this, parts.get(this)!, params)
  }

  update(params: unknown): void {
    processors.get(this)!.processCallback(this, parts.get(this)!, params)
  }
}
