import Ember from 'ember';
import GameConfigParserMixin from 'tomato/mixins/game-config-parser';
import { module, test } from 'qunit';

module('Unit | Mixin | game config parser');

// Replace this with your real tests.
test('it works', function(assert) {
  let GameConfigParserObject = Ember.Object.extend(GameConfigParserMixin);
  let subject = GameConfigParserObject.create();
  assert.ok(subject);
});
