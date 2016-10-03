import Ember from 'ember';
import _ from 'lodash/lodash';

let fn = function(self, tag) {
  return function(round) {
    let cleanLines = self.get("cleanLines");
    let retailPrice = cleanLines.filter( (x) => { return x.startsWith(tag); } )[0];
    return retailPrice.split(",")[round];
    
  }
}

export default Ember.Mixin.create({
  i18n: Ember.inject.service(),

  gameConfigurationRO: Ember.computed("gameConfiguration", {
    get() {
      return this.get("gameConfiguration");
    },
    set() {
      let val = arguments[1];
      return val.replace(/\t/g, ",");
    }
  }),

  gameConfigurationValid: Ember.computed("gameConfiguration", function() {
    try {
      this.sanityCheck(this.get("gameConfiguration"));
      return true;
    }
    catch(err) {
      return false;
    }
  }),

  gameConfigurationSafe: Ember.computed("gameConfiguration", {
    get() {
      return this.get("gameConfiguration");
    },
    set() {
      let val = arguments[1];
      try {
        this.sanityCheck(val);
        this.set("gameConfiguration", val);
        return val;
      }
      catch(err) {
        alert(err);
      }
    }
  }),

  cleanLines: Ember.computed("gameConfiguration", function() {
    try {
      return this.sanityCheck(this.get("gameConfiguration"));
    }
    catch(err) {
      return [];
    }
  }),

  numberOfPlayers: Ember.computed("cleanLines", function() {
  	let cleanLines = this.get("cleanLines");
    let buyers = cleanLines
    	.filter((x) => { return /^b\d+\b/.test(x); })
    	.map((x) => { return x.split(",")[0]; })
    ;
    let sellers = cleanLines
    	.filter((x) => { return /^s\d+\b/.test(x); })
    	.map((x) => { return x.split(",")[0]; })
    ;
    let allPlayerIds = [].concat(buyers, sellers);

    return { nrOfBuyers: buyers.length, nrOfSellers: sellers.length, allPlayerIds };
  }),

  gameMatrix: Ember.computed("cleanLines", "numberOfPlayers", "numberOfRounds", function() {
    try {
      let cleanLines = this.get("cleanLines");
      let roundArray = this.get("numberOfRounds.gameSegments");
      let allPlayerIds = this.get("numberOfPlayers.allPlayerIds");

      let gameMatrix = roundArray.map((x,i) => {
        let round = i+1;
        let tradeType = x.startsWith("w") ? "weekly" : "daily";
        let tradingFor = /\d+/.exec(x)[0];
        let currentWeek = +tradingFor + (x.startsWith("w") ? -1 : 0);
        
        let roundTitle = "N-A (USE TRANSLATION)" // `#${round} Week: ${currentWeek}: ${tradeType} for Week ${tradingFor}`;
        // currentWeek tradeType tradeWeek
        let playerSettings = allPlayerIds.map( (x)=> { return this.getValueForUserAndRound(cleanLines, x, round); } );
        return { round, roundTitle, playerSettings, tradingFor, tradeType, currentWeek};
      });

      console.log(gameMatrix[0]);
      console.log(gameMatrix);
      return gameMatrix;

    } catch(err) {
      console.warn("there was some error with the game matrix");
      return [];
      
    }

  }),

  numberOfRounds: Ember.computed("cleanLines", function() {
  	let cleanLines = this.get("cleanLines");

    let gameLine = this.getGameLine(cleanLines);
    var gameSegments = gameLine.split(",");
    gameSegments.shift(); // remove first element
    console.log(gameSegments);
    let total = gameSegments.length;
    let weeks = gameSegments.filter((x) => {
      return x.startsWith("w"); }).length;
    let days = gameSegments.filter((x) => {
      return x.startsWith("d"); }).length;
    return { total, weeks, days, gameSegments };
  }),

  getGameLine() {
    let cleanLines = this.get("cleanLines");
    return cleanLines.filter((x) => { return /^game/.test(x); })[0];
  },

  getValueforUserCurrentRound(user, postFix = '') {
    let cleanLines = this.get("cleanLines");
    let roundCnt = this.get("roundCnt");
    return this.getValueForUserAndRound(cleanLines, user, roundCnt, postFix);
  },

  getValueForUserAndRound(cleanLines, user, round, postFix = '') {  
    if (!user) {
      throw "user must exist";
    }
    if (round <= 0) {
      throw "round must be greater 0"; }

    let userLine = cleanLines.filter((x) => { return x.startsWith(`${user}${postFix}`); })[0];
    return userLine.split(",")[round];
  },


  getRetailpriceForRound(round) { return fn(this, "retailPrice")(round); },
  getSellerFineForRound(round) { return fn(this, "fine")(round); },
  getSellerFixedCostForRound(round) { return fn(this, "fixedCost")(round); },
  getMinutesPerRoundForRound(round) { return fn(this, "minutesPerRound")(round); },

  sanityCheck(rawConfigString) {
    let cleanLines = rawConfigString.split("\n")
      .filter( (x) => {return /^(game|b\d+|s\d+|retailPrice|fine|fixedCost|minutesPerRound)/.test(x);} )
      .map((x) => { return x.replace(/#.*$/, "").replace(/\s+/g, ""); });

    let gameLinePresent = cleanLines
      .filter((x) => { return /^game/.test(x); });
    if (gameLinePresent.length !== 1) {
      throw "Please check how to create a game config, game line not found"; }

    let checkNumbers = cleanLines.map((x) => { return x.split(",").length - 1; });
    let sameCommas = checkNumbers.every((x) => { return x === checkNumbers[0]; });
    if (!sameCommas) {
      throw "The game config has not the same amount of colums in every row, plase cound <,> in the config again"; }

    let uniqueUsers = cleanLines
      .filter( (x) => { return /^(b|s)\d+\b/.test(x); } )
      .map((x) => { return x.split(",")[0]; })
    ;

    if (_.uniq(uniqueUsers).length !== uniqueUsers.length) {
      throw "Every user must be unique in the config, two times b1 causes errors"; }

    return cleanLines;
  },
});
