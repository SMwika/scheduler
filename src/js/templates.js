$(function () {
    
    var i, z, 
        rawTmpls = [
			"loading",
			"scheduleApptSingle"
        ];
    
    if ( $('body').data('env') === 'dev' ) {
        
        // Dev env, load all scripts
        z = rawTmpls.length;
        
        var appendTmpl = function (tmpl) {
            $.ajax({
                url: 'src/templates/'+tmpl+'.tpl',
                async: false,
                success: function (data) {
                    $('#templates').append("<script type=\"text/template\" id=\""+tmpl+"\">"+data+"</script>"); 
                }
            });
        };
        
        for (i=0; i<z; i++) {
            appendTmpl(rawTmpls[i]);
        }
        
        
    } else {
        
        // Production, load compiled
        $.ajax({
            url: 'dist/templates/system.tpl',
            async: false,
            success: function (data) {
                $('#templates').append(data); 
            }
        });
        
    }
    
});