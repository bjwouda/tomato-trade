import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tutorial-list-item', 'Integration | Component | tutorial list item', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{tutorial-list-item}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#tutorial-list-item}}
      template block text
    {{/tutorial-list-item}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
