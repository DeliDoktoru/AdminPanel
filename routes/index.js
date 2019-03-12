var express = require('express');
var router = express.Router();
var business = require('../business');
var pmongo = require('promised-mongo');
var helperDriver= require("../mongoNativeDriverHelper");

//login
router.get('/',async function(req, res, next) {
  res.render('login', { title: 'Giriş' });
});

// /dashboard
router.get('/dashboard', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// /database
router.get('/database',async function(req, res, next) {
  data = [];
  const db = req.app.locals.db;
  tmp=(await helperDriver.command({'listCollections': 1 })).cursor.firstBatch;
  for (element of tmp) {
    data.push({
      val1:element.name,
      val2:(await db[element.name].stats()).size +" Bytes",
      val3:(await db[element.name].stats()).count +" öğe var." 
    });  
  }
  res.render('cardList', { title: 'Database' ,url:req.url,data :data });
}); 

router.get('/database/:collectionName',async function(req, res, next) {
  if(req.params.collectionName=="Yeni_Yığın")
    res.render('collectionViewer', { title: 'Yeni Yığın' ,url:req.url,method:"create",collection:"",options:{} });
  else if(req.params.collectionName=="Yığını_Düzenle"){
    if(req.query.name!=undefined){
      _options=(await helperDriver.command({'listCollections': 1 ,"filter":{"name":req.query.name}})).cursor.firstBatch[0].options
      _title=req.query.name.charAt(0).toUpperCase() + req.query.name.slice(1);
      res.render('collectionViewer', { title: _title ,url:req.url,method:"update",collection:req.query.name,options:_options  });
    }
    else
      res.render('error', { message: "Eksik Bilgi!" , error:{status:"404",stack:"Bilgileriniz kontrol edip tekrar deneyiniz!"} });
    }  
  else{
    const db = req.app.locals.db;
    _data=await db[req.params.collectionName].find({}).toArray();
    _title=req.params.collectionName.charAt(0).toUpperCase() + req.params.collectionName.slice(1)
    res.render('jsonList', { title: _title ,url:req.url ,data:_data,collection:req.params.collectionName });
  }
});
router.get('/database/:collectionName/:id',async function(req, res, next) {
  const db = req.app.locals.db;
  if(req.params.id!="Yeni_Kayıt" && req.params.collectionName!="Yeni_Yığın"){
    _data=await db[req.params.collectionName].findOne({'_id': pmongo.ObjectId(req.params.id)});
    _title=req.params.id;
    res.render('jsonViewer', { title: _title ,url:req.url ,data:_data ,collection:req.params.collectionName,id:req.params.id,method:"update"});} 
  else{
    res.render('jsonViewer', { title: "Yeni Kayıt" ,url:req.url ,data:{} ,collection:req.params.collectionName,id:"",method:"create"}); }
});

//Form
notForm=function(txt){
  var arr=["public","database","favicon.ico","dashboard","ajax"];
  for(val of arr)
  {
    if(txt==val)
      return true;
  }
  return false;
}

router.get('/:pageName/:id',async function(req, res, next) {
  if(notForm(req.params.pageName))
    next();
  else{
    const db = req.app.locals.db;
    if(req.params.id=="Yeni_Kayıt"){
      pages=(await db["Sayfalar"].findOne({'pageName':req.params.pageName}));
      obj=(await business.inputGenerator(pages.content,db));
      res.render('form', { title: 'Yeni Kayıt' ,url:req.url,content:obj.txt,contentArray:obj.contentArray,collection:pages.collection,id:"",method:"create" });
    }else{
      _data=await db[req.params.pageName].findOne({'_id':pmongo.ObjectId(req.params.id)});
      pages=(await db["Sayfalar"].findOne({'pageName':req.params.pageName}));
      result=business.setValuesToinputs(pages.content,_data);
      obj=(await business.inputGenerator(result,db));
      _title=req.params.id;
      res.render('form', { title: _title ,url:req.url,content:obj.txt,contentArray:obj.contentArray,collection:pages.collection,id:req.params.id,method:"update" });
    }  
  }
});

router.get('/:pageName',async function(req, res, next) {
  if(notForm(req.params.pageName))
    next();
  else{
    const db = req.app.locals.db;
    pages=(await db["Sayfalar"].findOne({'pageName':req.params.pageName}));
    if(pages==null )// pages.viewable==undefined
      res.render('error', { message: "Eksik Bilgi!" , error:{status:"404",stack:"Bilgileriniz kontrol edip tekrar deneyiniz!"} });
    else{
      obj=(await business.viewGenerator(pages,db,req.url));
      res.render('table', { title: req.params.pageName ,url:req.url,content:obj.txt,collection:pages.collection});
    }
  }  
});



//Ajax
router.post('/ajax/login', async function(req, res, next) {
  const db = req.app.locals.db;
  var text, renk;
  _data=req.body;
  if(_data ==undefined || _data.userName=="" || _data.password==""){
    text = "Eksik bilgi!";
    renk="danger" 
    res.send( {message:text ,status:0,color:renk});
  }
  else{
    _user=(await db["Kullanıcılar"].findOne({'userName':_data.userName,'password':_data.password}));
    if(_user==null){
      text = "Kullanıcı adı yada şifre hatalı!";
      renk="danger" 
      res.send( {message:text ,status:0,color:renk});
    }
    else{
      text = "Giriş Yapılıyor..";
      renk="success"
      req.session.user=_user;
      res.send( {message:text ,status:1,color:renk}); 
    }
       
  }
});
router.post('/ajax/exit', async function(req, res, next) {
  var text, renk;
  if(req.session.user==undefined || req.session.user._id==undefined){
    text = "Giriş bilgileriniz bulunamadı!";
    renk="danger" 
    res.send( {message:text ,status:0,color:renk});
  }
  else{
    req.session.destroy();
    text = "Çıkış Yapılıyor..";
    renk="success"
    res.send( {message:text ,status:1,color:renk}); 
  }
});

router.post('/ajax/changeCollection',async function(req, res, next){
  const db = req.app.locals.db;
  _data=req.body;
  var text, renk,status={};
  try {
    switch (_data.method) {
      case "update":
        (await db[_data.oldCollectionName].rename(_data.collectionName));
        text = "Güncellendi!";
        status.ok=1
        break;
      case "delete":
        await db[_data.collectionName].drop();
        text = "Silindi!";
        status.ok=1
        break;
      case "create":
        _data.options=JSON.parse(_data.options);
        (await db.createCollection(_data.collectionName, _data.options));
        text = "Oluşturuldu!"; 
        status.ok=1
        break;
      default:
        text = "Eksik bilgi!";
    }
  } catch (error) {
    status.ok=0;
    if(error.message!=undefined)
      text=error.message;
    else
      text = error;
  } 
  
  
  if(status.ok == undefined || status.ok!=1){
    renk="danger" 
  }
  else{
    renk="success" 
  }
  res.send( {message:text ,status:status,color:renk});
});

router.post('/ajax/changeDocument',async function(req, res, next){
  const db = req.app.locals.db;
  _data=req.body; 
  var text, renk,status={};
  try{
    if((await helperDriver.command({'listCollections': 1 ,"filter":{"name":_data.collection}})).cursor.firstBatch.length === 0)
      throw "Böyle Bir Yığın Bulunmamaktadır!"
    switch (_data.method) {
      case "update":
          (await db[_data.collection].remove({_id:  pmongo.ObjectId(_data.id)},{user:req.session.user,db:db,collection:_data.collection}));
          _data.items=JSON.parse(_data.items);
          _data.items._id=pmongo.ObjectId(_data.id);
          (await db[_data.collection].insert(_data.items,{user:req.session.user,db:db,collection:_data.collection}));
          text = "Güncellendi!";
          status.ok=1
        break;
      case "delete":
          (await db[_data.collection].remove({_id:  pmongo.ObjectId(_data.id)},{user:req.session.user,db:db,collection:_data.collection}));
          text = "Silindi!";
          status.ok=1
        break;
      case "create":
          _data.items=JSON.parse(_data.items);
          (await db[_data.collection].insert(_data.items,{user:req.session.user,db:db,collection:_data.collection}));
          status.ok=1;
          text = "Oluşturuldu!";
        break;
      default:
        text = "Eksik bilgi!";
    }
  }catch (error) {
    status.ok=0;
    text = error;
  }

  
  if(status.ok == undefined || status.ok!=1){
    renk="danger" 
  }
  else{
    renk="success" 
  }
  res.send( {message:text ,status:status,color:renk});
});

router.post('/ajax/filter',async function(req,res,next){
  const db = req.app.locals.db;
  _collectionName=req.body.collection;
  _filter=JSON.parse(req.body.filter);
  pages=(await db["Sayfalar"].findOne({'collection':_collectionName}));
  _data=await viewBodyGenerator(pages,db,"/"+pages.pageName,_filter)
  res.send({status:"ok",data:_data});
})

module.exports = router;  
