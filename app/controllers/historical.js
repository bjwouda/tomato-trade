import Ember from 'ember';

export default Ember.Controller.extend({actions: {

    exportCSV() {
      /*var data = this.store.findAll('history'.then(function(result){
      	result.getEach('sender')}));*/
      var data = this.store.findAll('history', 1);//.get('attributes');
      //var oscar = data.objectAt[1];
      var oscar = data.get('userSender', "Oscar");
      /*var oscar = Ember.computed('data.@each', function (){
      	return this.get('data');
      })*/

      //var oscar = data.get('data');
      
      //console.log(Ember.inspect(data[0]));
      //console.log(data);
      //console.log(oscar);
      console.log(Ember.inspect(oscar));
      this.get('csv').export(data, 'test.csv');
    }
  }
});
