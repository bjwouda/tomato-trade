import Ember from 'ember';

export default Ember.Component.extend({
  state: Ember.computed("offer.state", function() {
    let state = this.get("offer.state");
    
    // Chop the tail end off recalled offers so we can properly localize their state.
    return state.split(/[ -]+/)[0];
  })
});
