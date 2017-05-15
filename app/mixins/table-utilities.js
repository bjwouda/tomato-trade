import Ember from 'ember';

export default Ember.Mixin.create({
  i18n: Ember.inject.service(),
  
  localize(key) {
    // i18n allows HTML, but ember-models-table doesn't. So don't use HTML.
    return "" + this.get("i18n").t(key);
  },
  
  classes: {
    "table": "table table-responsive",
    // Makes the table footer look less uneven. See also ".table-summary" in "styles/app.css".
    "footerSummaryNumericPagination": "col-md-7 col-sm-7col-xs-7",
    "paginationWrapperNumeric": "col-md-3 col-sm-3 col-xs-3"
  },
  
  messages: Ember.computed("i18n.locale", function() {
    return {
      // Not all of these are currently actually visible.
      "searchLabel": this.localize("table.searchLabel"),
      "searchPlaceholder": this.localize("table.searchPlaceholder"),
      "columns-title": this.localize("table.columns.title"),
      "columns-showAll": this.localize("table.columns.showAll"),
      "columns-hideAll": this.localize("table.columns.hideAll"),
      "columns-restoreDefaults": this.localize("table.columns.restoreDefaults"),
      "tableSummary": this.localize("table.tableSummary"),
      "allColumnsAreHidden": this.localize("table.allColumnsAreHidden"),
      "noDataToShow": this.localize("table.noDataToShow")
    };
  })
});
