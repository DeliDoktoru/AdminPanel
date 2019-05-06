
function run(){
    JsonData=[];
    list=db.getCollectionNames()
    for(item of list){
        mr =  db.runCommand({
            "mapreduce" : item,
            "map" : function() {
              for (var key in this) { emit(key, null); }
            },
            "reduce" : function(key, stuff) { return null; }, 
            "out": item + "_keys"
          })
        JsonData.push({
          fields:db[mr.result].distinct("_id"),
          dbName:item,
        });  
        db[mr.result].drop();
    }
    return JsonData;
}
run();


