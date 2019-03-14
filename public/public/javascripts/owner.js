

var editor;
var backPageUrl;
//pagination sıra ve max
var pageIndex = 0, total = 5;
var pr = document.querySelector( '.paginate.left' );
var pl = document.querySelector( '.paginate.right' );

$(function () {
  //<pagination
    

    function slide(offset) {
      
      pageIndex = Math.min( Math.max( pageIndex + offset, 0 ), total - 1 );
      $(".counter").attr("value",pageIndex+1);
      document.querySelector( '.counter' ).innerHTML = ( pageIndex + 1 ) + ' / ' + total;

      pr.setAttribute( 'data-state', pageIndex === 0 || pageIndex ===-1? 'disabled' : '' );
      pl.setAttribute( 'data-state', pageIndex === total - 1 ? 'disabled' : '' );
    }
    if(pr!=null && pl !=null ){
      pr.onclick = slide.bind( this, -1 );
      pl.onclick = slide.bind( this, 1 );
      slide(0);
    }
    
  //>
  //<notfication
  if (Cookies.get('color') !== undefined && Cookies.get('color') !== undefined) {
    showNotification('top', 'right', Cookies.get('color'), Cookies.get('message'));
    Cookies.remove('color');
    Cookies.remove('message');
  }
  //>
  //<menu seçiminde seçileni active yapma
  var str = decodeURIComponent(window.location.pathname).substring(1);
  if (str.search('/') != -1)
    str = str.substring(0, str.search('/'))
  $(".nav>li>a[href='/" + str + "']").parent().addClass("active")
  //>
  //<menu başlığı
  var str = decodeURIComponent(window.location.pathname),
    matches = [],
    tmp = "",
    links = [];
  for (var i = 0; i < str.length; i++) {
    if (str[i] == '/')
      matches.push(i)
  }
  var arrayText = str.split('/');
  for (var i = 0; i < arrayText.length; i++) {
    if (arrayText[i] != '') {
      tmp += `<i class="ti-angle-right"></i><a class='.navbar-brand' href='${str.substring(0,matches[i])}'>${(arrayText[i].charAt(0).toUpperCase() + arrayText[i].slice(1)).replaceAll("_"," ")} </a>`
      links.push(str.substring(0, matches[i]));
    }
  }
  if (links === undefined || links.length == 0 || links[links.length - 2] === undefined)
    backPageUrl = "/";
  else
    backPageUrl = links[links.length - 2];
  $(".content-title").html(tmp);
  //>
  //<json editor
  var container = document.getElementById("jsoneditor");
  if (container != undefined) {
    var json = JSON.parse(container.getAttribute("data"));
    container.removeAttribute("data");
    _id = json._id;
    delete json["_id"];
    var options = {};
    if (container.getAttribute("readOnly") == "true")
      options.mode = 'view';
    editor = new JSONEditor(container, options);
    editor.set(json);

  }
  //>
  //<form buttons
  $("body").delegate("button[action-method]", "click", function () {
    _method = $(this).attr("action-method");
    if (_method == "addArrayItem") {
      _target = $(this).attr("action-target");
      _index = $(this).parent().parent().find(".row").last().attr("index");
      if (_index == undefined || _index == "")
        _index = 1;
      else
        _index = parseInt(_index) + 1;
      _item = _contentArray[_target].replaceAll("%index%", _index);
      $(this).parent().parent().find(`div[data-key='${_target}']`).append(_item);
    } else if (_method == "deleteArrayItem") {
      _this = this;
      $.confirm({
        content: "",
        theme: 'material',
        type: 'red',
        title: 'Emin misiniz?',
        buttons: {
          confirm: {
            btnClass: 'btn-red',
            text: 'Evet',
            action: function () {
              $(_this).parent().parent().remove();
            }
          },
          cancel: {
            btnClass: 'btn-default',
            text: 'Hayır',
            action: function () {}
          }
        }
      });
    } else if (_method == "create") {
      _collection = $(this).attr("collection");
      changeDocument(_method, "", _collection, viewToJson());

    } else if (_method == "update") {
      _collection = $(this).attr("collection");
      _id = $(this).attr("id");
      changeDocument(_method, _id, _collection, viewToJson());
    } else if (_method == "delete") {
      _collection = $(this).attr("collection");
      _id = $(this).attr("id");
      changeDocument(_method, _id, _collection, viewToJson(),true);
    }
  });
  //>

});
 //<Çıkış yap
 function exit(){
  $.ajax({
    type:"POST", 
    url:"/ajax/exit",
    dataType: "json", 
    success:function(result){
        showNotification('top','right',result.color,result.message);
        if(result.status)
            location.href="/";
    },
    error: function (jqXHR, exception) {
        console.log(jqXHR);
        console.log(exception);
    }
}); 
 }
 //>
 //<zorunlu alan kontrolu
 function enforcedControl(){
  var result=false;
  $("[enforced]").each(function(){
    if($(this).val()=="" || $(this).val()==undefined || $(this).val()==null){
      result=true;
      $(this).css("border-bottom", "2px solid red");
    }
  });
  if(result)
    showNotification('top', 'right', 'danger', 'Zorunlu alanları doldurmanız gerekmektedir.');
  return result;
 }
 $("body").delegate("[enforced]", "change keyup paste", function (){
   if($(this).val()!="" && $(this).val()!=undefined && $(this).val()!=null)
    $(this).css("border-bottom", "");
 });
 //>
 //<max min kontrolu
 function maxMinControl(){
  var result=false,kucuk=false,buyuk=false,fazlaKarakter=false,azKarakter=false;
  $("[max],[min]").each(function(){
    if($(this).val()!="" && $(this).val()!=undefined && $(this).val()!=null){
      if($(this).attr("max")!=undefined)
      {
        var _max=parseInt($(this).attr("max"));

        if($(this).attr("type")=="number")
        {
          var tmp=parseInt($(this).val());
          if(!isNaN(_max) && !isNaN(tmp) && tmp > _max)
          {
            $(this).css("border-bottom", "2px solid red");
            buyuk=true;
            result=true;
          }
        }
        else
        {
          if(!isNaN(_max) && $(this).val().length > _max)
          {
            $(this).css("border-bottom", "2px solid red");
            fazlaKarakter=true;
            result=true;
          }

        }
      
      }
      if($(this).attr("min")!=undefined)
      {
        _min=parseInt($(this).attr("min"));
        if($(this).attr("type")=="number")
        {
          var tmp=parseInt($(this).val());
          if(!isNaN(_min) && !isNaN(tmp) && tmp < _min)
          {
            $(this).css("border-bottom", "2px solid blue");
            kucuk=true;
            result=true;
          }
        }
        else
        {
          if(!isNaN(_min) && $(this).val().length < _min)
          {
            $(this).css("border-bottom", "2px solid blue");
            azKarakter=true;
            result=true;
          }
        }
      }
    }
  });
  if(azKarakter)
    showNotification('top', 'right', 'info', 'Girdiğiniz Karakter Sayısı Yeterli Değil.');
  if(fazlaKarakter)
    showNotification('top', 'right', 'danger', 'Girdiğiniz Karakter Sayısı Çok Fazla.');
  if(kucuk)
    showNotification('top', 'right', 'info', 'Girdiğiniz Değer Yeterli Değil.');
  if(buyuk)
    showNotification('top', 'right', 'danger', 'Girdiğiniz Değer Fazla.');
  return result;
 }
 $("body").delegate("[enforced]", "change keyup paste", function (){
   if($(this).val()!="" && $(this).val()!=undefined && $(this).val()!=null)
    $(this).css("border-bottom", "");
 });
 //>
