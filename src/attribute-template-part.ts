export class AttributeTemplatePart {
  #value = ''
  get value(): string {
    return this.#value
  }
  set value(value: string) {
    this.#value = value
    this.parentNode.updateParent()
  }
  constructor(public parentNode: AttributeValueSetter, value: string, public expression: string) {
    this.#value = value
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
  get value(): string {
    return this.partList.reduce((str: string, part) => {
      str += typeof part === 'string' ? part : part.value
      return str
    }, '')
  }
  set value(value: string) {
    this.partList = [new AttributeTemplatePart(this, value, '')]
    this.updateParent()
  }
  constructor(public element: Element, public parentNode: Attr) {}
  append(part: string | AttributeTemplatePart): void {
    this.partList.push(part)
  }
  updateParent(): void {
    this.parentNode.value = this.value
  }
}
