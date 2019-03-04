
module.exports={
    inputGenerator:function(_array){
        var txt="";
        _array=_array.sort((a, b) => (a.rank > b.rank) ? 1 : -1)
        for(item of _array){
            if(item.value==undefined)
              item.value="";    
            if(item.type=="boolean")
                item.type="checkbox";
            if(item.type=="checkbox"){
                selectItems=[{key:"Evet",value:"true"},{key:"Hayır",value:"false"}];
                selectTxt="";
                for(val of selectItems)
                {
                    selectTxt+=`<option value="${val.value}" ${item.value==val.value?"selected":""}>${val.key}</option>`
                }
                txt+=`
                <div class="col-md-${item.size}">
                    <div class="form-group">
                        <label> ${item.text} </label>
                        <select collector class="form-control" data-key="${item.key}">
                           ${selectTxt}
                        </select>
                    </div> 
                </div>    
                `;

            }
            else if(item.type=="select"){

            }    
            else{
                txt+=`
                <div class="col-md-${item.size}">
                    <div class="form-group">
                        <label> ${item.text} </label>
                        <input collector type="${item.type}" class="border-input form-control" data-key="${item.key}" value="${item.value}"></input>
                    </div>
                </div>
                    
                    `;
            }
    
        }
        return txt;
    }
}