import Ember from 'ember';
import LogFunctionsMixin from 'tomato/mixins/log-functions';
import { module, test } from 'qunit';

module('Unit | Mixin | log functions');

// Replace this with your real tests.
test('it works', function(assert) {
  let LogFunctionsObject = Ember.Object.extend(LogFunctionsMixin);
  let subject = LogFunctionsObject.create();
  assert.ok(subject);
});
