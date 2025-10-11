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
}