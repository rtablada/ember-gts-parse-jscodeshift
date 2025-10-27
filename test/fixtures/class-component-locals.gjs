import Component from '@glimmer/component';
import MyButton from './my-button';
import { formatText } from './helpers';

export default class MyComponent extends Component {
  greeting = 'Hello';
  items = ['one', 'two', 'three'];

  <template>
    <div>
      <h1>{{this.greeting}}</h1>
      <span class={{formatText this.greeting}}>{{@argName}}</span>

      <MyButton @label="Click me" />

      {{#if @condition}}
        <p>{{this.greeting}} from condition</p>
      {{/if}}

      {{#if this.items}}
        <div>Has items</div>
      {{else}}
        <div>No items</div>
      {{/if}}

      {{#unless @isHidden}}
        <p>{{this.greeting}}</p>
      {{/unless}}

      {{#each this.items as |item|}}
        <li>{{item}}</li>
      {{/each}}

      {{#each @users as |user index|}}
        <div>{{index}}: {{user}}</div>
      {{/each}}

      {{#let this.greeting as |localVar|}}
        <p>{{localVar}}</p>
      {{/let}}

      {{yield}}
      {{yield this.greeting}}
      {{yield (hash key=this.greeting)}}
    </div>
  </template>
}
