import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('player', { path: '/player/:player_id' });
  this.route('games', { path: '/game/:game_id' });
  this.route('historical', { path: '/game/:game_id/history' });
});

export default Router;
