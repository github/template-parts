import {AttributeValueSetter, AttributeValuePart} from '../lib/attribute-value.js'

describe('AttributeValue', () => {
  it('updates the given attribute when it recieves a new value', () => {
    const attr = document.createAttribute('class')
    const instance = new AttributeValueSetter(attr)
    expect(attr.value).to.equal('')
    instance.value = 'foo'
    expect(attr.value).to.equal('foo')
  })
  it('updates the given attribute from partList when updateParent is called', () => {
    const attr = document.createAttribute('class')
    const instance = new AttributeValueSetter(attr)
    instance.partList = [new AttributeValuePart(instance, 'foo')]
    instance.updateParent()
    expect(attr.value).to.equal('foo')
  })
})

describe('AttributeValuePart', () => {
  it('updates the AttributeValue which updates the Attr whenever it receives a new value', () => {
    const attr = document.createAttribute('class')
    const instance = new AttributeValueSetter(attr)
    instance.partList = [new AttributeValuePart(instance, 'hello'), new AttributeValuePart(instance, ' world')]
    instance.updateParent()
    expect(attr.value).to.equal('hello world')
    instance.partList[0].value = 'goodbye'
    expect(attr.value).to.equal('goodbye world')
  })
  it('appends a new node to the existing AttributeValue when split() is called', () => {
    const attr = document.createAttribute('class')
    const instance = new AttributeValueSetter(attr)
    instance.partList = [new AttributeValuePart(instance, 'hello world')]
    instance.partList[0].split('5')
    expect(instance.partList).to.have.lengthOf(2)
    expect(instance.partList[0]).to.be.an.instanceof(AttributeValuePart).with.property('value', 'hello')
    expect(instance.partList[1]).to.be.an.instanceof(AttributeValuePart).with.property('value', ' world')
  })
})
