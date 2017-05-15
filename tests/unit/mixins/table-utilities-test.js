import Ember from 'ember';
import TableUtilitiesMixin from 'tomato/mixins/table-utilities';
import { module, test } from 'qunit';

module('Unit | Mixin | table utilities');

// Replace this with your real tests.
test('it works', function(assert) {
  let TableUtilitiesObject = Ember.Object.extend(TableUtilitiesMixin);
  let subject = TableUtilitiesObject.create();
  assert.ok(subject);
});
