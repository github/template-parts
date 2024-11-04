import {TemplatePart} from './types.js'

const parts = new WeakMap<NodeTemplatePart, ChildNode[]>()
export class NodeTemplatePart implements TemplatePart {
  constructor(
    node: ChildNode,
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

  replace(...nodes: Array<string | ChildNode>): void {
    const normalisedNodes: ChildNode[] = nodes.map(node => {
      if (typeof node === 'string') return new Text(node)
      return node
    })
    if (!normalisedNodes.length) normalisedNodes.push(new Text(''))
    parts.get(this)![0].before(...normalisedNodes)
    for (const part of parts.get(this)!) part.remove()
    parts.set(this, normalisedNodes)
  }
}
