var EventStore = function () {
  this.events = [];    
};

EventStore.prototype.leave = function () {

  this.return();

  this.events.unshift({
    start: +new Date()
 });

};

EventStore.prototype.return = function () {

  var lastEvent = this.events[0];

  if (!lastEvent.end) {
    lastEvent.end = +new Date();
 }

};

EventStore.prototype.current = function () {

   var lastEvent = this.events[0];

   if (lastEvent.end) {
      return {
         location: 'inside',
         since: lastEvent.end
      };
   } 
   else {
      return {
         location: 'outside',
         since: lastEvent.start
      }
   }

};

EventStore.prototype.list = function () {
   
   this.events.map(function (e) {
      return { 
         location: 'outside', 
         start: e.start,
         duration: e.start - e.end
      };
   });

};

module.exports = EventStore;

610-628-8705