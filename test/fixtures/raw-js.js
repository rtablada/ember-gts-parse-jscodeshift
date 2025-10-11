import Service, { service } from '@ember/service';

export class ExampleService extends Service {
  @service('store') store;
  property = true;

   ask() {
    return 'hello world'
  }
}