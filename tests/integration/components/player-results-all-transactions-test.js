import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('player-results-all-transactions', 'Integration | Component | player results all transactions', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{player-results-all-transactions}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#player-results-all-transactions}}
      template block text
    {{/player-results-all-transactions}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
