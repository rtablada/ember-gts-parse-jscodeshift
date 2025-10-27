import MyButton from './my-button';
import { formatText } from './helpers';

const greeting = 'Hello';
const items = ['one', 'two', 'three'];

<template>
  <div>
    <h1>{{greeting}}</h1>
    <span class={{formatText @className}}>{{@argName}}</span>

    <MyButton @label="Click me" />

    {{#if @condition}}
      <p>{{greeting}} from condition</p>
    {{/if}}

    {{#if items}}
      <div>Has items</div>
    {{else}}
      <div>No items</div>
    {{/if}}

    {{#unless @isHidden}}
      <p>{{greeting}}</p>
    {{/unless}}

    {{#each items as |item|}}
      <li>{{item}}</li>
    {{/each}}

    {{#each @users as |user index|}}
      <div>{{index}}: {{user}}</div>
    {{/each}}

    {{#let greeting as |newVar|}}
      <p>{{newVar}}</p>
    {{/let}}

    {{yield}}
    {{yield greeting}}
    {{yield (hash key=greeting)}}
  </div>
</template>
