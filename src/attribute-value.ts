export class AttributeValuePart {
  #value = ''
  get value(): string {
    return this.#value
  }
  set value(value: string) {
    this.#value = value
    this.parentNode.updateParent()
  }
  constructor(public parentNode: AttributeValueSetter, value: string) {
    this.#value = value
  }
  split(offset: number): AttributeValuePart {
    const node = new AttributeValuePart(this.parentNode, this.#value.slice(offset))
    this.#value = this.#value.slice(0, offset)
    this.parentNode.partList.push(node)
    return node
  }
  replaceWith(value: string | ChildNode): AttributeValuePart {
    if (typeof value === 'string') {
      this.value = value
    } else {
      this.value = value.textContent || ''
    }
    return this
  }
}

export class AttributeValueSetter {
  partList: Array<string | AttributeValuePart> = []
  get value(): string {
    return this.partList.reduce((str: string, part) => {
      str += typeof part === 'string' ? part : part.value
      return str
    }, '')
  }
  set value(value: string) {
    this.partList = [new AttributeValuePart(this, value)]
    this.updateParent()
  }
  constructor(public element: Element, public parentNode: Attr) {}
  append(part: string | AttributeValuePart): void {
    this.partList.push(part)
  }
  updateParent(): void {
    this.parentNode.value = this.value
  }
}
