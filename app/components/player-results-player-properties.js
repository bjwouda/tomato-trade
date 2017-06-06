import Ember from 'ember';

export default Ember.Component.extend({
  averageKPI: Ember.computed("averageKPIPerPlayer", "player", "positionsForPlayers", function() {
    let averageKPIPerPlayer = this.get("averageKPIPerPlayer");
    
    let player = this.get("player");
    
    let positionsForPlayers = this.get("positionsForPlayers");
    
    let role = player.get("roleDescription");
    let position = player.get("playerPosition");
    
    position = positionsForPlayers[role][position];
    
    return averageKPIPerPlayer[position];
  }),
  
  isWinner: Ember.computed("averageKPIPerPlayer", "player", "buyers", "sellers", "positionsForPlayers", function() {
    let averageKPIPerPlayer = this.get("averageKPIPerPlayer");
    
    let player = this.get("player");
    
    let buyers = this.get("buyers");
    let sellers = this.get("sellers");
    
    let positionsForPlayers = this.get("positionsForPlayers");
    
    let contenders;
    
    if(player.get("isSeller")) {
      contenders = sellers;
    }
    else {
      contenders = buyers;
    };
    
    let playerPosition = player.get("playerPosition");
    
    let maximum = Number.MIN_VALUE;
    let winnerPosition = -1;
    
    contenders.forEach(function(contender) {
      let contenderRole = contender.get("roleDescription");
      let contenderPosition = contender.get("playerPosition");
      
      let position = positionsForPlayers[contenderRole][contenderPosition];
      
      let average = averageKPIPerPlayer[position];
      
      if(average > maximum) {
        maximum = average;
        
        winnerPosition = contenderPosition;
      }
    });
    
    return playerPosition === winnerPosition;
  })
});
