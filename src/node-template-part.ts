import {TemplatePart} from './types.js'

const parts = new WeakMap<NodeTemplatePart, Node[]>()
export class NodeTemplatePart implements TemplatePart {
  constructor(
    node: Node,
    public expression: string,
  ) {
    parts.set(this, [node])
    node.textContent = ''
  }

  get value(): string {
    return parts
      .get(this)!
      .map(node => node.textContent)
      .join('')
  }

  set value(string: string) {
    this.replace(string)
  }

  get previousSibling(): ChildNode | null {
    return parts.get(this)![0].previousSibling
  }

  get nextSibling(): ChildNode | null {
    return parts.get(this)![parts.get(this)!.length - 1].nextSibling
  }

  replace(...nodes: Array<string | Node>): void {
    const normalisedNodes: Node[] = nodes.map(node => {
      if (typeof node === 'string') return new Text(node)
      return node
    })
    if (!normalisedNodes.length) normalisedNodes.push(new Text(''))
    const node = parts.get(this)![0]
    for (const normalisedNode of normalisedNodes) node.parentNode?.insertBefore(normalisedNode, node)
    for (const part of parts.get(this)!) part.parentNode?.removeChild(part)
    parts.set(this, normalisedNodes)
  }
}
