
var editor;
var backPageUrl;
$(function() {
    //<notfication
    if(Cookies.get('color')!==undefined && Cookies.get('color')!==undefined){
      demo.showNotification('top','right',Cookies.get('color'),Cookies.get('message'));
      Cookies.remove('color');
      Cookies.remove('message');}
    //>
    //<menu seçiminde seçileni active yapma
    var str=decodeURIComponent(window.location.pathname).substring(1);
    if(str.search('/')!=-1)
        str=str.substring(0,str.search('/'))
    $(".nav>li>a[href='/"+str+"']").parent().addClass("active")
    //>
    //<menu başlığı
    var str=decodeURIComponent(window.location.pathname),matches=[],tmp="",links=[];
    for (var i = 0; i < str.length; i++) {
        if(str[i]=='/')
        matches.push(i)
      }
    var arrayText= str.split('/');
    for (var i = 0; i < arrayText.length; i++) {
        if(arrayText[i]!=''){
          tmp+=`●<a class='.navbar-brand' href='${str.substring(0,matches[i])}'>${(arrayText[i].charAt(0).toUpperCase() + arrayText[i].slice(1)).replaceAll("_"," ")} </a>`
          links.push(str.substring(0,matches[i]));
        }
      }  
    if(links === undefined || links.length == 0 || links[links.length-2]===undefined)
      backPageUrl="/";
    else
      backPageUrl=links[links.length-2];    
    $(".content-title").html(tmp);
    //>
    //<json editor
    var container = document.getElementById("jsoneditor");
    if(container!=undefined){
        var json = JSON.parse(container.getAttribute("data"));
        container.removeAttribute("data");
        _id=json._id;
        delete json["_id"];
        var options = {};
        if(container.getAttribute("readOnly")=="true")
          options.mode='view';
        editor = new JSONEditor(container, options);
        editor.set(json);
        
    }
    //>
    //<form buttons
      $("body").delegate("button[action-method]","click",function(){
        _method=$(this).attr("action-method");
        if(_method=="addArrayItem"){
          _target=$(this).attr("action-target");
          _index=$(this).parent().parent().find(".row").last().attr("index");
          if(_index==undefined || _index=="")
            _index=1;
          else
            _index=parseInt(_index)+1;  
          _item=_contentArray[_target].replaceAll("%index%",_index);
          $(this).parent().parent().find(`div[data-key='${_target}']`).append(_item);
        }
        else if(_method=="deleteArrayItem"){
          _this=this;
          $.confirm({
            content:"",
            theme: 'material',
            type: 'red',
            title: 'Emin misiniz?',
            buttons: {
                confirm: {
                  btnClass: 'btn-red',
                  text: 'Evet',
                  action: function(){
                    $(_this).parent().parent().remove();
                  }
                },
                cancel:  {
                  btnClass: 'btn-default',
                  text: 'Hayır',
                  action: function(){
                  }
                }
            }
          });
        }
        else if(_method=="create"){
          _collection=$(this).attr("collection");
          changeDocument(_method,"",_collection,viewToJson());

        }
        else if(_method=="update"){
          _collection=$(this).attr("collection");
          _id=$(this).attr("id");
          changeDocument(_method,_id,_collection,viewToJson());
        }
        else if(_method=="delete"){
          _collection=$(this).attr("collection");
          _id=$(this).attr("id");
          changeDocument(_method,_id,_collection,viewToJson());
        }
      });
    //>
   
});
 //<form view ini json çevirme 
 var resultData={}; 
 function viewToJson(row,data){
  if(row==undefined)
    row=$(".row").eq(0);
  if(data==undefined)
    data=resultData;
  $(row).find(">div>.form-group>[type]").each(function(){
    _key=$(this).attr("data-key");
    if($(this).attr("type")=="array"){
      data[_key]=[];
      _row=$(this).find(">.row");
      for(var i=0;i<_row.length;i++){
        //recusive de değişkenler kaybolmaması için farklı bi değişkende tutuyorum tmp1 / tmp2
        var tmp2=_key;
        data[_key][i]={}
        var tmp1=_row;
        viewToJson(_row[i],data[_key][i]);
        _row=tmp1;
        _key=tmp2;
      }

    }
    else{
      data[_key]=$(this).val();
    }  
       
  });
  return data;
}
//>
//< database document işlemleri
changeDocument=function(_method,_id,_collection,_data){
  data={};

  if(_id!="")
    data.id=_id;

  data.method=_method;
  data.collection=_collection;

  if(_data!="")
    data.items=JSON.stringify(_data);

    _ajax={
      type:"POST", 
      url:"/changeDocument",
      data: data,
      dataType: "json", 
      success:function(result){
        Cookies.set('color',result.color);
        Cookies.set('message',result.message);
        
        if(_method=="delete")
          location.reload(); 
        else
          location.href=backPageUrl;
        
        console.log(result);
      }
    }

  if(_method=="delete"){
    $.confirm({
      content:"",
      theme: 'material',
      type: 'red',
      title: 'Emin misiniz?',
      buttons: {
          confirm: {
            btnClass: 'btn-red',
            text: 'Evet',
            action: function(){
              $.ajax(_ajax);
            }
            
          },
          cancel:  {
            btnClass: 'btn-default',
            text: 'Hayır',
            action: function(){
            }
          }
      }
    });
  }
  else{
    $.ajax(_ajax);
  }
}

//>
//< database collection işlemleri
changeCollection=function(_method,_collectionName,_oldCollectionName,_options){
  data={};

  data.collectionName=_collectionName;
  if(_oldCollectionName!="")
    data.oldCollectionName=_oldCollectionName;

  data.method=_method;

  if(_options!=""){
    for(val of Object.keys(_options) ){
      if(_options[val]=="")
        delete _options[val];
    } 
    data.options=JSON.stringify(_options);
  }
    _ajax={
      type:"POST", 
      url:"/changeCollection",
      data: data,
      dataType: "json", 
      success:function(result){
        Cookies.set('color',result.color);
        Cookies.set('message',result.message);
        
        if(_method=="delete")
          location.reload(); 
        else
          location.href=backPageUrl;
        
        console.log(result);
      }
    }

  if(_method=="delete"){
    $.confirm({
      content:"",
      theme: 'material',
      type: 'red',
      title: 'Emin misiniz?',
      buttons: {
          confirm: {
            btnClass: 'btn-red',
            text: 'Evet',
            action: function(){
              $.ajax(_ajax);
            }
            
          },
          cancel:  {
            btnClass: 'btn-default',
            text: 'Hayır',
            action: function(){
            }
          }
      }
    });
  }
  else{
    $.ajax(_ajax);
  }
}
//>