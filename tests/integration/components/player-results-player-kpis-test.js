import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('player-results-player-kpis', 'Integration | Component | player results player kpis', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{player-results-player-kpis}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#player-results-player-kpis}}
      template block text
    {{/player-results-player-kpis}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
