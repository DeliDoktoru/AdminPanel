var express = require('express');
var router = express.Router();
var business = require('../business');
var ObjectId = require('mongodb').ObjectID;
var mail =require('../mailSender');


//login
router.get('/',async function(req, res, next) {
  //mail();
  b=c;
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
  tmp=(await db.command({'listCollections': 1 })).cursor.firstBatch;
  for (element of tmp) {
    data.push({
      val1:element.name,
      val2:(await db.collection(element.name).stats()).size +" Bytes",
      val3:(await db.collection(element.name).stats()).count +" öğe var." 
    });  
  }
  res.render('cardList', { title: 'Database' ,url:req.url,data :data });
}); 

router.get('/duyuru',async function(req, res, next){
  const db = req.app.locals.db;
  var _data=await db.collection("Duyurular").find().sort( { date : -1 } ).toArray();
  res.render('announcements', { title: 'Duyurular' ,data:_data  });
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
    _data=(await db.collection(req.params.collectionName).find({}).toArray());
    _title=req.params.collectionName.charAt(0).toUpperCase() + req.params.collectionName.slice(1)
    res.render('jsonList', { title: _title ,url:req.url ,data:_data,collection:req.params.collectionName });
  }
});
router.get('/database/:collectionName/:id',async function(req, res, next) {
  const db = req.app.locals.db;
  if(req.params.id!="Yeni_Kayıt" && req.params.collectionName!="Yeni_Yığın"){
    _data=await db.collection(req.params.collectionName).findOne({'_id': ObjectId(req.params.id)});
    _title=req.params.id;
    res.render('jsonViewer', { title: _title ,url:req.url ,data:_data ,collection:req.params.collectionName,id:req.params.id,method:"update"});} 
  else{
    res.render('jsonViewer', { title: "Yeni Kayıt" ,url:req.url ,data:{} ,collection:req.params.collectionName,id:"",method:"create"}); }
});



router.get('/Form/:pageName/:id',async function(req, res, next) {
  
    const db = req.app.locals.db;
    if(req.params.id=="Yeni_Kayıt"){
      pages=(await db.collection("Sayfalar").findOne({'pageName':req.params.pageName}));
      obj=(await business.inputGenerator(pages.content,db));
      res.render('form', { title: 'Yeni Kayıt' ,url:req.url,content:obj.txt,contentArray:obj.contentArray,collection:pages.collection,id:"",method:"create" });
    }else{
      _data=await db.collection(req.params.pageName).findOne({'_id':ObjectId(req.params.id)});
      pages=(await db.collection("Sayfalar").findOne({'pageName':req.params.pageName}));
      result=business.setValuesToinputs(pages.content,_data);
      obj=(await business.inputGenerator(result,db));
      _title=req.params.id;
      res.render('form', { title: _title ,url:req.url,content:obj.txt,contentArray:obj.contentArray,collection:pages.collection,id:req.params.id,method:"update" });
    }  
  
});

router.get('/Form/:pageName',async function(req, res, next) {

    const db = req.app.locals.db;
    pages=(await db.collection("Sayfalar").findOne({'pageName':req.params.pageName}));
    if(pages==null )// pages.viewable==undefined
      res.render('error', { message: "Eksik Bilgi!" , error:{status:"404",stack:"Bilgileriniz kontrol edip tekrar deneyiniz!"} });
    else{
      obj=(await business.viewGenerator(pages,db,req.url));
      res.render('table', { title: req.params.pageName ,url:req.url,content:obj.txt,collection:pages.collection,maxPage:obj.maxPage});
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
    _user=(await db.collection("Kullanıcılar").findOne({'userName':_data.userName,'password':_data.password}));
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
        (await db.collection(_data.oldCollectionName).rename(_data.collectionName));
        text = "Güncellendi!";
        status.ok=1
        break;
      case "delete":
        await db.collection(_data.collectionName).drop();
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
  var text, renk,status={},link;
  try{
   // await business.checkAllow(req.session.user,db,_data.collection);
    link=(await db.collection("Sayfalar").findOne({'collection':_data.collection})).link;
    if(link==undefined || link=="")
      throw "Link bulunamadı";
    switch (_data.method) {
      case "update":
          (await db.collection(_data.collection).deleteOne({_id:  ObjectId(_data.id)}));
          _data.items=JSON.parse(_data.items);
          _data.items._id=ObjectId(_data.id);
          _data.items.When=new Date();
          //_data.items.User=req.session.user.userName;
          (await db.collection(_data.collection).insertOne(_data.items));
          text = "Güncellendi!";
          status.ok=1
          business.notification(db,_data.method,_data.collection,link+'/'+_id,{xx:"hello"});
        break;
      case "delete":
          (await db.collection(_data.collection).deleteOne({_id:ObjectId(_data.id)}));
          text = "Silindi!";
          status.ok=1
          business.notification(db,_data.method,_data.collection,link,{xx:"hello"});
        break;
      case "create":
          _data.items=JSON.parse(_data.items);
          _data.items.When=new Date();
          //_data.items.User=req.session.user.userName;
          var r=(await db.collection(_data.collection).insertOne(_data.items));
          status.ok=1;
          text = "Oluşturuldu!";
          business.notification(db,_data.method,_data.collection,link+'/'+r.insertedId,{xx:"hello"});
        break;
      default:
        text = "Eksik bilgi!";
    }
  }catch (error) {
    status.ok=0;
    text = error.message;
  }

  
  if(status.ok == undefined || status.ok!=1){
    renk="danger"; 
  }
  else{
    //burası kullanıcıların count artırma
    /*(await db.collection("Kullanıcılar").
    updateOne({_id: new ObjectId(req.session.user._id)}, 
    { $inc: { [_data.method]: 1 } }   ));*/

    renk="success"; 
  }
  res.send( {message:text ,status:status,color:renk});
});

router.post('/ajax/filter',async function(req,res,next){
  const db = req.app.locals.db;
  _collectionName=req.body.collection;
  _query=JSON.parse(req.body.query);
  pages=(await db.collection("Sayfalar").findOne({'collection':_collectionName}));
  _data=await business.viewBodyGenerator(pages,db,"/"+pages.link,_query);
  res.send({status:"ok",data:_data});
})

module.exports = router;  
