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
    this.parentNode.children.push(node)
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
  children: AttributeValuePart[] = []
  get value(): string {
    return this.children.reduce((str, part) => `${str}${part.value}`, '')
  }
  set value(value: string) {
    this.children = [new AttributeValuePart(this, value)]
    this.updateParent()
  }
  constructor(public parentNode: Attr) {
    this.children = [new AttributeValuePart(this, this.parentNode.value)]
  }
  updateParent(): void {
    this.parentNode.value = this.value
  }
}
