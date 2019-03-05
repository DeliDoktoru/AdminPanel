var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;
var business = require('../business');

// /dashboard
router.get('/', function(req, res, next) {
  res.redirect('/dashboard');
});
router.get('/dashboard', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// /database
router.get('/database',async function(req, res, next) {
  const db = req.app.locals.db;
  data = [];
  tmp=await db.listCollections().toArray();
  for (element of tmp) {
    data.push({
      val1:element.name,
      val2:(await db.collection(element.name).stats()).size +" Bytes",
      val3:await db.collection(element.name).countDocuments() +" öğe var." 
    });  
  }
  res.render('cardList', { title: 'Database' ,url:req.url,data :data });
}); 

router.get('/database/:collectionName',async function(req, res, next) {
  if(req.params.collectionName=="Yeni_Yığın")
    res.render('collectionViewer', { title: 'Yeni Yığın' ,url:req.url,method:"create",collection:"",options:{} });
  else if(req.params.collectionName=="Yığını_Düzenle"){
    if(req.query.name!=undefined){
      const db = req.app.locals.db;
      _options=(await db.command({'listCollections': 1 ,"filter":{"name":req.query.name}})).cursor.firstBatch[0].options
      _title=req.query.name.charAt(0).toUpperCase() + req.query.name.slice(1);
      res.render('collectionViewer', { title: _title ,url:req.url,method:"update",collection:req.query.name,options:_options  });
    }
    else
      res.render('error', { message: "Eksik Bilgi!" , error:{status:"404",stack:"Bilgileriniz kontrol edip tekrar deneyiniz!"} });
    }  
  else{
    const db = req.app.locals.db;
    _data=await db.collection(req.params.collectionName).find({}).toArray();
    _title=req.params.collectionName.charAt(0).toUpperCase() + req.params.collectionName.slice(1)
    res.render('jsonList', { title: _title ,url:req.url ,data:_data,collection:req.params.collectionName });
  }
});
router.get('/database/:collectionName/:id',async function(req, res, next) {
  const db = req.app.locals.db;
  if(req.params.id!="Yeni_Kayıt" && req.params.collectionName!="Yeni_Yığın"){
    _data=await db.collection(req.params.collectionName).findOne({'_id':new ObjectId(req.params.id)});
    _title=req.params.id;
    res.render('jsonViewer', { title: _title ,url:req.url ,data:_data ,collection:req.params.collectionName,id:req.params.id,method:"update"});} 
  else{
    res.render('jsonViewer', { title: "Yeni Kayıt" ,url:req.url ,data:{} ,collection:req.params.collectionName,id:"",method:"create"}); }
});

//Form
router.get('/:pageName/:id',async function(req, res, next) {
  const db = req.app.locals.db;
  if(req.params.id=="Yeni_Kayıt"){
    pageInputs=(await db.collection("Sayfalar").findOne({'pageName':req.params.pageName})).content;
    obj=(await business.inputGenerator(pageInputs,db));
    res.render('form', { title: 'Yeni Kayıt' ,url:req.url,content:obj.txt,contentArray:obj.contentArray });
  }else{
    _data=await db.collection(req.params.pageName).findOne({'_id':new ObjectId(req.params.id)});
    pageInputs=(await db.collection("Sayfalar").findOne({'pageName':req.params.pageName})).content;
    result=business.setValuesToinputs(pageInputs,_data);
    obj=(await business.inputGenerator(result,db));
    _title=req.params.id;
    res.render('form', { title: _title ,url:req.url,content:obj.txt,contentArray:obj.contentArray });
  }  
});

router.get('/Sayfa',async function(req, res, next) {
 
});
//Ajax
router.post('/changeCollection',async function(req, res, next){
  const db = req.app.locals.db;
  _data=req.body;
  var text, renk,status; 
  switch (_data.method) {
    case "update":
      tmp=(await db.collection(_data.oldCollectionName).rename(_data.collectionName));
      status={ok:tmp.collectionName?1:0}
      text = "Güncellendi!";
      renk="success"
      break;
    case "delete":
      tmp=await db.collection(_data.collectionName).drop();
      status={ok:tmp?1:0}
      text = "Silindi!";
      renk="success"
      break;
    case "create":
      _data.options=JSON.parse(_data.options);
      tmp=(await db.createCollection(_data.collectionName, _data.options));
      status={ok:tmp.collectionName?1:0}
      text = "Oluşturuldu!"; 
      renk="success"
      break;
    default:
      text = "Eksik bilgi!";
      renk="danger" 
  }
  if(status.ok!=1){
    text="Hata Oluştu"; 
    renk="danger" 
  }
  res.send( {message:text ,status:status,color:renk});
});

router.post('/changeDocument',async function(req, res, next){
  const db = req.app.locals.db;
  _data=req.body; 
  var text, renk,status;
  switch (_data.method) {
    case "update":
      status=(await db.collection(_data.collection).deleteOne({_id: new ObjectId(_data.id)})).result;
      if(status.ok!=1)
        break;
      _data.items=JSON.parse(_data.items);
      _data.items._id=new ObjectId(_data.id);
      status=(await db.collection(_data.collection).insertOne(_data.items)).result;
      text = "Güncellendi!";
      renk="success"
      break;
    case "delete":
      status=(await db.collection(_data.collection).deleteOne({_id: new ObjectId(_data.id)})).result;
      text = "Silindi!";
      renk="success"
      break;
    case "create":
      _data.items=JSON.parse(_data.items);
      status=(await db.collection(_data.collection).insertOne(_data.items)).result;
      text = "Oluşturuldu!";
      renk="success"
      break;
    default:
      text = "Eksik bilgi!";
      renk="danger" 
  }
  if(status.ok!=1){
    text="Hata Oluştu"; 
    renk="danger" 
  }
  res.send( {message:text ,status:status,color:renk});
});


module.exports = router;  
