import Ember from 'ember';

import TableUtilities from "../mixins/table-utilities";

export default Ember.Controller.extend(TableUtilities, {
  columns: Ember.computed("i18n.locale", function() {
    return [
      {
        "propertyName": "gameName",
        "title": this.localize("index.name"),
        "template": "custom/game-link-cell"
      },
      {
        "propertyName": "ts",
        "title": this.localize("index.date"),
        "template": "custom/moment-date-time-column",
        
        // Sort on descending moment of creation by default, so new games are at the top of the list.
        "sortPrecedence": 1000,
        "sortDirection": "desc"
      },
      {
        "propertyName": "id",
        "title": this.localize("index.id"),
        "template": "custom/game-link-cell"
      },
      {
        "title": this.localize("index.remove"),
        "template": "custom/game-remove-cell"
      }
    ];
  }),
  
  actions: {
    addGame() {
      let gameName;
      
      do {
        gameName = prompt(this.localize("index.prompt"));
        
        if(gameName === null) {
          return;
        }
      }
      while(!gameName);
      
      this.store.createRecord('game', { gameName }).save();
    },
    
    removeGame(game) {
      game.set("_aboutToDelete", true);
    },
    
    confirmRemoveGame(game) {
      game.destroyRecord();
    },
    
    cancelRemoveGame(game) {
      game.set("_aboutToDelete", false);
    }
  }
});
