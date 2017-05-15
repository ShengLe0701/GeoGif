

function app() {
 $.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        $(this).addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});

function showSpinner(){
$('#body').addClass( "bodyspinning" );
$('#spinner').show();
}
	function hideSpinner(){
$('#body').removeClass( "bodyspinning");
$('#spinner').hide();
}
}

document.addEventListener('DOMContentLoaded', app, false);
