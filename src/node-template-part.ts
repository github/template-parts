import {TemplatePart} from './types.js'

export class NodeTemplatePart implements TemplatePart {
  #parts: ChildNode[]

  constructor(node: ChildNode, public expression: string) {
    this.#parts = [node]
    node.textContent = ''
  }

  get value(): string {
    return this.#parts.map(node => node.textContent).join('')
  }

  set value(string: string) {
    this.replace(string)
  }

  get previousSibling(): ChildNode | null {
    return this.#parts[0].previousSibling
  }

  get nextSibling(): ChildNode | null {
    return this.#parts[this.#parts.length - 1].nextSibling
  }

  replace(...nodes: Array<string | ChildNode>): void {
    const parts: ChildNode[] = nodes.map(node => {
      if (typeof node === 'string') return new Text(node)
      return node
    })
    if (!parts.length) parts.push(new Text(''))
    this.#parts[0].before(...parts)
    for (const part of this.#parts) part.remove()
    this.#parts = parts
  }
}
