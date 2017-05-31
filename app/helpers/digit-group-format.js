import Ember from 'ember';

export function digitGroupFormat([x] /*, hash*/ ) {
  try {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } catch (err) {
    return "NaN";
  }
}

export default Ember.Helper.helper(digitGroupFormat);
