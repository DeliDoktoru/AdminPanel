var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();
var fs=require("fs");
var ObjectId = require('mongodb').ObjectID;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//morgan loger customize
//file
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(logger(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    decodeURIComponent(tokens.url(req, res)),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}, {
  skip: function (req, res) { return req.url.search("public")!=-1  },
  stream: accessLogStream 
}));
//console
app.use(logger(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    decodeURIComponent(tokens.url(req, res)),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}, {
  skip: function (req, res) { return req.url.search("public")!=-1  },
}));

app.use(session({
  secret:'3D75D274B997B53CFD2892F69F54BC28',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true }
}));

//permission control
function checkAllowed(txt){
  var arr=["public","ajax","favicon.ico"];
  for(val of arr)
  {
    if(txt.includes(val))
      return true;
  }
  return false;
}
app.use(async function(req,res,next){
  
  if(checkAllowed(req.url)){
    next();
    return;
  }
  if(req.url=="/"){
    if(req.session.user==undefined || req.session.user._id==undefined){
      next();
      return;
    }
    else
      res.redirect('/dashboard');
  }    
  else{  
    if(req.session.user==undefined || req.session.user._id==undefined)
      res.redirect('/');
    else{
      const db = req.app.locals.db;
      _grupId=req.session.user.grup;
      if(_grupId==undefined){
        res.redirect('/');
        return;
      }
      _yetkiGrubu=await db.collection("Yetki Grupları").findOne({'_id': ObjectId(_grupId)});
      if(_yetkiGrubu==null){
        res.redirect('/');
        return;
      } 
      var str = decodeURIComponent(req.url).substring(1);
      if(str.substring(0,5)=='Form/'){
        var searchIndex=(str.substring(5,str.length)).search('/');
        if( searchIndex != -1)
          str='Form/'+(str.substring(5,str.length)).substring(0, searchIndex);
      }
      else if(str.search('/') != -1)
        str = str.substring(0, str.search('/'));
      result=(await db.collection("Sayfalar").findOne({'link': str}));
      if(result==null){
        res.redirect('/');
        return;
      }
      _ID=result._id;
      boolean=false;
      for(val of _yetkiGrubu.allowedCollection){
        if(val.collectionId==_ID)
          {
            //render menu items
            var _data=[]
            for(items of _yetkiGrubu.allowedCollection){
              r=(await db.collection("Sayfalar").findOne({'_id': ObjectId(items.collectionId)}));
              if(r!=null && r!=undefined)
                _data.push({text:r.pageName,icon:r.icon,link:r.link});
            }
            res.locals.menu=_data;
            boolean=true;
            break;
          }
      }
      if(boolean)
        next();
      else
        res.redirect('/');
    }
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
