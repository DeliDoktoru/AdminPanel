String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
function replaceElementTag(targetSelector, newTagString) {
	$(targetSelector).each(function(){
		var newElem = $(newTagString, {html: $(this).html()});
		$.each(this.attributes, function() {
			newElem.attr(this.name, this.value);
		});
		$(this).replaceWith(newElem);
	});
}
 function showNotification(from, align,renk,text){
    var icon="";  
      
    switch (renk) {
      case "success":
        icon="ti-check"
        break;
      case "danger":
        icon="ti-close"
        break;
      default:
        icon="ti-direction"
    }  
    $.notify({
        icon: icon,
        message: text

      },{
          type: renk,
          timer: 4000,
          placement: {
              from: from,
              align: align
          }
      });
	}