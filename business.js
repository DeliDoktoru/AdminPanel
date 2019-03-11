var pmongo = require('promised-mongo'); 
    
    setValuesToinputs=function(inputs,values){
        for(var i=0;i<inputs.length;i++){
            if(inputs[i].type=="array"){
                if(values[inputs[i].key]==undefined)
                    continue;
                inputs[i].value=[];
                for(val of values[inputs[i].key]){
                    inputs[i].value.push(val);
                }
            }
            else{
                inputs[i].value=values[inputs[i].key];
            }
            
        }
        return inputs;
    }
    viewHeaderGenerator=async function(_page,_db,_url){
        var _headers="<tr>";
        for(item of _page.content){
            if(item.tableViewable){
                if(item.type=="select"){
                    var selectItems=[],selectTxt="<option value='' >Seçiniz..</option>";
                    if(item.target!=undefined && item.target!=""){
                        var tmp=await _db.collection(item.target).find({}).toArray();
                        var re=(await _db.collection("Sayfalar").findOne({'collection':item.target})).content;
                        for(val of tmp){
                            var tmpKey="";
                            for(val2 of re){
                                if(val2.formViewable)
                                    tmpKey+=val[val2.key]+" "        
                            }
                            selectItems.push({key:tmpKey,value:val._id});
                        }
                        
                    }
                    else if(item.fixedData!=undefined && item.fixedData!=""){
                        selectItems= (await _db.collection("Sabit Seçim Verileri").findOne({"name":item.fixedData})).content;
                    }
                    for(val of selectItems){
                        selectTxt+=`<option value="${val.value}">${val.key}</option>`
                    } 
                    _headers+=`  
                    <th><select type="${item.type}" data-key="${item.key}" >
                        ${selectTxt}
                    </select><br><br><span>${item.text}</span></th>`
                }
                else
                    _headers+=`<th><input type="${item.type}" data-key="${item.key}"></input><br><br><span>${item.text}</span></th>`;
            }
                
        }
        _headers+="</tr>";
        return _headers;

    }
    viewBodyGenerator=async function(_page,_db,_url,_query){
        var _body="";
        if(_query==undefined)
            _query={};
        var arr=await _db.collection(_page.collection).find(_query).toArray();
        for(val of arr){
            var tmp=`<tr data-id="${val._id}" onclick="location.href='${_url}/${val._id}'">`; 
            for(item of _page.content){
                if(!item.tableViewable)
                    continue;
                if(item.type=="select"){
                    if(item.target!=undefined && item.target!=""){
                        var k=await _db.collection(item.target).findOne({_id:pmongo.ObjectId(val[item.key])});
                        var re=(await _db.collection("Sayfalar").findOne({'collection':item.target})).content;
                        var tmpKey="";
                        for(val2 of re){
                            if(val2.formViewable)
                                tmpKey+=k[val2.key]+" "        
                        }
                        tmp+=`<td>${tmpKey}</td>`;
                    }
                    else if(item.fixedData!=undefined && item.fixedData!=""){
                        var re=(await _db.collection("Sabit Seçim Verileri").findOne({"name":item.fixedData})).content;
                        for(i of re){
                            if(i.value==val[item.key]){
                                tmp+=`<td>${i.key}</td>`;
                                break;
                            }
                        }
                    }
                }
                else{
                tmp+=`<td>${val[item.key]}</td>`;
                }
            }
            tmp+="</tr>";
            _body+=tmp;
        }
        return _body;
    }
    viewGenerator=async function(_page,_db,_url,_query){
        var _txt=""
        
        //header
        header=await viewHeaderGenerator(_page,_db,_url);
        //body
        body=await viewBodyGenerator(_page,_db,_url,_query);
       
       
        _txt=`
            <table class="table">
                <thead>
                    ${header}
                </thead>
                <tbody>
                    ${body}
                </tbody>
            </table>
        
        `;
        return  {txt:_txt};
    }
    inputGenerator=async function(_array,_db){
        var _txt="";
        var _contentArray={};
        _array=_array.sort((a, b) => (a.rank > b.rank) ? 1 : -1)
        for(item of _array){
            if(item.value==undefined)
              item.value="";    
            if(item.type=="select"){
                var selectItems=[];
                if(item.special!=undefined && item.special!=""){
                    switch(item.special) {
                        case "allCollections":
                            var MongoClient = require("mongodb").MongoClient;
                            var config=require('./config');
                            MongoClient.connect("mongodb://"+config.database.url, { useNewUrlParser: true },async function(err, client){
                                if (err) 
                                console.log(err);
                                else {
                                db=client.db(config.database.dataBaseName);
                                var tmp= await _db.listCollections().toArray();
                                    for(val of tmp){
                                        selectItems.push({key: val.name,value: val.name});
                                    }
                                }
                            });
                            break;
                        default:
                          // code block
                      }
                }
                else if(item.fixedData!=undefined && item.fixedData!=""){
                    selectItems= (await _db.collection("Sabit Seçim Verileri").findOne({"name":item.fixedData})).content;
                }
                else if(item.target!=undefined && item.target!=""){
                    var tmp=await _db.collection(item.target).find({}).toArray();
                    var re=(await _db.collection("Sayfalar").findOne({'collection':item.target})).content;
                    for(val of tmp){
                        var tmpKey="";
                        for(val2 of re){
                            if(val2.formViewable)
                                tmpKey+=val[val2.key]+" "        
                        }
                        selectItems.push({key:tmpKey,value:val._id});
                    }
                }
                var selectTxt="<option value='' >Seçiniz..</option>";
                for(val of selectItems){
                    selectTxt+=`<option value="${val.value}" ${item.value==val.value?"selected":""}>${val.key}</option>`
                }
                _txt+=`
                <div class="col-md-${item.size}">
                    <div class="form-group">
                        <label> ${item.text} </label>
                        <select type="${item.type}"  class="form-control" data-key="${item.key}" ${item.required?"enforced":""}>
                           ${selectTxt}
                        </select>
                    </div> 
                </div>    
                `;
            } 
            else if(item.type=="array"){
                var arr=item.items;
                //recursive dönüşünde problem çıktığı için itemi saklamak için geçici tmp değişkenine atıyorum.
                var tmp=item;
                var tmpObj=await inputGenerator(arr,_db);
                
                _contentArray[tmp.key]=`
                <div class="row pb-1 pt-2 gainsboro card col-md-${item.size}  index="%index%"  >
                    <div class="col-md-12 text-right">
                        <button action-method="deleteArrayItem" action-target="${tmp.key}" index="%index%" class="ml-4 btn btn-sm btn-danger" type='button'> <i class="ti-angle-down mr-1"></i>Sil</button>
                    </div>
                    ${tmpObj.txt}
                </div>
                `;
                _contentArray=Object.assign(_contentArray,tmpObj.contentArray);
                var _fillArrayItems="";
                //burda tmp kullandım item yerine !!
                var i=1;
                for(val of tmp.value){
                    _arr=setValuesToinputs(arr,val);
                    _fillArrayItems+=`
                    <div class="row pb-1 pt-2 gainsboro card col-md-${item.size}" index="${i}"  >
                        <div class="col-md-12 text-right">
                            <button action-method="deleteArrayItem" action-target="${tmp.key}" index="${i}" class="ml-4 btn btn-sm btn-danger" type='button'> <i class="ti-angle-down mr-1"></i>Sil</button>
                        </div>
                        ${(await inputGenerator(_arr,_db)).txt}
                    </div>
                    `;
                    i++;
                }

                //recursive işlemler bitince tmpden geri alıyorum
                item=tmp;
                _txt+=`
                <div class="col-md-12">
                    <div class="form-group">
                        <label> ${item.text} </label>
                        <div data-key="${item.key}" type="array" style="padding:15px"> 
                            ${_fillArrayItems}
                        </div>
                    </div> 
                    <div class="col-md-12 text-left ">
                        <button action-method="addArrayItem" action-target="${item.key}" class="ml-4 btn btn-sm btn-success" type='button'> <i class="ti-angle-up mr-1"></i>Ekle</button>
                    </div>
                </div>    
                `;        
            }
            else if(item.type=="password"){
                _txt+=`
                <div class="col-md-${item.size}">
                    <div class="form-group">
                        <label> ${item.text} </label>
                        <input  type="${item.type}" class="border-input form-control" data-key="${item.key}" ${item.required?"enforced":""}></input>
                    </div>
                </div>
                    
                    `;
            }   
            else{
                _txt+=`
                <div class="col-md-${item.size}">
                    <div class="form-group">
                        <label> ${item.text} </label>
                        <input  type="${item.type}" class="border-input form-control" data-key="${item.key}" value="${item.value}" ${item.required?"enforced":""}></input>
                    </div>
                </div>
                    
                    `;
            }
    
        }
        return {txt:_txt,contentArray:_contentArray};
    }
    
module.exports={inputGenerator:inputGenerator,
                setValuesToinputs:setValuesToinputs,
                viewGenerator:viewGenerator
            }