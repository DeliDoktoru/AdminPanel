    
    
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
    viewGenerator=async function(_page,_db,_url){
        var _headers="<tr>";
        var _body="";
        for(item of _page.content){
            if(_page.viewable.indexOf(item.key)!=-1)
            _headers+=`<th>${item.text}</th>`
        }
        _headers+="</tr>";
        var arr=await _db.collection(_page.collection).find({}).toArray();
        for(val of arr){
            var tmp=`<tr data-id="${val._id}" onclick="location.href='${_url}/${val._id}'">`; 
            for(item of _page.viewable){
                tmp+=`<td>${val[item]}</td>`
            }
            tmp+="</tr>";
            _body+=tmp;
        }
        _txt=`
            <table class="table ">
                <thead>
                ${_headers}
                </thead>
                <tbody>
                ${_body}
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
            if(item.type=="boolean")
                item.type="checkbox";
            if(item.type=="checkbox"){
                var selectItems=[{key:"Evet",value:"true"},{key:"Hayır",value:"false"}];
                var selectTxt="<option value='' >Seçiniz..</option>";
                for(val of selectItems)
                {
                    selectTxt+=`<option value="${val.value}" ${item.value==val.value?"selected":""}>${val.key}</option>`
                }
                _txt+=`
                <div class="col-md-${item.size}">
                    
                    <div class="form-group">
                        <label> ${item.text} </label>
                        <select type="${item.type}" class="form-control" data-key="${item.key}" ${item.required?"enforced":""}>
                           ${selectTxt}
                        </select>
                    </div> 
                </div>    
                `;

            }
            else if(item.type=="select"){
                var selectItems=[];
                if(item.special!=undefined && item.special!=""){
                    switch(item.special) {
                        case "allCollections":
                          var tmp= await _db.listCollections().toArray();
                          for(val of tmp){
                            selectItems.push({key: val.name,value: val.name});
                          }
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
                    var viewable=(await _db.collection("Sayfalar").findOne({'collection':item.target})).viewable;
                    for(val of tmp){
                        var tmpKey="";
                        for(val2 of viewable){
                            tmpKey+=val[val2]+" "        
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
                <div class="row pb-1 pt-2 gainsboro" index="%index%"  >
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
                    <div class="row pb-1 pt-2 gainsboro card" index="${i}"  >
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
                <div class="col-md-${item.size}">
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