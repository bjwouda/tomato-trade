import Ember from 'ember';

export function digitFormat(params/*, hash*/) {
  return parseFloat(Math.round(params[0] * 100) / 100).toFixed(2);;
}

export default Ember.Helper.helper(digitFormat);
