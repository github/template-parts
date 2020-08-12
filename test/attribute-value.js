import {AttributeValueSetter, AttributeTemplatePart} from '../lib/attribute-template-part.js'

describe('AttributeValue', () => {
  it('updates the given attribute from partList when updateParent is called', () => {
    const attr = document.createAttribute('class')
    const instance = new AttributeValueSetter(document.createElement('div'), attr)
    const part = new AttributeTemplatePart(instance)
    part.value = 'foo'
    instance.partList = [part]
    instance.updateParent()
    expect(attr.value).to.equal('foo')
  })
})

describe('AttributeTemplatePart', () => {
  it('updates the AttributeValue which updates the Attr whenever it receives a new value', () => {
    const attr = document.createAttribute('class')
    const instance = new AttributeValueSetter(document.createElement('div'), attr)
    instance.partList = [new AttributeTemplatePart(instance), new AttributeTemplatePart(instance)]
    instance.partList[0].value = 'hello'
    instance.partList[1].value = ' world'
    expect(attr.value).to.equal('hello world')
    instance.partList[0].value = 'goodbye'
    expect(attr.value).to.equal('goodbye world')
  })
})
