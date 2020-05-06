'use strict'

{
    $(document).ready(function(){
        $('#open-nav').on('click', function() {
            $('#wrapper, #nav').toggleClass('show');
        });
    });
}