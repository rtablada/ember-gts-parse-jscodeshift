/**
 * Example test demonstrating how to write custom tests
 * for GJS/GTS transformations
 */
import { describe, it, expect } from 'vitest';
import { glimmerCodeshift, EmberParser } from '../src/index.js';
import jscodeshift from 'jscodeshift';

describe('Example: Custom Transformation Tests', () => {
  const parser = new EmberParser('ts');
  const j = glimmerCodeshift(jscodeshift, parser);

  it('should rename a class in a GJS file', () => {
    const source = `
      import Component from '@glimmer/component';
      
      export default class OldName extends Component {
        <template>
          <div>Hello World</div>
        </template>
      }
    `;

    // Parse the source
    const root = j(source);

    // Find and rename the class
    root.find(j.ClassDeclaration).forEach((path) => {
      path.node.id.name = 'NewName';
    });

    // Get the transformed code
    const output = root.toSource();

    // Assert the transformation worked
    expect(output).toContain('NewName');
    expect(output).not.toContain('OldName');
    // Verify template is preserved
    expect(output).toContain('<template>');
    expect(output).toContain('Hello World');
  });

  it('should add a tracked property to a component', () => {
    const source = `
      import Component from '@glimmer/component';
      
      export default class MyComponent extends Component {
        <template>
          <div>{{this.count}}</div>
        </template>
      }
    `;

    const root = j(source);

    // Add import for tracked
    const trackedImport = j.importDeclaration(
      [j.importSpecifier(j.identifier('tracked'))],
      j.literal('@glimmer/tracking'),
    );
    root.find(j.Program).get('body', 0).insertBefore(trackedImport);

    // Add tracked property
    root.find(j.ClassBody).forEach((path) => {
      const trackedProperty = j.classProperty(
        j.identifier('count'),
        j.numericLiteral(0),
      );
      trackedProperty.decorators = [j.decorator(j.identifier('tracked'))];
      path.node.body.unshift(trackedProperty);
    });

    const output = root.toSource();

    expect(output).toContain("import { tracked } from '@glimmer/tracking'");
    expect(output).toContain('@tracked');
    expect(output).toContain('count = 0');
  });

  it('should add an action method to a component', () => {
    const source = `
      import Component from '@glimmer/component';
      
      export default class MyComponent extends Component {
        <template>
          <button {{on "click" this.increment}}>Click</button>
        </template>
      }
    `;

    const root = j(source);

    // Add import for action
    const actionImport = j.importDeclaration(
      [j.importSpecifier(j.identifier('action'))],
      j.literal('@ember/object'),
    );
    root.find(j.Program).get('body', 0).insertBefore(actionImport);

    // Create the increment method
    const incrementMethod = j.classMethod(
      'method',
      j.identifier('increment'),
      [],
      j.blockStatement([
        j.expressionStatement(
          j.updateExpression(
            '++',
            j.memberExpression(j.thisExpression(), j.identifier('count')),
          ),
        ),
      ]),
    );
    incrementMethod.decorators = [j.decorator(j.identifier('action'))];

    // Add method to class
    root.find(j.ClassBody).forEach((path) => {
      path.node.body.unshift(incrementMethod);
    });

    const output = root.toSource();

    expect(output).toContain("import { action } from '@ember/object'");
    expect(output).toContain('@action');
    expect(output).toContain('increment()');
    expect(output).toContain('this.count++');
  });

  it('should convert a property to use getter syntax', () => {
    const source = `
      import Component from '@glimmer/component';
      
      export default class MyComponent extends Component {
        isActive = true;
        
        <template>
          <div>{{this.isActive}}</div>
        </template>
      }
    `;

    const root = j(source);

    // Find the property and convert to getter
    root
      .find(j.ClassProperty, { key: { name: 'isActive' } })
      .forEach((path) => {
        const getter = j.classMethod(
          'get',
          j.identifier('isActive'),
          [],
          j.blockStatement([j.returnStatement(j.booleanLiteral(true))]),
        );
        j(path).replaceWith(getter);
      });

    const output = root.toSource();

    expect(output).toContain('get isActive()');
    expect(output).toContain('return true');
    expect(output).not.toContain('isActive = true');
  });

  it('should add multiple imports in one transformation', () => {
    const source = `
      import Component from '@glimmer/component';
      
      export default class MyComponent extends Component {
        <template><div>Test</div></template>
      }
    `;

    const root = j(source);

    const importsToAdd = [
      { specifier: 'tracked', source: '@glimmer/tracking' },
      { specifier: 'action', source: '@ember/object' },
      { specifier: 'service', source: '@ember/service' },
    ];

    importsToAdd.forEach(({ specifier, source: importSource }) => {
      const importDecl = j.importDeclaration(
        [j.importSpecifier(j.identifier(specifier))],
        j.literal(importSource),
      );
      root.find(j.Program).get('body', 0).insertBefore(importDecl);
    });

    const output = root.toSource();

    expect(output).toContain("import { tracked } from '@glimmer/tracking'");
    expect(output).toContain("import { action } from '@ember/object'");
    expect(output).toContain("import { service } from '@ember/service'");
  });
});
