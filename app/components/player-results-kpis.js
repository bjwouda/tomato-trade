import Ember from 'ember';

import ChartUtilities from "../mixins/chart-utilities";

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
  
  options: Ember.computed("i18n.locale", "role", function() {
    let i18n = this.get("i18n");
    let role = this.get("role");
    
    let isSeller = role === "seller";
    
    return {
      // These options attempt to force negative barcharts to include the zero line.
      scales: {
        yAxes: [{
          ticks: {
            min: isSeller ? 0.0 : -1.0,
            max: isSeller ? 2.0 : 1.0
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
