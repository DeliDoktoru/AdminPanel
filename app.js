var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var ObjectId = require('mongodb').ObjectID;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//morgan loger customize
app.use(logger('dev', {
  skip: function (req, res) { return req.url.search("public")!=-1  }
}));

app.use(session({
  secret:'3D75D274B997B53CFD2892F69F54BC28',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true }
}));

//permission control
function checkAllowed(txt){
  var arr=["public","ajax"];
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
    if(req.session.user==undefined || req.session.user._id==undefined)
      next();
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
      if (str.search('/') != -1)
        str = str.substring(0, str.search('/'));
      result=(await db.collection("Sayfalar").findOne({'pageName': str}));
      if(result==null){
        res.redirect('/');
        return;
      }
      _ID=result._id
      for(val of _yetkiGrubu.allowedCollection){
        if(val.collectionId==_ID)
          {
            next();
            return;
          }
      }
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
