import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { helper } from '@ember/component/helper';
import { modifier } from 'ember-modifier';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';

// Helper function examples
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

const uppercase = helper(([text]) => text?.toUpperCase());

// Modifier example
const autofocus = modifier((element) => {
  element.focus();
});

/**
 * A comprehensive GJS component demonstrating all major node types
 * including HBS template features and JavaScript/Ember constructs
 */
export default class CompleteExample extends Component {
  // Service injection
  @service router;
  @service store;

  // Tracked properties
  @tracked count = 0;
  @tracked showDetails = false;
  @tracked items = ['apple', 'banana', 'cherry'];
  @tracked user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    preferences: {
      theme: 'dark',
      notifications: true
    }
  };

  // Getters (computed properties)
  get doubleCount() {
    return this.count * 2;
  }

  get hasItems() {
    return this.items.length > 0;
  }

  get isAdmin() {
    return this.user.role === 'admin';
  }

  // Actions
  @action
  increment() {
    this.count++;
  }

  @action
  decrement() {
    this.count--;
  }

  @action
  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  @action
  addItem(item) {
    this.items = [...this.items, item];
  }

  @action
  removeItem(index) {
    this.items = this.items.filter((_, i) => i !== index);
  }

  @action
  handleSubmit(event) {
    event.preventDefault();
    console.log('Form submitted');
  }

  @action
  logMessage(message) {
    console.log(message);
  }

  // Template
  <template>
    {{! Standard HTML elements }}
    <div class="complete-example" data-test-complete-example>
      <header>
        <h1>Complete GJS Example</h1>
        <p>Testing all HBS and JS node types</p>
      </header>

      {{! Text interpolation - MustacheStatement }}
      <section class="interpolation">
        <h2>Text Interpolation</h2>
        <p>Count: {{this.count}}</p>
        <p>Double Count: {{this.doubleCount}}</p>
        <p>User Name: {{this.user.name}}</p>
        <p>Theme: {{this.user.preferences.theme}}</p>
      </section>

      {{! HTML attributes with dynamic values }}
      <section class="attributes">
        <h2>Dynamic Attributes</h2>
        <div
          class="box {{if this.isAdmin 'admin' 'user'}}"
          data-count={{this.count}}
          id="box-{{this.count}}"
          aria-expanded={{this.showDetails}}
          ...attributes
        >
          Content with dynamic attributes
        </div>
      </section>

      {{! Conditional rendering - BlockStatement with 'if' }}
      <section class="conditionals">
        <h2>Conditional Rendering</h2>
        
        {{#if this.showDetails}}
          <div class="details">
            <p>Details are visible!</p>
            <p>Count is: {{this.count}}</p>
          </div>
        {{else}}
          <p>Details are hidden</p>
        {{/if}}

        {{! Inline if helper }}
        <p>Status: {{if this.isAdmin "Administrator" "Regular User"}}</p>

        {{! unless helper }}
        {{#unless this.hasItems}}
          <p>No items available</p>
        {{/unless}}
      </section>

      {{! List rendering - BlockStatement with 'each' }}
      <section class="lists">
        <h2>List Rendering</h2>
        
        {{#each this.items as |item index|}}
          <div class="item" data-index={{index}}>
            <span>{{index}}: {{item}}</span>
            <button type="button" {{on "click" (fn this.removeItem index)}}>
              Remove
            </button>
          </div>
        {{else}}
          <p>No items in the list</p>
        {{/each}}

        {{! Nested each }}
        {{#each this.items as |item|}}
          <div>
            {{#each (array "small" "medium" "large") as |size|}}
              <span>{{item}} - {{size}}</span>
            {{/each}}
          </div>
        {{/each}}
      </section>

      {{! Event handling }}
      <section class="events">
        <h2>Event Handling</h2>
        
        <button type="button" {{on "click" this.increment}}>
          Increment
        </button>
        
        <button type="button" {{on "click" this.decrement}}>
          Decrement
        </button>
        
        <button type="button" {{on "click" this.toggleDetails}}>
          Toggle Details
        </button>

        {{! Event with fn helper }}
        <button type="button" {{on "click" (fn this.logMessage "Hello World")}}>
          Log Message
        </button>

        {{! Multiple event modifiers }}
        <button
          type="button"
          {{on "click" this.increment}}
          {{on "dblclick" this.toggleDetails}}
        >
          Multi-event Button
        </button>
      </section>

      {{! Form elements }}
      <section class="forms">
        <h2>Forms</h2>
        
        <form {{on "submit" this.handleSubmit}}>
          <label>
            Text Input:
            <input type="text" value={{this.user.name}} />
          </label>

          <label>
            Email:
            <input type="email" value={{this.user.email}} />
          </label>

          <label>
            Checkbox:
            <input type="checkbox" checked={{this.user.preferences.notifications}} />
          </label>

          <label>
            Select:
            <select>
              <option value="light" selected={{eq this.user.preferences.theme "light"}}>
                Light
              </option>
              <option value="dark" selected={{eq this.user.preferences.theme "dark"}}>
                Dark
              </option>
            </select>
          </label>

          <button type="submit">Submit</button>
        </form>
      </section>

      {{! Built-in helpers }}
      <section class="helpers">
        <h2>Built-in Helpers</h2>
        
        {{! Concatenation }}
        <p>{{concat "Count: " this.count}}</p>
        
        {{! Array helper }}
        {{#each (array "one" "two" "three") as |num|}}
          <span>{{num}}</span>
        {{/each}}

        {{! Hash helper }}
        {{#let (hash name="Jane" age=30) as |person|}}
          <p>{{person.name}} is {{person.age}} years old</p>
        {{/let}}

        {{! Comparison helpers }}
        <p>Equal: {{eq this.count 5}}</p>
        <p>Not Equal: {{not-eq this.count 0}}</p>
        <p>Greater Than: {{gt this.count 10}}</p>
        <p>Less Than: {{lt this.count 100}}</p>

        {{! Logical helpers }}
        <p>And: {{and this.hasItems this.isAdmin}}</p>
        <p>Or: {{or this.showDetails this.hasItems}}</p>
        <p>Not: {{not this.showDetails}}</p>
      </section>

      {{! let helper for local variables }}
      <section class="local-vars">
        <h2>Local Variables</h2>
        
        {{#let this.count as |localCount|}}
          <p>Local count: {{localCount}}</p>
          <p>Double: {{localCount}} * 2 = {{multiply localCount 2}}</p>
        {{/let}}

        {{! Multiple let bindings }}
        {{#let this.user.name this.user.email as |userName userEmail|}}
          <p>Name: {{userName}}</p>
          <p>Email: {{userEmail}}</p>
        {{/let}}
      </section>

      {{! Custom helpers }}
      <section class="custom-helpers">
        <h2>Custom Helpers</h2>
        <p>Uppercase: {{uppercase this.user.name}}</p>
      </section>

      {{! Modifiers }}
      <section class="modifiers">
        <h2>Modifiers</h2>
        <input type="text" {{autofocus}} placeholder="Auto-focused input" />
      </section>

      {{! Component invocation (self-referential for example) }}
      <section class="components">
        <h2>Component Invocation</h2>
        {{! This would normally invoke other components }}
        <div class="component-placeholder">
          Component invocation would go here
        </div>
      </section>

      {{! Comments }}
      <section class="comments">
        <h2>Comments</h2>
        {{! This is a Handlebars comment }}
        {{!-- This is a Handlebars block comment --}}
        <!-- This is an HTML comment -->
      </section>

      {{! Special characters and escaping }}
      <section class="escaping">
        <h2>Special Characters</h2>
        <p>Escaped: {{{this.user.name}}}</p>
        <p>HTML entities: &lt;div&gt;</p>
      </section>

      {{! Yield (for component composition) }}
      {{yield}}

      {{! Named blocks }}
      {{yield to="header"}}
      {{yield to="footer"}}

      <footer>
        <p>&copy; 2025 Complete Example</p>
      </footer>
    </div>
  </template>
}

// Additional exports for testing
export class AnotherComponent extends Component {
  <template>
    <div>Another component</div>
  </template>
}

export const SimpleComponent = <template>
  <div class="simple">Simple template-only component</div>
</template>;

export const ComponentWithArgs = <template>
  <div>
    <h3>{{@title}}</h3>
    <p>{{@description}}</p>
    {{yield}}
  </div>
</template>;
