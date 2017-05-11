import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tutorial-outside-range', 'Integration | Component | tutorial outside range', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{tutorial-outside-range}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#tutorial-outside-range}}
      template block text
    {{/tutorial-outside-range}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
