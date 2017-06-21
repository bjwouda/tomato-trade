import Ember from 'ember';

import ChartUtilities from "../mixins/chart-utilities";

import _ from 'lodash/lodash';

function getDataForWeeksForPosition(weeks, position, kpiPerPlayerPerWeek) {
  return weeks.map(function(week) {
    return kpiPerPlayerPerWeek[week][position];
  });
}

function getColorForPosition(position, playerPosition) {
  let hue = 9 + 200 * (position - 1);
  let saturation = 100;
  let lightness = 64;
  
  if(position === playerPosition) {
    // The player is always tomato red.
    hue = 9;
  }
  else if(position === 1) {
    // The competitor who would have been tomato red is the color the player would have been.
    hue = 9 + 200 * (playerPosition - 1);
  }
  
  return `hsl(${hue},${saturation}%,${lightness}%)`;
}

function getBordersForPosition(position, playerPosition) {
  let hue = 9 + 200 * (position - 1);
  let saturation = 100;
  let lightness = 44;
  
  if(position === playerPosition) {
    // The player is always tomato red.
    hue = 9;
  }
  else if(position === 1) {
    // The competitor who would have been tomato red is the color the player would have been.
    hue = 9 + 200 * (playerPosition - 1);
  }
  
  return `hsl(${hue},${saturation}%,${lightness}%)`;
}

export default Ember.Component.extend(ChartUtilities, {
  i18n: Ember.inject.service(),
  
  minimumKPI: -1.0,
  maximumKPI: 1.0,
  
  quantumState: false,
  
  calculateKPIBounds: Ember.on("init", Ember.observer("player", "buyers", "sellers", "weeks", "positionsForPlayers", "kpiPerPlayerPerWeek", function() {
    let player = this.get("player");
    
    let buyers = this.get("buyers");
    let sellers = this.get("sellers");
    
    let weeks = this.get("weeks");
    
    let positionsForPlayers = this.get("positionsForPlayers");
    let kpiPerPlayerPerWeek = this.get("kpiPerPlayerPerWeek");
    
    let playerPosition = player.get("playerPosition");
    let playerIsSeller = player.get("isSeller");
    
    let competitors = playerIsSeller ? sellers : buyers;
    
    let minimumKPI = -1.0;
    let maximumKPI = 1.0;
    
    let minimum = Number.MAX_VALUE;
    let maximum = -Number.MAX_VALUE;
    
    competitors.forEach(function(competitor) {
      let competitorRole = competitor.get("roleDescription");
      let competitorPosition = competitor.get("playerPosition");
      
      let position = positionsForPlayers[competitorRole][competitorPosition];
      
      let competitorMinimum = weeks.reduce(function(minimum, week) {
        let kpi = kpiPerPlayerPerWeek[week][position];
        
        if(kpi < minimum) {
          return kpi;
        }
        else {
          return minimum;
        }
      }, Number.MAX_VALUE);
      
      let competitorMaximum = weeks.reduce(function(maximum, week) {
        let kpi = kpiPerPlayerPerWeek[week][position];
        
        if(kpi > maximum) {
          return kpi;
        }
        else {
          return maximum;
        }
      }, -Number.MAX_VALUE);
      
      if(competitorMinimum < minimum) {
        minimum = competitorMinimum;
      }
      
      if(competitorMaximum > maximum) {
        maximum = competitorMaximum;
      }
    });
    
    minimumKPI = _.min([0.0, minimum]);
    maximumKPI = _.max([0.0, maximum]);
    
    this.set("minimumKPI", minimumKPI);
    this.set("maximumKPI", maximumKPI);
    
    // Force the chart to update.
    this.set("quantumState", !this.get("quantumState"));
  })),
  
  data: Ember.computed("i18n.locale", "player", "buyers", "sellers", "weeks", "positionsForPlayers", "kpiPerPlayerPerWeek", function() {
    let i18n = this.get("i18n");
    
    let player = this.get("player");
    
    let buyers = this.get("buyers");
    let sellers = this.get("sellers");
    
    let weeks = this.get("weeks");
    
    let positionsForPlayers = this.get("positionsForPlayers");
    let kpiPerPlayerPerWeek = this.get("kpiPerPlayerPerWeek");
    
    let playerPosition = player.get("playerPosition");
    let playerIsSeller = player.get("isSeller");
    
    let competitors = playerIsSeller ? sellers : buyers;
    
    let dataSets = competitors.map(function(competitor) {
      let competitorRole = competitor.get("roleDescription");
      let competitorPosition = competitor.get("playerPosition");
      
      let labels = [
        i18n.t("player.results.player.kpis." + competitorRole),
        competitorPosition
      ];
      
      let label = labels.join(i18n.t("player.results.player.kpis.space"));
      
      let position = positionsForPlayers[competitorRole][competitorPosition];
      
      let data = getDataForWeeksForPosition(weeks, position, kpiPerPlayerPerWeek);
      let colors = getColorForPosition(competitorPosition, playerPosition);
      let borders = getBordersForPosition(competitorPosition, playerPosition);
      
      return this.createBarChartDataSet(label, data, colors, borders);
    }, this);
    
    let labels = weeks.map(function(week) {
      return i18n.t("player.results.player.kpis.week") + i18n.t("player.results.player.kpis.space") + week;
    });
    
    return this.createChartData(dataSets, labels);
  }),
  
  options: Ember.computed("i18n.locale", "minimumKPI", "maximumKPI", function() {
    let i18n = this.get("i18n");
    
    let minimumKPI = this.get("minimumKPI");
    let maximumKPI = this.get("maximumKPI");
    
    return {
      // These options attempt to force negative barcharts to include the zero line.
      scales: {
        yAxes: [{
          ticks: {
            min: minimumKPI * 1.1,
            max: maximumKPI * 1.1,
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
