import Ember from 'ember';
import OfferUtilitiesMixin from 'tomato/mixins/offer-utilities';
import { module, test } from 'qunit';

module('Unit | Mixin | offer utilities');

// Replace this with your real tests.
test('it works', function(assert) {
  let OfferUtilitiesObject = Ember.Object.extend(OfferUtilitiesMixin);
  let subject = OfferUtilitiesObject.create();
  assert.ok(subject);
});
