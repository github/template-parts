import {expect} from '@open-wc/testing'
import {TemplateInstance} from '../src/template-instance'
import {createProcessor} from '../src/processors'
describe('createProcessor', () => {
  let calls = 0
  let processor
  let template
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
})
