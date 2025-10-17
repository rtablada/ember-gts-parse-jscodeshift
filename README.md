# Glimmer Jscodeshift

This package provides a plugin for AST Types as well as a parser for jscodeshift to parse GJS and JTS files including their embedded templates.

> [!NOTE]
> `ember-template-recast` is used to parse template content of files, however the type strings for AST Nodes have to be prepended with `Glimmer` to avoid conflicts with existing types in `ast-types`.
> For best use, use TypeScript and use the exported `g` object with JSCodeShift and recast comparison operators to find nodes and avoid confusion over the type string differences.

## Installation

```bash
pnpm install -D ember-gts-jscodeshift
```

## Usage In Programatic JSCodeShift Scripts

```ts
import j from 'jscodeshift';
import { glimmerCodeshift, print } from 'ember-gts-jscodeshift';

const fileContents = `
import { service } from '@ember/service';
import Component from '@glimmer/component';

export class ExampleComponent extends Component {
  @service('store') store;
  property = true;

   ask() {
    return 'hello world'
  }

  <template>
<h2>My Component</h2>
  </template>
}`;

const g = glimmerCodeshift(j);

const doc = g(fileContents);

doc.find(g.GlimmerTextNode).forEach((element) => {
  if (element.node.chars.trim()) {
    element.node.chars = element.node.chars.toUpperCase();
  }
});

console.log(print(doc));
```

### Ember Parser

The `EmberParser` class declares a `parse` method that jscodeshift can use to parse file contents.
When calling `new`, there is an optional argument to pass a different jscodeshift parser which will be used to parse the non-template parts of the GTS/GJS file.
When omitted, this will use the default parser from jscodeshift.

```ts
// Example using the babylon parser instead of ts
import { EmberParser } from 'ember-gts-jscodeshift';

const parser = new EmberParser('babylon');
```

### AST Types

When working with the `ast-types` package, you need to be able to setup the proper def calls for the local instance of ast-types used by recast or jscodeshift.
This package exports a `GlimmerPlugin` function that will add defs to an `ast-types` registry and return typed named nodes for Glimmer templates.

```ts
import { EmberParser } from 'ember-gts-jscodeshift';
import { use } from 'ast-types';

const glimmerTypes = use(GlimmerPlugin);
```

You can see the full list of available nodes in the [named-types.ts](./src/def/named-types.ts) file.

### Print

Since this mixes AST node types from raw JS recast and `ember-template-recast`, using `.toSource()` on the jscodeshift collection will not work as expected.
This package exports a `print` function that can be used to print the modified AST back to source code.

```ts
import { print } from 'ember-gts-jscodeshift';

// doc is a jscodeshift collection or recast node
console.log(print(doc));
```
