import {expect} from '@open-wc/testing'
import {AttributeValueSetter, AttributeTemplatePart} from '../src/attribute-template-part'

describe('AttributeValue', () => {
  it('updates the given attribute from partList when updateParent is called', () => {
    const el = document.createElement('div')
    const attr = document.createAttribute('class')
    const instance = new AttributeValueSetter(el, attr)
    const part = new AttributeTemplatePart(instance, '')
    part.value = 'foo'
    instance.partList = [part]
    instance.updateParent('')
    expect(el.getAttribute('class')).to.equal('foo')
  })
})

describe('AttributeTemplatePart', () => {
  it('updates the AttributeValue which updates the Attr whenever it receives a new value', () => {
    const el = document.createElement('div')
    const attr = document.createAttribute('class')
    const instance = new AttributeValueSetter(el, attr)
    instance.partList = [new AttributeTemplatePart(instance, 'x'), new AttributeTemplatePart(instance, 'x')]
    ;(instance.partList[0] as AttributeTemplatePart).value = 'hello'
    ;(instance.partList[1] as AttributeTemplatePart).value = ' world'
    expect(el.getAttribute('class')).to.equal('hello world')
    ;(instance.partList[0] as AttributeTemplatePart).value = 'goodbye'
    expect(el.getAttribute('class')).to.equal('goodbye world')
  })
})
