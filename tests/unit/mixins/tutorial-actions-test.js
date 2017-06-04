import Ember from 'ember';
import TutorialActionsMixin from 'tomato/mixins/tutorial-actions';
import { module, test } from 'qunit';

module('Unit | Mixin | tutorial actions');

// Replace this with your real tests.
test('it works', function(assert) {
  let TutorialActionsObject = Ember.Object.extend(TutorialActionsMixin);
  let subject = TutorialActionsObject.create();
  assert.ok(subject);
});
