import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('player-results-best-transactions', 'Integration | Component | player results best transactions', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{player-results-best-transactions}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#player-results-best-transactions}}
      template block text
    {{/player-results-best-transactions}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
