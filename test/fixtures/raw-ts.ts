import Service, { service } from '@ember/service';
import type Store from '@ember-data/store';

export class ExampleService extends Service {
  @service('store')
  declare store: Store;

  property = true;

   ask(): string {
    return 'hello world'
  }
}