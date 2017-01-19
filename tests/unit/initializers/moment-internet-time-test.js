import Ember from 'ember';
import MomentInternetTimeInitializer from 'tomato/initializers/moment-internet-time';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | moment internet time', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  MomentInternetTimeInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
