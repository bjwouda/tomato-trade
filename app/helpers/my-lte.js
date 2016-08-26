import Ember from 'ember';

export function myLte([a, b]/*, hash*/) {
  return +a <= +b;
}

export default Ember.Helper.helper(myLte);
