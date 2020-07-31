# Template Parts

This library is designed as a "ponyfill" library that implements the design in the [Template Parts Proposal](https://github.com/domenic/template-parts) that has been sketched out in order to address [whatwg/html#2254](https://github.com/whatwg/html/issues/2254).

This implements the minimally viable parts of the proposal, to provide something that works, but should be easy to drop if the Template Parts Proposal lands.

To reiterate the example in the above proposal, given a template such as:

```
<template id="foo">
  <div class="foo {{y}}">{{x}} world</div>
</template>
```

We'd like `{{x}}` and `{{y}}` to be **template parts**, exposed as JavaScript objects which can be manipulated.

With this library, and that given template, one could implement the following:

```js
import {StampedTemplate} from '@github/template-parts'

const tpl = new StampedTemplate(document.getElementById('foo'), (parts, params) => {
  for (const part of parts) {
    const key = part.expression.trim()
    const value = (key in params ? params[key] : '')
    if (part.attribute) {
      part.value = value
    } else {
      part.replaceWith(value)
    }
  }
}, { x: 'Hello', y: 'bar'})
```

A `StampedTemplate` instance has the `fragment: DocumentFragment` property - the cloned contents of the template - and an `update(params: Record<string, unknown>): void` method - which when called will run the given processor again, with the new `params`.

This library also comes with two ready-to-use processors: `propertyIdentity` and `propertyIdentityOrBooleanAttribute`. These processors implement a basic functionality that will replace expressions with the corresponding property value in the params object. You can use this processors rather than writing a custom one:


```js
import {StampedTemplate, propertyIdentity, propertyIdentityOrBooleanAttribute} from '@github/template-parts'

// This will simply replace `{{x}}` with `"Hello"` and `{{y}}` with `"bar"`
const tpl = new StampedTemplate(document.getElementById('foo'), propertyIdentity, { x: 'Hello', y: 'bar'})

// The `propertyIdentityOrBooleanAttribute` processor will check for `false`/`true` values which map to attribute values, and add/remove the attribute.
const tpl = new StampedTemplate(document.getElementById('foo'), propertyIdentityOrBooleanAttribute, { x: 'Hello', y: false})
```
