# Ember GTS Codeshift

This package provides a plugin for AST Types as well as a parser for jscodeshift to parse Glimmer templates embedded in GJS and JTS files.

> [!NOTE]
> `ember-template-recast` is used to parse template content of files, however the type strings for AST Nodes have to be prepended with `Glimmer` to avoid conflicts with existing types in `ast-types`.
> For best use, use TypeScript and use the exported `g` object with JSCodeShift and recast comparison operators to find nodes and avoid confusion over the type string differences.

## Installation

```bash
npm install ember-gts-jscodeshift
```

> [!NOTE]
> Due to the way that `ast-types` works, you must install a single version of `ast-types` in your project for this to work correctly.
> To do this, use yarn resolutions or [npm overrides](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides) to force a single version of `ast-types` to be used across all dependencies.

## Usage Codeshift

```ts
import j from 'jscodeshift';
import { EmberParser, g, print } from 'ember-gts-jscodeshift';

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

const parser = new EmberParser();
const emberCodeshift = j.withParser(parser);

const doc = emberCodeshift(fileContents);

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

When working with jscodeshift and `find` methods, you need to pass in a type that the `ast-types` library knows about.
`ember-gts-jscodeshift` registers the necessary types to work with Glimmer templates embedded in GJS and JTS files, and exports the type definitions as the `g` object.
These types are wrapped and redeclared from `ember-template-recast` with a `Glimmer` prefix to avoid conflicts with existing types in `ast-types`.

```ts
import { g } from 'ember-gts-jscodeshift';

doc.find(g.GlimmerTextNode).forEach((element) => {
  if (element.node.chars.trim()) {
    element.node.chars = element.node.chars.toUpperCase();
  }
});
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
