import {TemplatePart} from './types.js'

export class AttributeTemplatePart implements TemplatePart {
  #setter: AttributeValueSetter
  #value = ''

  constructor(setter: AttributeValueSetter, public expression: string) {
    this.#setter = setter
    this.#setter.updateParent('')
  }

  get attributeName(): string {
    return this.#setter.attr.name
  }

  get attributeNamespace(): string | null {
    return this.#setter.attr.namespaceURI
  }

  get value(): string | null {
    return this.#value
  }

  set value(value: string | null) {
    this.#value = value || ''
    this.#setter.updateParent(value)
  }

  get element(): Element {
    return this.#setter.element
  }

  get booleanValue(): boolean {
    return this.#setter.booleanValue
  }

  set booleanValue(value: boolean) {
    this.#setter.booleanValue = value
  }
}

export class AttributeValueSetter {
  partList: Array<string | AttributeTemplatePart> = []

  constructor(public element: Element, public attr: Attr) {}

  get booleanValue(): boolean {
    return this.element.hasAttributeNS(this.attr.namespaceURI, this.attr.name)
  }

  set booleanValue(value: boolean) {
    if (this.partList.length !== 1) {
      throw new DOMException('Operation not supported', 'NotSupportedError')
    }
    ;(this.partList[0] as AttributeTemplatePart).value = value ? '' : null
  }

  append(part: string | AttributeTemplatePart): void {
    this.partList.push(part)
  }

  updateParent(partValue: string | null): void {
    if (this.partList.length === 1 && partValue === null) {
      this.element.removeAttributeNS(this.attr.namespaceURI, this.attr.name)
    } else {
      const str = this.partList.map(s => (typeof s === 'string' ? s : s.value)).join('')
      this.element.setAttributeNS(this.attr.namespaceURI, this.attr.name, str)
    }
  }
}
