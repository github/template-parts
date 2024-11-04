import {TemplatePart} from './types.js'

const setters = new WeakMap<AttributeTemplatePart, AttributeValueSetter>()
const values = new WeakMap<AttributeTemplatePart, string>()
export class AttributeTemplatePart implements TemplatePart {
  constructor(
    setter: AttributeValueSetter,
    public expression: string,
  ) {
    setters.set(this, setter)
    setter.updateParent('')
  }

  get attributeName(): string {
    return setters.get(this)!.attr.name
  }

  get attributeNamespace(): string | null {
    return setters.get(this)!.attr.namespaceURI
  }

  get value(): string | null {
    return values.get(this)!
  }

  set value(value: string | null) {
    values.set(this, value || '')
    setters.get(this)!.updateParent(value)
  }

  get element(): Element {
    return setters.get(this)!.element
  }

  get booleanValue(): boolean {
    return setters.get(this)!.booleanValue
  }

  set booleanValue(value: boolean) {
    setters.get(this)!.booleanValue = value
  }
}

export class AttributeValueSetter {
  partList: Array<string | AttributeTemplatePart> = []

  constructor(
    public element: Element,
    public attr: Attr,
  ) {}

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
