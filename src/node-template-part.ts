export class NodeTemplatePart {
  constructor(public parentNode: ChildNode, public expression: string) {}

  replaceWith(node: string | ChildNode): void {
    if (typeof node === 'string') node = new Text(node)
    this.parentNode.replaceWith(node)
    this.parentNode = node
  }
}
