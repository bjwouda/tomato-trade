import Ember from 'ember';
import OfferActionsMixin from 'tomato/mixins/offer-actions';
import { module, test } from 'qunit';

module('Unit | Mixin | offer actions');

// Replace this with your real tests.
test('it works', function(assert) {
  let OfferActionsObject = Ember.Object.extend(OfferActionsMixin);
  let subject = OfferActionsObject.create();
  assert.ok(subject);
});
