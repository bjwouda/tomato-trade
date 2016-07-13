import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('player', { path: '/player/:player_id' });
  this.route('historical');
  this.route('games', { path: '/game/:game_id' });
});

export default Router;