//<bütün kontroller
function controls(){
  return (enforcedControl() || maxMinControl())
}
//>
//<loading animasyonu
var stop = false;
var _height = $(window).height();
var _width = $(window).width();

function startLoading() {
  var h = Math.floor(Math.random() * _height) + 1;
  var w = Math.floor(Math.random() * _width) + 1;
  $("body").append(`
     <div class="lds-ripple" style="top:${h}px;left:${w}px">
         <div></div>
         <div></div>
     </div>
     `);
  if (!stop)
    setTimeout(startLoading, 1000);

}

function stopLoading() {
  stop = true;
  setTimeout(function () {
    $(".lds-ripple").remove();
  }, 1000);

}

//>
//<form view ini json çevirme 
var resultData = {};

function viewToJson(row, data) {
  if (row == undefined)
    row = $(".row").eq(0);
  if (data == undefined)
    data = resultData;
  $(row).find(">div>.form-group>[type]").each(function () {
    _key = $(this).attr("data-key");
    if ($(this).attr("type") == "array") {
      data[_key] = [];
      _row = $(this).find(">.row");
      for (var i = 0; i < _row.length; i++) {
        //recusive de değişkenler kaybolmaması için farklı bi değişkende tutuyorum tmp1 / tmp2
        var tmp2 = _key;
        data[_key][i] = {}
        var tmp1 = _row;
        viewToJson(_row[i], data[_key][i]);
        _row = tmp1;
        _key = tmp2;
      }

    } else if ($(this).attr("type") == "password") {
      data[_key] = MD5($(this).val());
    }else if($(this).attr("type") == "select"){
      if($(this).val()=="true")
        data[_key]=true;
      else if($(this).val()=="false")
        data[_key]=false;
      else
        data[_key]=$(this).val();
    }else if($(this).attr("type") == "number"){
      data[_key]=parseFloat($(this).val().replaceAll(",","."));
    }
    else {
      data[_key] = $(this).val();
    }

  });
  return data;
}
//>
//<database document filter
var query={filter:{},limit:10,page:1,sort:{}};
$("body").delegate("thead>tr>th>[sort]","click",function(){
  _key=$(this).attr("sort");
  if(query.sort[_key]==undefined)
    query.sort[_key]=1;
  else
    query.sort[_key]=query.sort[_key]*-1;
  applyFilter();
});
$("body").delegate("thead>tr>th>[type]","change",function(){
  _key=$(this).attr("data-key");
   if($(this).attr("type")=="number")
   {
    query.filter[_key]={};
    var _max=parseFloat($(`[data-key='${_key}'][m='max']`).val().replaceAll(",","."));
    var _min=parseFloat($(`[data-key='${_key}'][m='min']`).val().replaceAll(",","."));
    if(!isNaN(_max) && _max!=null)
      query.filter[_key].$lte=_max;
    else
      delete query.filter[_key].$lt;
    if(!isNaN(_min) && _min!=null)
      query.filter[_key].$gte=_min;
    else      
      delete query.filter[_key].$gt;
    if(jQuery.isEmptyObject(query.filter[_key]))  
      delete query.filter[_key];
  } 
  else if($(this).val()=="")
  {
    delete query.filter[_key]
  }
  else
  {
    if($(this).attr("type")=="text")
      query.filter[_key]={ $regex: `.*${$(this).val()}.*`,$options: 'i'};
     
    else 
      query.filter[_key]=$(this).val();
  }
  //pagination
  pageIndex=0;
  pr.setAttribute( 'data-state', 'disabled' );
  applyFilter();
});
$("body").delegate(".paginate","click",function(){
  if($(this).attr("data-state")!="disabled"){
    applyFilter();
  }
})
$("body").delegate("[key='limit']","change",function(){
  //pagination
  pageIndex=0;
  pr.setAttribute( 'data-state', 'disabled' );
  applyFilter();
})
function applyFilter(){
  var _data={};
  _data.collection=$("[collection]").attr("collection");
  
  query.limit=parseInt($("[key='limit']").val());
  query.page=pageIndex+1;
  _data.query=JSON.stringify(query);
  $.ajax({
    type:"POST", 
    url:"/ajax/filter",
    dataType: "json", 
    data: _data,
    success:function(result){
       if(result.data.body=="")
        pageIndex=-1;
       $(".table tbody").html(result.data.body);
       //pagination
       total=result.data.maxPage;
       document.querySelector('.counter').innerHTML = (pageIndex+1) + ' / ' + result.data.maxPage;
       pl.setAttribute( 'data-state', pageIndex === total - 1 ? 'disabled' : '' );
    },
    error: function (jqXHR, exception) {
        console.log(jqXHR);
        console.log(exception);
    }
}); 
}
//>
//< database document işlemleri
changeDocument = function (_method, _id, _collection, _data,goBackPage) {
  if(_method!="delete" && controls())
    return;
  if(goBackPage==undefined)
    goBackPage=false;
  data = {};

  if (_id != "")
    data.id = _id;

  data.method = _method;
  data.collection = _collection;

  if (_data != "")
    data.items = JSON.stringify(_data);

  _ajax = {
    type: "POST",
    url: "/ajax/changeDocument",
    data: data,
    dataType: "json",
    success: function (result) {
      Cookies.set('color', result.color);
      Cookies.set('message', result.message);
      if(goBackPage)
        location.href = backPageUrl;
      else if (_method == "delete" )
        location.reload();
      else
        location.href = backPageUrl;

      console.log(JSON.stringify(result));
    }
  }

  if (_method == "delete") {
    $.confirm({
      content: "",
      theme: 'material',
      type: 'red',
      title: 'Emin misiniz?',
      buttons: {
        confirm: {
          btnClass: 'btn-red',
          text: 'Evet',
          action: function () {
            $.ajax(_ajax);
          }

        },
        cancel: {
          btnClass: 'btn-default',
          text: 'Hayır',
          action: function () {}
        }
      }
    });
  } else {
    $.ajax(_ajax);
  }
}

