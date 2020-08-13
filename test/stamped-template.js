import {StampedTemplate} from '../lib/stamped-template.js'
import {propertyIdentityOrBooleanAttribute} from '../lib/processors.js'

describe('stamped-template', () => {
  it('applies data to templated text nodes', () => {
    const template = document.createElement('template')
    const originalHTML = `{{x}}`
    template.innerHTML = originalHTML
    const instance = new StampedTemplate(template, {x: 'Hello world'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`Hello world`)
  })
  it('can render into partial text nodes', () => {
    const template = document.createElement('template')
    const originalHTML = `Hello {{x}}!`
    template.innerHTML = originalHTML
    const instance = new StampedTemplate(template, {x: 'world'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`Hello world!`)
  })
  it('can render nested text nodes', () => {
    const template = document.createElement('template')
    const originalHTML = '<div><div>Hello {{x}}!</div></div>'
    template.innerHTML = originalHTML
    const instance = new StampedTemplate(template, {x: 'world'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div><div>Hello world!</div></div>`)
  })
  it('applies data to templated attributes', () => {
    const template = document.createElement('template')
    const originalHTML = `<div class="{{y}}"></div>`
    template.innerHTML = originalHTML
    const instance = new StampedTemplate(template, {y: 'foo'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div class="foo"></div>`)
  })
  it('can render into partial attribute nodes', () => {
    const template = document.createElement('template')
    const originalHTML = `<div class="my-{{y}}-state"></div>`
    template.innerHTML = originalHTML
    const instance = new StampedTemplate(template, {y: 'foo'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div class="my-foo-state"></div>`)
  })
  it('can render into many values', () => {
    const template = document.createElement('template')
    const originalHTML = `<div class="my-{{x}}-state {{y}}">{{z}}</div>`
    template.innerHTML = originalHTML
    const instance = new StampedTemplate(template, {x: 'foo', y: 'bar', z: 'baz'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div class="my-foo-state bar">baz</div>`)
  })
  it('it allows spaces inside template part identifiers', () => {
    const template = document.createElement('template')
    const originalHTML = `<div class="my-{{ x }}-state {{ y }}">{{         z          }}</div>`
    template.innerHTML = originalHTML
    const instance = new StampedTemplate(template, {x: 'foo', y: 'bar', z: 'baz'})
    expect(template.innerHTML).to.equal(originalHTML)
    const root = document.createElement('div')
    root.appendChild(instance)
    expect(root.innerHTML).to.equal(`<div class="my-foo-state bar">baz</div>`)
  })
  it('never writes mustache syntax into an instantiated template even if no state given', () => {
    const template = document.createElement('template')
    const originalHTML = `<div class="my-{{ x }}-state {{ y }}">{{ z }}</div>`
    template.innerHTML = originalHTML
    const instance = new StampedTemplate(template, {a: 'foo', b: 'bar', c: 'baz'}, () => null)
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
      const instance = new StampedTemplate(template, {x: 'foo', y: 'bar', z: 'baz'})
      expect(template.innerHTML).to.equal(originalHTML)
      const root = document.createElement('div')
      root.appendChild(instance)
      expect(root.innerHTML).to.equal(`<div class="my-foo-state bar">baz</div>`)
      instance.update({x: 'bing', y: 'bong', z: 'quux'})
      expect(root.innerHTML).to.equal(`<div class="my-bing-state bong">quux</div>`)
    })

    it('allows attributes to be toggled on and off', () => {
      const template = document.createElement('template')
      template.innerHTML = `<div hidden="{{ hidden }}"></div>`
      const instance = new StampedTemplate(template, {hidden: true}, propertyIdentityOrBooleanAttribute)
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
      const instance = new StampedTemplate(template, {hidden: false}, propertyIdentityOrBooleanAttribute)
      const root = document.createElement('div')
      root.appendChild(instance)
      expect(root.innerHTML).to.equal(`<div></div>`)
      instance.update({hidden: true})
      expect(root.innerHTML).to.equal(`<div hidden=""></div>`)
      instance.update({hidden: false})
      expect(root.innerHTML).to.equal(`<div></div>`)
    })
  })
})
