var triggers=require('./ownLibs/mongoTriggers');
module.exports = function(db) {
    triggers(db.collection("test")).insert(function(document, next) {
          console.log("kkk");
          next(); 
        }
      );
    triggers(db.collection("test")).insert(function(document, next) {
        console.log("kkk");
        next(); 
      }
    );
    console.log("Triggers set up..");  
}
