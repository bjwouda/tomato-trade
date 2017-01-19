import Ember from 'ember';

import _ from 'lodash/lodash';

export default Ember.Route.extend({
    model(p) {
        return new Promise((resolve, reject) => {
            this.store.find('game', p.game_id).then((game) => {
                game.get("offers").then(() => {

                    return this.get('store').query('history', {
                        orderBy: "historyGame",
                        equalTo: p.game_id
                    }).then((history) => {
                    	let offerIds = history.map( x=>x.get("offerId") )
                    	sessionStorage["allObjIds"] = JSON.stringify( _.uniq(offerIds).sort() )

                        resolve(history)
                    });
                })
            })
        })
    },

});
