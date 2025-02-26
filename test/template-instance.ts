import {expect} from '@open-wc/testing'
import {
  TemplateInstance,
  NodeTemplatePart,
  InnerTemplatePart,
  processPropertyIdentity,
  propertyIdentityOrBooleanAttribute,
  createProcessor,
} from '../src/index'

describe('template-instance', () => {
  it('applies data to templated text nodes', () => {
    const template = document.createElement('template')
    const originalHTML = `{{x}}`
    template.innerHTML = originalHTML
    const instance = new TemplateInstance(template, {x: 'Hello world'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`Hello world`)
  })
  it('applies data to templated element nodes', () => {
    const template = document.createElement('template')
    const element = Object.assign(document.createElement('div'), {
      innerHTML: 'Hello world',
    })
    const originalHTML = `{{x}}`
    template.innerHTML = originalHTML
    const instance = new TemplateInstance(template, {x: element})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div>Hello world</div>`)
  })
  it('applies data to nested templated element nodes with the default processPropertyIdentity', () => {
    const root = document.createElement('div')
    const template = Object.assign(document.createElement('template'), {
      innerHTML: '<template><div>{{x}}</div></template>',
    })
    const instance = new TemplateInstance(template, {x: 'Hello world'})

    root.appendChild(instance)
    expect(root.innerHTML).to.equal('<template><div>Hello world</div></template>')
    expect(template.innerHTML).to.equal('<template><div>{{x}}</div></template>')
    instance.update({x: 'Goodbye world'})
    expect(root.innerHTML).to.equal('<template><div>Goodbye world</div></template>')
    expect(template.innerHTML).to.equal('<template><div>{{x}}</div></template>')
  })
  it('applies data to nested templated element nodes with propertyIdentityOrBooleanAttribute', () => {
    const template = Object.assign(document.createElement('template'), {
      innerHTML: '<template><div hidden="{{hidden}}"></div></template>',
    })
    const instance = new TemplateInstance(template, {hidden: true}, propertyIdentityOrBooleanAttribute)

    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal('<template><div hidden=""></div></template>')
    expect(template.innerHTML).to.equal('<template><div hidden="{{hidden}}"></div></template>')
    instance.update({hidden: false})
    expect(root.innerHTML).to.equal('<template><div></div></template>')
  })
  it('applies data to templated DocumentFragment nodes', () => {
    const template = document.createElement('template')
    const fragment = Object.assign(document.createElement('template'), {
      innerHTML: '<div>Hello world</div>',
    })
    const originalHTML = `{{x}}`
    template.innerHTML = originalHTML
    const instance = new TemplateInstance(template, {x: fragment.content})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div>Hello world</div>`)
  })
  it('can render into partial text nodes', () => {
    const template = document.createElement('template')
    const originalHTML = `Hello {{x}}!`
    template.innerHTML = originalHTML
    const instance = new TemplateInstance(template, {x: 'world'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`Hello world!`)
  })
  it('can render nested text nodes', () => {
    const template = document.createElement('template')
    const originalHTML = '<div><div>Hello {{x}}!</div></div>'
    template.innerHTML = originalHTML
    const instance = new TemplateInstance(template, {x: 'world'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div><div>Hello world!</div></div>`)
  })
  it('applies data to templated attributes', () => {
    const template = document.createElement('template')
    const originalHTML = `<div class="{{y}}"></div>`
    template.innerHTML = originalHTML
    const instance = new TemplateInstance(template, {y: 'foo'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div class="foo"></div>`)
  })
  it('can render into partial attribute nodes', () => {
    const template = document.createElement('template')
    const originalHTML = `<div class="my-{{y}}-state"></div>`
    template.innerHTML = originalHTML
    const instance = new TemplateInstance(template, {y: 'foo'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div class="my-foo-state"></div>`)
  })
  it('can render into many values', () => {
    const template = document.createElement('template')
    const originalHTML = `<div class="my-{{x}}-state {{y}}">{{z}}</div>`
    template.innerHTML = originalHTML
    const instance = new TemplateInstance(template, {x: 'foo', y: 'bar', z: 'baz'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div class="my-foo-state bar">baz</div>`)
  })
  it('it allows spaces inside template part identifiers', () => {
    const template = document.createElement('template')
    const originalHTML = `<div class="my-{{ x }}-state {{ y }}">{{         z          }}</div>`
    template.innerHTML = originalHTML
    const instance = new TemplateInstance(template, {x: 'foo', y: 'bar', z: 'baz'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div class="my-foo-state bar">baz</div>`)
  })
  it('never writes mustache syntax into an instantiated template even if no state given', () => {
    const template = document.createElement('template')
    const originalHTML = `<div class="my-{{ x }}-state {{ y }}">{{ z }}</div>`
    template.innerHTML = originalHTML
    // @ts-expect-error intentionally missing arguments
    const instance = new TemplateInstance(template)
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div class="my--state "></div>`)
  })

  describe('updating', () => {
    it('updates all nodes with new values', () => {
      const template = document.createElement('template')
      const originalHTML = `<div class="my-{{ x }}-state {{ y }}">{{ z }}</div>`
      template.innerHTML = originalHTML
      const instance = new TemplateInstance(template, {x: 'foo', y: 'bar', z: 'baz'})
      expect(template.innerHTML).to.equal(originalHTML)
      const root = document.createElement('div')
      root.appendChild(instance)
      expect(root.innerHTML).to.equal(`<div class="my-foo-state bar">baz</div>`)
      instance.update({x: 'bing', y: 'bong', z: 'quux'})
      expect(root.innerHTML).to.equal(`<div class="my-bing-state bong">quux</div>`)
    })

    it('performs noop when update() is called with partial args', () => {
      const template = document.createElement('template')
      const originalHTML = `<div class="my-{{ x }}-state {{ y }}">{{ z }}</div>`
      template.innerHTML = originalHTML
      const instance = new TemplateInstance(template, {x: 'foo', y: 'bar', z: 'baz'})
      expect(template.innerHTML).to.equal(originalHTML)
      const root = document.createElement('div')
      root.appendChild(instance)
      expect(root.innerHTML).to.equal(`<div class="my-foo-state bar">baz</div>`)
      instance.update({y: 'boo'})
      expect(root.innerHTML).to.equal(`<div class="my-foo-state boo">baz</div>`)
    })

    it('is a noop when update() is called with no args', () => {
      const template = document.createElement('template')
      const originalHTML = `<div class="my-{{ x }}-state {{ y }}">{{ z }}</div>`
      template.innerHTML = originalHTML
      const instance = new TemplateInstance(template, {x: 'foo', y: 'bar', z: 'baz'})
      expect(template.innerHTML).to.equal(originalHTML)
      const root = document.createElement('div')
      root.appendChild(instance)
      expect(root.innerHTML).to.equal(`<div class="my-foo-state bar">baz</div>`)
      // @ts-expect-error intentionally calling with no args
      instance.update()
      expect(root.innerHTML).to.equal(`<div class="my-foo-state bar">baz</div>`)
    })
  })

  describe('updating with propertyIdentityOrBooleanAttribute', () => {
    it('allows attributes to be toggled on and off', () => {
      const template = document.createElement('template')
      template.innerHTML = `<div hidden="{{ hidden }}"></div>`
      const instance = new TemplateInstance(template, {hidden: true}, propertyIdentityOrBooleanAttribute)
      const root = document.createElement('div')
      root.appendChild(instance)
      expect(root.innerHTML).to.equal(`<div hidden=""></div>`)
      instance.update({hidden: false})
      expect(root.innerHTML).to.equal(`<div></div>`)
      instance.update({hidden: 'hidden'})
      expect(root.innerHTML).to.equal(`<div hidden="hidden"></div>`)
    })

    it('allows attributes to be toggled on even when starting off', () => {
      const template = document.createElement('template')
      template.innerHTML = `<div hidden="{{ hidden }}"></div>`
      const instance = new TemplateInstance(template, {hidden: false}, propertyIdentityOrBooleanAttribute)
      const root = document.createElement('div')
      root.appendChild(instance)
      expect(root.innerHTML).to.equal(`<div></div>`)
      instance.update({hidden: true})
      expect(root.innerHTML).to.equal(`<div hidden=""></div>`)
      instance.update({hidden: false})
      expect(root.innerHTML).to.equal(`<div></div>`)
    })

    it('only toggles attributes with boolean class properties', () => {
      const template = document.createElement('template')
      template.innerHTML = `<input required="{{a}}" aria-disabled="{{a}}" hidden="{{a}}" value="{{a}}"/>`
      const instance = new TemplateInstance(template, {a: false}, propertyIdentityOrBooleanAttribute)
      const root = document.createElement('div')
      root.appendChild(instance)
      expect(root.innerHTML).to.equal(`<input aria-disabled="false" value="false">`)
      instance.update({a: true})
      expect(root.innerHTML).to.equal(`<input aria-disabled="true" value="true" required="" hidden="">`)
      instance.update({a: false})
      expect(root.innerHTML).to.equal(`<input aria-disabled="false" value="false">`)
    })

    it('clears mustache when no args given', () => {
      const template = document.createElement('template')
      template.innerHTML = `<input required="{{a}}" aria-disabled="{{a}}" hidden="{{b}}" value="{{b}}"/>`
      const instance = new TemplateInstance(template, null, propertyIdentityOrBooleanAttribute)
      const root = document.createElement('div')
      root.appendChild(instance)
      expect(root.innerHTML).to.equal(`<input required="" aria-disabled="" hidden="" value="">`)
    })

    it('is a noop when `update()` is called with no args', () => {
      const template = document.createElement('template')
      template.innerHTML = `<input required="{{a}}" aria-disabled="{{a}}" hidden="{{b}}" value="{{b}}"/>`
      const instance = new TemplateInstance(template, {a: false, b: true}, propertyIdentityOrBooleanAttribute)
      const root = document.createElement('div')
      root.appendChild(instance)
      expect(root.innerHTML).to.equal(`<input aria-disabled="false" hidden="" value="true">`)
      // @ts-expect-error intentionally calling with no args
      instance.update()
      expect(root.innerHTML).to.equal(`<input aria-disabled="false" hidden="" value="true">`)
    })

    it('is a noop when `update()` is called with no args', () => {
      const template = document.createElement('template')
      template.innerHTML = `<input required="{{a}}" aria-disabled="{{a}}" hidden="{{b}}" value="{{b}}"/>`
      const instance = new TemplateInstance(template, {a: false, b: true}, propertyIdentityOrBooleanAttribute)
      const root = document.createElement('div')
      root.appendChild(instance)
      expect(root.innerHTML).to.equal(`<input aria-disabled="false" hidden="" value="true">`)
      instance.update({b: false})
      expect(root.innerHTML).to.equal(`<input aria-disabled="false" value="false">`)
    })
  })

  describe('edge cases', () => {
    describe('NodeTemplatePart', () => {
      it('replace supports a DocumentFragment Node that is not a ChildNode', () => {
        const template = Object.assign(document.createElement('template'), {
          innerHTML: '<div>{{a}}</div>',
        })
        const {content} = Object.assign(document.createElement('template'), {
          innerHTML: 'after',
        })
        const instance = new TemplateInstance(
          template,
          {a: 'before'},
          createProcessor(part => {
            if (part instanceof NodeTemplatePart) part.replace(content)
          }),
        )
        const root = document.createElement('div')
        root.appendChild(instance)
        expect(root.innerHTML).to.equal('<div>after</div>')
      })

      it('replaces an empty replace() call with an empty text node', () => {
        const template = document.createElement('template')
        template.innerHTML = `<div>{{a}}</div>`
        const instance = new TemplateInstance(
          template,
          {a: true},
          createProcessor(part => {
            ;(part as NodeTemplatePart).replace()
            ;(part as NodeTemplatePart).replace()
            ;(part as NodeTemplatePart).replace()
          }),
        )
        const root = document.createElement('div')
        root.appendChild(instance)
        expect(root.innerHTML).to.equal(`<div></div>`)
      })
    })
  })

  describe('custom processors', () => {
    describe('createCallback', () => {
      it('is called once on construction, if present', () => {
        const template = document.createElement('template')
        template.innerHTML = `<div>{{a}}</div>`
        let createCallCount = 0
        new TemplateInstance(
          template,
          {a: true},
          {
            createCallback() {
              createCallCount += 1
            },
            processCallback() {
              return
            },
          },
        )
        expect(createCallCount).to.equal(1)
      })

      it('is not called on update', () => {
        const template = document.createElement('template')
        template.innerHTML = `<div>{{a}}</div>`
        let createCallCount = 0
        const instance = new TemplateInstance(
          template,
          {a: true},
          {
            createCallback() {
              createCallCount += 1
            },
            processCallback() {
              return
            },
          },
        )
        expect(createCallCount).to.equal(1)
        instance.update({a: false})
        expect(createCallCount).to.equal(1)
      })
    })

    describe('processCallback', () => {
      it('is called on construction', () => {
        const template = document.createElement('template')
        template.innerHTML = `<div>{{a}}</div>`
        let processCallCount = 0
        new TemplateInstance(
          template,
          {a: true},
          {
            processCallback() {
              processCallCount += 1
            },
          },
        )
        expect(processCallCount).to.equal(1)
      })

      it('is called on update', () => {
        const template = document.createElement('template')
        template.innerHTML = `<div>{{a}}</div>`
        let processCallCount = 0
        const instance = new TemplateInstance(
          template,
          {a: true},
          {
            processCallback() {
              processCallCount += 1
            },
          },
        )
        expect(processCallCount).to.equal(1)
        instance.update({a: false})
        expect(processCallCount).to.equal(2)
      })
    })

    describe('handling InnerTemplatePart', () => {
      it('makes outer state available to InnerTemplatePart elements with [directive]', () => {
        const processor = createProcessor((part, value, state) => {
          if (part instanceof InnerTemplatePart && part.directive === 'if') {
            if (typeof state === 'object' && (state as Record<string, unknown>)[part.expression]) {
              part.replace(new TemplateInstance(part.template, state, processor))
            } else {
              part.replace()
            }
          } else {
            processPropertyIdentity(part, value)
          }
        })
        const template = Object.assign(document.createElement('template'), {
          innerHTML: '{{x}}<template directive="if" expression="y">{{y}}</template>',
        })

        const root = document.createElement('div')
        root.appendChild(new TemplateInstance(template, {x: 'x', y: 'y'}, processor))
        expect(root.innerHTML).to.equal('xy')

        root.replaceChildren(new TemplateInstance(template, {x: 'x', y: false}, processor))
        expect(root.innerHTML).to.equal('x')
      })
    })
  })
})
