import Ember from 'ember';

export default Ember.Mixin.create({
  tutorialState: Ember.inject.service(),
  
  actions: {
    changeTutorialState(tutorial, state) {
      this.get("tutorialState").setTutorialState(tutorial, state);
    },
    
    recedeTutorialState(tutorial) {
      this.get("tutorialState").decrementTutorialState(tutorial);
    },
    
    advanceTutorialState(tutorial) {
      this.get("tutorialState").incrementTutorialState(tutorial);
    }
  }
});
