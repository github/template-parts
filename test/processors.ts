import {expect} from '@open-wc/testing'
import {TemplateInstance} from '../src/template-instance'
import {InnerTemplatePart} from '../src/inner-template-part'
import type {TemplateTypeInit} from '../src/types'
import {createProcessor} from '../src/processors'
describe('createProcessor', () => {
  let calls = 0
  let processor: TemplateTypeInit
  let template: HTMLTemplateElement
  const originalHTML = `Hello {{x}}!`
  beforeEach(() => {
    calls = 0
    processor = createProcessor(() => (calls += 1))
    template = document.createElement('template')
    template.innerHTML = originalHTML
  })

  it('creates a processor calling the given function when the param exists', () => {
    const instance = new TemplateInstance(template, {x: 'world'}, processor)
    expect(calls).to.eql(1)
    instance.update({x: 'foo'})
    expect(calls).to.eql(2)
    instance.update({})
    expect(calls).to.eql(2)
  })

  it('does not process parts with no param for the expression', () => {
    const instance = new TemplateInstance(template, {}, processor)
    expect(calls).to.eql(0)
    instance.update({y: 'world'})
    expect(calls).to.eql(0)
  })

  describe('handling InnerTemplatePart', () => {
    beforeEach(() => {
      processor = createProcessor(part => {
        if (part instanceof InnerTemplatePart) calls += 1
      })
    })

    it('detects InnerTemplatePart instances with <template> element', () => {
      template.innerHTML = '<template directive="if" expression="x">{{x}}</template>'
      new TemplateInstance(template, {x: true}, processor)
      expect(calls).to.eql(1)
    })

    it('does not detect InnerTemplatePart instances without <template> element', () => {
      new TemplateInstance(template, {x: true}, processor)
      expect(calls).to.eql(0)
    })
  })
})
