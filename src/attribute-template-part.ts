import {TemplatePart} from './types.js'
export class AttributeTemplatePart implements TemplatePart {
  #setter: AttributeValueSetter
  #value = ''

  get value(): string {
    return this.#value
  }

  set value(value: string) {
    this.#value = value
    this.#setter.updateParent()
  }

  get element(): Element {
    return this.#setter.element
  }

  get attributeName(): string {
    return this.#setter.attr.name
  }

  get booleanValue(): boolean {
    return this.#setter.partList.length === 1
  }

  constructor(setter: AttributeValueSetter, public expression: string) {
    this.#setter = setter
  }

  replaceWith(value: string | ChildNode): AttributeTemplatePart {
    if (typeof value === 'string') {
      this.value = value
    } else {
      this.value = value.textContent || ''
    }
    return this
  }
}

export class AttributeValueSetter {
  partList: Array<string | AttributeTemplatePart> = []

  constructor(public element: Element, public attr: Attr) {}
  append(part: string | AttributeTemplatePart): void {
    this.partList.push(part)
  }
  updateParent(): void {
    this.attr.value = this.partList.reduce((str: string, part) => {
      str += typeof part === 'string' ? part : part.value
      return str
    }, '')
  }
}
