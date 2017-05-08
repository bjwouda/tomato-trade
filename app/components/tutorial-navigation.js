import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  
  tutorialState: Ember.inject.service(),
  
  actions: {
    recedeTutorialState(tutorial, amount) {
      this.get("tutorialState").recedeTutorialState(tutorial, amount);
    },
    
    advanceTutorialState(tutorial, amount) {
      this.get("tutorialState").advanceTutorialState(tutorial, amount);
    }
  }
});
