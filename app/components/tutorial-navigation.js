import Ember from 'ember';

import TutorialActions from '../mixins/tutorial-actions';

import { tutorialState } from '../helpers/tutorial-state';

import { EKMixin, EKOnInsertMixin } from 'ember-keyboard';
import { keyPress } from 'ember-keyboard';

export default Ember.Component.extend(TutorialActions, EKMixin, EKOnInsertMixin, {
  tagName: "",
  
  leftArrowKeyPress: Ember.on(keyPress("ArrowLeft"), function() {
    // Duplicates controller logic, but what are you gonna do...
    let tutorial = this.get("tutorial");
    let previous = this.get("previous");
    
    if(previous !== null) {
      if(typeof previous !== 'undefined') {
        let state = tutorialState([tutorial, previous]);
        
        this.send("changeTutorialState", tutorial, state);
      }
      else {
        this.send("recedeTutorialState", tutorial);
      }
    }
  }),
  
  rightArrowKeyPress: Ember.on(keyPress("ArrowRight"), function() {
    // Duplicates controller logic, but what are you gonna do...
    let tutorial = this.get("tutorial");
    let next = this.get("next");
    
    if(next !== null) {
      if(typeof next !== 'undefined') {
        let state = tutorialState([tutorial, next]);
        
        this.send("changeTutorialState", tutorial, state);
      }
      else {
        this.send("advanceTutorialState", tutorial);
      }
    }
  })
});
