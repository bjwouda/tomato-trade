import Ember from 'ember'; 

export default function storeWithWeek(weekCntPath, key) {
  return Ember.computed(weekCntPath, "playerWeekStatus", {
    get() {
      let weekCnt = this.get(weekCntPath);
      let tmpKey = `playerWeekStatus.w${weekCnt}.${key}`;
      return this.get(tmpKey) || 0;
    },
    set() {
      if (! this.get("playerWeekStatus")) { this.set("playerWeekStatus", {}); }
      
      let val = arguments[1];
      let weekCnt = this.get(weekCntPath);
      var previousObj = this.get("playerWeekStatus");


      //console.debug(previousObj);

      if (!weekCnt) {return;}

      if (! previousObj[`w${weekCnt}`]) { previousObj[`w${weekCnt}`] = {}; }
      previousObj[`w${weekCnt}`][key] = val;
      //console.debug(previousObj);

      this.set("playerWeekStatus", previousObj);
      return val;
    }
  });
}