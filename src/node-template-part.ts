export class NodeTemplatePart {
  constructor(public parentNode: ChildNode, public parentPart: ChildNode, public expression: string) {}

  get attribute(): Attr | null {
    return null
  }

  replaceWith(node: string | ChildNode): void {
    if (typeof node === 'string') node = new Text(node)
    this.parentPart.replaceWith(node)
    this.parentPart = node
  }
}
