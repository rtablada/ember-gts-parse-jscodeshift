import { service } from '@ember/service';
import Component from '@glimmer/component';
import type Store from '@ember-data/store';

export class ExampleComponent extends Component {
  @service('store')
  declare store: Store;

  property = true;

   ask(): string {
    return 'hello world'
  }

  <template>
    <h2>My Component</h2>
  </template>
}