import Ember from 'ember';
import LangActionsMixin from 'tomato/mixins/lang-actions';
import { module, test } from 'qunit';

module('Unit | Mixin | lang actions');

// Replace this with your real tests.
test('it works', function(assert) {
  let LangActionsObject = Ember.Object.extend(LangActionsMixin);
  let subject = LangActionsObject.create();
  assert.ok(subject);
});
