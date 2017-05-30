import _ from 'lodash/lodash';

export default function(locale, key, context) {
  var values = Object.keys(context).map(function(key) { return context[key]; });
  console.warn(`Missing translation LOCALE: ${locale} KEY: ${key}`);
  return _.startCase(key).toLowerCase() + (values.join(', '));
}