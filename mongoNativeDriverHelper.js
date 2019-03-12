var MongoClient = require("mongodb").MongoClient;
var config=require('./config');
var db;
function createInstance() {
    MongoClient.connect("mongodb://"+config.database.url, { useNewUrlParser: true },async function(err, client){
    if (err) 
        console.log(err);
    else {
        db=client.db(config.database.dataBaseName);
    }
    });
}
createInstance();
module.exports={
    command:async function(c){
        if(db==undefined)
            createInstance();
        re=(await db.command(c));
        return re;
    }
}