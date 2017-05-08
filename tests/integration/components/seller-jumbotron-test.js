import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('seller-jumbotron', 'Integration | Component | seller jumbotron', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{seller-jumbotron}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#seller-jumbotron}}
      template block text
    {{/seller-jumbotron}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
