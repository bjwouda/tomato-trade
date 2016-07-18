/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'tomato',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',

    firebase: {
      apiKey: "AIzaSyBxB2yDx0LIwExC-pKDlOlN-gxZK83MkYI",
      authDomain: "tomato-37b32.firebaseapp.com",
      databaseURL: "https://tomato-37b32.firebaseio.com",
      storageBucket: "tomato-37b32.appspot.com",
    },

    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  ENV.horizon = {
    host: 'localhost:8181', // where is horizon server found? 
    realTime: ['game', 'history', 'offer', 'user'], // what collections should be real-time (boolean or array)? 
  };

  ENV.i18n = {
    defaultLocale: 'en'
  };

  ENV.moment = {
    // includeLocales: ['en', 'nl'],
    includeLocales: true
  };

  return ENV;
};
