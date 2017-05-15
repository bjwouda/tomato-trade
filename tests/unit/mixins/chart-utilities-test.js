import Ember from 'ember';
import ChartUtilitiesMixin from 'tomato/mixins/chart-utilities';
import { module, test } from 'qunit';

module('Unit | Mixin | chart utilities');

// Replace this with your real tests.
test('it works', function(assert) {
  let ChartUtilitiesObject = Ember.Object.extend(ChartUtilitiesMixin);
  let subject = ChartUtilitiesObject.create();
  assert.ok(subject);
});
