import Ember from 'ember';

export function digitGroupFormat([x]/*, hash*/) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Ember.Helper.helper(digitGroupFormat);
