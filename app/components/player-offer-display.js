import Ember from 'ember';

export default Ember.Component.extend({
  offerState: Ember.computed("offer.state", function() {
    let offerState = this.get("offer.state");
    
    // Guards against a weird bug where sometimes offerState is not yet initialized.
    if(offerState) {
      // Chop the tail end off recalled offers so we can properly localize their state.
      let offerStateParameters = offerState.split(/[ -]+/);
      
      return offerStateParameters[0];
    }
    else {
      // This is nonsense but should be replaced soon as offerState is initialized.
      return "open";
    }
  })
});
