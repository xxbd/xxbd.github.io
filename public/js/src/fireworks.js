<script type="text/javascript">  
  $('body').on('click',function(e){  
    var offset = $(this).offset();  
    var target = e.target;  
    if (target.tagName.toLowerCase() !== 'button') return false; //非button 则阻止  
    var rect = target.getBoundingClientRect();  
    var x = e.pageX;  
    var y = e.pageY;  
    var ripple = $('<span class="ripple"></span>');  
    ripple.css('width',Math.max(rect.width,rect.height));  
    ripple.css('height',Math.max(rect.width,rect.height));  
    ripple.appendTo(target).css({  
      left: (x  - offset.left - rect.left - ripple.width()/2) + 'px',  
      top : (y - offset.left - rect.top - ripple.height()/2) + 'px'        
    });  
  })  
</script>  