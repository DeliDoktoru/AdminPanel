await db.collection('test').findOne(); // arama
await db.admin().listDatabases() //database listesi
await db[req.query.id+""]() //gelen isteğe göre function çalıştırma
await db.listCollections().toArray() //collectionslar
status=(await db.collection(_data.collection).updateOne({_id: new ObjectId(_data.id)}, {$set: JSON.parse(_data.items)})).result;
db.createCollection("mycol", { capped : true, autoIndexId : true, size : 
    6142800, max : 10000 } )
//mongodb://
var MongoClient = require('mongodb').MongoClient;
//const db = req.app.locals.db;

MongoClient.connect(config.database.url, { useNewUrlParser: true },function(err, client){
  if (err) 
    console.log(err);
  else {
    _db=client.db(config.database.dataBaseName);

    
    app.locals.db = _db
    
     // _db.collection("test").insertOne({ "a":"cckkd"});
    console.log("Database Connection success..");
  }
});

_options=(await db.command({'listCollections': 1 ,"filter":{"name":req.query.name}})).cursor.firstBatch[0].options
tmp=await db.listCollections().toArray();