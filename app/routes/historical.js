import Ember from 'ember';

import _ from 'lodash/lodash';

export default Ember.Route.extend({
  i18n: Ember.inject.service(),
  
  title: function() {
    return this.get("i18n").t("index.title");
  },
  
  game: null,
  
  model(p) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.store.find('game', p.game_id).then((game) => {
        this.set('game', game);
        
        game.get('offers').then(() => {
          return this.get('store').query('history', {
            orderBy: "historyGame",
            equalTo: p.game_id
          }).then((history) => {
            let offerIds = history.map(x => x.get("offerId"));
            sessionStorage["allObjIds"] = JSON.stringify(_.uniq(offerIds).sort());

            resolve(history);
          });
        });
      });
    });
  },
  
  setupController: function(controller, model) {
    this._super(controller, model);
    
    controller.set('game', this.get('game'));
  }
});
