await db.collection('test').findOne(); // arama
await db.admin().listDatabases() //database listesi
await db[req.query.id+""]() //gelen isteğe göre function çalıştırma
await db.listCollections().toArray() //collectionslar
status=(await db.collection(_data.collection).updateOne({_id: new ObjectId(_data.id)}, {$set: JSON.parse(_data.items)})).result;
db.createCollection("mycol", { capped : true, autoIndexId : true, size : 
    6142800, max : 10000 } )