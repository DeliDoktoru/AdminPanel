var triggers = require('./ownLibs/mongoTriggers');
var MongoClient = require("mongodb").MongoClient;
var config = require('./config');
var pmongo = require('promised-mongo');
async function checkAllow(user,db,collection){
      _grupId=user.grup;
      if(_grupId==undefined){
        return "Kişinin Grup Yetkisi Bulunamadı!";
      }
      _yetkiGrubu=await db["Yetki Grupları"].findOne({'_id': pmongo.ObjectId(_grupId)});
      if(_yetkiGrubu==null){
        return "Böyle Bir Grup Yetkisi Bulunamadı!";
      }
      
      result=(await db["Sayfalar"].findOne({'collection': collection}));
      if(result==null){
        return "Bu Yığına Erişim Sağlayamazsınız!";
      }
      for(val of _yetkiGrubu.allowedCollection){
        if(val.collectionId==result._id)
          return null;
      }
      return "Erişim Engellendi!";
}

module.exports =  function (db) {
  MongoClient.connect("mongodb://" + config.database.url, {
    useNewUrlParser: true
  }, async function (err, client) {
    if (err)
      console.log(err);
    else {
      helper = client.db(config.database.dataBaseName);
      collections = (await helper.command({
        'listCollections': 1
      })).cursor.firstBatch;
      for (val of collections) {
        triggers(db[val.name]).insert( async function (document,data, next) {
          if(data.user==undefined  ){
            throw "Erişim Engellendi!";
          }
          if(data.db==undefined  ){
            throw "Bağlantı bulunamadı!";
          }
          if(data.collection==undefined  ){
            throw "Yığın bulunamadı!";
          }
         
          var re=await checkAllow(data.user,data.db,data.collection); 
          if(re) throw re;
          document.When=new Date();
          next();
        });
        triggers(db[val.name]).remove(async function (document,data, next) {
          if(data.user==undefined  ){
            throw "Erişim Engellendi!";
          }
          if(data.db==undefined  ){
            throw "Bağlantı bulunamadı!";
          }
          if(data.collection==undefined  ){
            throw "Yığın bulunamadı!";
          }
          var re=await checkAllow(data.user,data.db,data.collection);
          if(re) throw re; 
          next();
        });
      }
      console.log("Triggers set up..");
    }
  });




}