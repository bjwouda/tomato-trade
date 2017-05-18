import Ember from 'ember';

export default Ember.Component.extend({
  // Have the component wrap the file input with a label so we can make it look and act like a button.
  tagName: 'label',
  
  change: function(event) {
    let self = this;
    
    let file = event.target.files[0];
    
    if(!file) {
      console.warn("No file was selected.");
      
      return;
    }
    
    let reader = new FileReader();
    
    reader.onload = function(event) {
      let workBook = XLSX.read(event.target.result, { type: "binary" });
      let workSheet = workBook.Sheets[workBook.SheetNames[0]];
      
      // Convert it to an array of objects so we don't have to work with the Excel sheet outside of this component.
      let rows = XLSX.utils.sheet_to_json(workSheet);
      
      self.sendAction("action", rows);
    };
    
    reader.readAsBinaryString(file);
  }
});
