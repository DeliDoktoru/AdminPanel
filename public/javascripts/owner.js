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
    
});
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