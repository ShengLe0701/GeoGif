'use strict';



// Declare app level module which depends on views, and components
var app = angular.module('GPSApp', ['ngRoute', 'ngCookies', 'ngSanitize', 'ngS3upload', 'angular-thumbnails']);
app.
config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {

    $routeProvider.when('/manage', {
        templateUrl: 'view/manage.html',
        controller: 'ManageCtrl'
    });
    $routeProvider.when('/login', {
        templateUrl: 'view/login.html',
        controller: 'loginCtrl'
    });
    $routeProvider.when('/viewmap', {
        templateUrl: 'view/viewmap.html',
        controller: 'viewmapCtrl'
    });
    $routeProvider.when('/createfilter', {
        templateUrl: 'view/tab.html',
        controller: 'createfilterCtrl'
    });
    $routeProvider.when('/tab2', {
        templateUrl: 'view/tab2.html',
        controller: 'tab2Ctrl'
    });
    $routeProvider.when('/tab3', {
        templateUrl: 'view/tab3.html',
        controller: 'tab3Ctrl'
    });
    $routeProvider.when('/tab4', {
        templateUrl: 'view/tab4.html',
        controller: 'tab4Ctrl'
    });
    $routeProvider.when('/forgot_pass', {
        templateUrl: 'view/forgot_password.html',
        controller: 'emailctrl'

    });

    $httpProvider.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
    $routeProvider.otherwise({ redirectTo: '/login' });


}])

/*
app.run(function($rootScope,$location,loginService){
	var routespermission=['/listing'];
	$rootScope.$on('$routeChangeStart',function(){
		
		if(routespermission.indexOf($location.path())!= -1 ){
			var connected=loginService.islogged();
			connected.then(function(msg){
				if(!msg.data) $location.path('/');
			});
			
		}
	});
	
});  */

app.run(['$rootScope', '$location', '$cookieStore', '$http',
    function($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('GPS_globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line

        }

        $rootScope.$on('$locationChangeStart', function(event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                if ($location.path() == '/forgot_pass') {
                    $location.path('/forgot_pass');
                } else {
                    $location.path('/login');
                }

            }
        });
    }
]);