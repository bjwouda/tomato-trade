import Ember from 'ember';

import ChartUtilities from "../mixins/chart-utilities";

import _ from 'lodash/lodash';

function getDataForPosition(position, averageKPIPerPlayer) {
  return [
    averageKPIPerPlayer[position]
  ];
}

function getColorForPosition(position) {
  let hue = 9 + 200 * (position - 1);
  let saturation = 100;
  let lightness = 64;
  
  return `hsl(${hue},${saturation}%,${lightness}%)`;
}

function getBordersForPosition(position) {
  let hue = 9 + 200 * (position - 1);
  let saturation = 100;
  let lightness = 44;
  
  return `hsl(${hue},${saturation}%,${lightness}%)`;
}

export default Ember.Component.extend(ChartUtilities, {
  i18n: Ember.inject.service(),
  
  minimumAverageKPI: -1.0,
  maximumAverageKPI: 1.0,
  
  quantumState: false,
  
  calculateAverageKPIBounds: Ember.on("init", Ember.observer("role", "players", "positionsForPlayers", "averageKPIPerPlayer", function() {
    let role = this.get("role");
    let players = this.get("players");
    
    let positionsForPlayers = this.get("positionsForPlayers");
    let averageKPIPerPlayer = this.get("averageKPIPerPlayer");
    
    let minimumAverageKPI = -1.0;
    let maximumAverageKPI = 1.0;
    
    if(players.length > 0) {
      let minimum = Number.MAX_VALUE;
      let maximum = -Number.MAX_VALUE;
      
      players.forEach(function(player) {
        let position = player.get("playerPosition");
        
        let playerPosition = positionsForPlayers[role][position];
        
        let average = averageKPIPerPlayer[playerPosition];
        
        if(average < minimum) {
          minimum = average;
        }
        
        if(average > maximum) {
          maximum = average;
        }
      });
      
      minimumAverageKPI = _.min([0.0, minimum]);
      maximumAverageKPI = _.max([0.0, maximum]);
    }
    
    this.set("minimumAverageKPI", minimumAverageKPI);
    this.set("maximumAverageKPI", maximumAverageKPI);
    
    // Force the chart to update.
    this.set("quantumState", !this.get("quantumState"));
  })),
  
  data: Ember.computed("i18n.locale", "role", "players", "positionsForPlayers", "averageKPIPerPlayer", function() {
    let i18n = this.get("i18n");
    
    let role = this.get("role");
    let players = this.get("players");
    
    let positionsForPlayers = this.get("positionsForPlayers");
    let averageKPIPerPlayer = this.get("averageKPIPerPlayer");
    
    let dataSets = players.map(function(player) {
      let position = player.get("playerPosition");
      
      let labels = [
        i18n.t("player.results.kpis." + role + ".role"),
        position
      ];
      
      let label = labels.join(i18n.t("player.results.kpis.space"));
      
      let playerPosition = positionsForPlayers[role][position];
      
      let data = getDataForPosition(playerPosition, averageKPIPerPlayer);
      let colors = getColorForPosition(position);
      let borders = getBordersForPosition(position);
      
      return this.createBarChartDataSet(label, data, colors, borders);
    }, this);
    
    let labels = [
      ""
    ];
    
    return this.createChartData(dataSets, labels);
  }),
  
  options: Ember.computed("i18n.locale", "minimumAverageKPI", "maximumAverageKPI", function() {
    let i18n = this.get("i18n");
    
    let minimumAverageKPI = this.get("minimumAverageKPI");
    let maximumAverageKPI = this.get("maximumAverageKPI");
    
    return {
      // These options attempt to force negative barcharts to include the zero line.
      scales: {
        yAxes: [{
          ticks: {
            min: minimumAverageKPI * 1.1,
            max: maximumAverageKPI * 1.1
          }
        }]
      },
      // These options format the tool tip value to something readable.
      tooltips: {
        callbacks: {
          label: function(toolTipItem, data) {
            let label = data.datasets[toolTipItem.datasetIndex].label;
            let value = toolTipItem.yLabel;
            
            // Graciously stolen from the digit-format helper.
            value = parseFloat(Math.round(value * 100) / 100).toFixed(2);
            
            return label + i18n.t("chart.toolTipSeparator") + value;
          }
        }
      }
    };
  })
});
