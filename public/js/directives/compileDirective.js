'use strict';

app.directive('compileData', function($compile) {
    return {
        scope: true,
        link: function(scope, element, attrs) {

            var elmnt;

            attrs.$observe('template', function(myTemplate) {
                if (angular.isDefined(myTemplate)) {
                    // compile the provided template against the current scope
                    elmnt = $compile(myTemplate)(scope);

                    element.html(""); // dummy "clear"

                    element.append(elmnt);
                }
            });
        }
    };
});