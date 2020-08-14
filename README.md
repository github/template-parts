# Template Parts

This library is designed as a "ponyfill" library that implements the design in the [TemplateInstance proposed whatwg spec][spec] that has been proposed in order to address [whatwg/html#2254](https://github.com/whatwg/html/issues/2254).

[spec]: https://github.com/w3c/webcomponents/blob/159b1600bab02fe9cd794825440a98537d53b389/proposals/Template-Instantiation.md

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
import {TemplateInstance} from '@github/template-parts'

const tpl = new TemplateInstance(document.getElementById('some-template'), { x: 'Hello', y: 'bar'})

document.appendChild(tpl)
```

A `TemplateInstance` instance is a subclass of `DocumentFragment` - containing the cloned contents of the template. It also has an `update(params: unknown): void` method - which when called will run the given "processor", with the new `params`.

This library has a default "processor": `propertyIdentity` which implements basic functionality of applying the params object values to the Template Parts (it is effectively `part.value = params[part.expression]`)

In addition, there is a `propertyIdentityOrBooleanAttribute` export which adds the capability of toggling `boolean` style attributes like `hidden` or `input.required`.

To use the `propertyIdentityOrBooleanAttribute`, import it and pass it as a third argument to the `TemplateInstance` constructor:


```js
import {TemplateInstance, propertyIdentityOrBooleanAttribute} from '@github/template-parts'

// This will simply replace `{{x}}` with `"Hello"` and `{{y}}` with `"bar"`
const tpl = new StampedTemplate(document.getElementById('foo'), { x: 'Hello', y: 'bar'})

// The `propertyIdentityOrBooleanAttribute` processor will check for `false`/`true` values which map to Template Part values that are assigned to attributes, and add/remove the attribute.
const tpl = new StampedTemplate(document.getElementById('foo'), propertyIdentityOrBooleanAttribute, { x: 'Hello', hidden: false})
```
