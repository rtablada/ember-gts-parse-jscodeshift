export const MyComponent = <template>
  <div>
    <h1>{{@title}}</h1>
    <span class={{@className}}>{{@argName}}</span>

    {{#if @condition}}
      <p>Condition is true</p>
    {{/if}}

    {{#if @showContent}}
      <div>Content shown</div>
    {{else}}
      <div>Content hidden</div>
    {{/if}}

    {{#unless @isHidden}}
      <p>Not hidden</p>
    {{/unless}}

    {{#each @items as |item|}}
      <li>{{item}}</li>
    {{/each}}

    {{#each @users as |user index|}}
      <div>{{index}}: {{user}}</div>
    {{/each}}

    {{#let @value as |localVar|}}
      <p>{{localVar}}</p>
    {{/let}}

    {{yield}}
    {{yield @data}}
    {{yield (hash key=@value)}}
  </div>
</template>
