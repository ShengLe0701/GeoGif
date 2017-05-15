'use strict';
app.factory('sessionService',['$http',function($http){
	return{
		set:function(key,value){
			return sessionStorage.setItem(key,value);
			
		},
		get:function(key){
			return sessionStorage.getItem(key);
			
		},
		destroy:function(key){
			$http.post('mahidanaApi/destroy_session.php');
			return sessionStorage.removeItem(key);
			
		},
		remove:function(key){
			return sessionStorage.removeItem(key);
			
		}
	};
}])