//>
//< database collection işlemleri
changeCollection = function (_method, _collectionName, _oldCollectionName, _options) {
  if(_method!="delete" && controls())
    return;
  data = {};

  data.collectionName = _collectionName;
  if (_oldCollectionName != "")
    data.oldCollectionName = _oldCollectionName;

  data.method = _method;

  if (_options != "") {
    for (val of Object.keys(_options)) {
      if (_options[val] == "")
        delete _options[val];
    }
    data.options = JSON.stringify(_options);
  }
  _ajax = {
    type: "POST",
    url: "/ajax/changeCollection",
    data: data,
    dataType: "json",
    success: function (result) {
      Cookies.set('color', result.color);
      Cookies.set('message', result.message);

      if (_method == "delete")
        location.reload();
      else
        location.href = backPageUrl;

      console.log(JSON.stringify(result));
    }
  }

  if (_method == "delete") {
    $.confirm({
      content: "",
      theme: 'material',
      type: 'red',
      title: 'Emin misiniz?',
      buttons: {
        confirm: {
          btnClass: 'btn-red',
          text: 'Evet',
          action: function () {
            $.ajax(_ajax);
          }

        },
        cancel: {
          btnClass: 'btn-default',
          text: 'Hayır',
          action: function () {}
        }
      }
    });
  } else {
    $.ajax(_ajax);
  }
}
//>