<?php

$api = app('Dingo\Api\Routing\Router');

$api->version('v1', function ($api) {

/*
	$api->post('auth/login', 'App\Api\V1\Controllers\AuthController@login');
	$api->post('auth/signup', 'App\Api\V1\Controllers\AuthController@signup');
*/

	$api->post('auth/login', 					'App\Api\V1\Controllers\AuthController@login');
	$api->post('auth/signup', 				'App\Api\V1\Controllers\AuthController@signup');
	$api->post('auth/recovery', 			'App\Api\V1\Controllers\AuthController@recovery');
	$api->post('auth/reset', 					'App\Api\V1\Controllers\AuthController@reset');
	$api->post('auth/logout', 				'App\Api\V1\Controllers\AuthController@logout');
	$api->post('auth/getuser', 				'App\Api\V1\Controllers\AuthController@getuser');
	$api->post('auth/removeuser', 		'App\Api\V1\Controllers\AuthController@removeuser');
	$api->post('auth/updateuser', 		'App\Api\V1\Controllers\AuthController@updateuser');


	$api->post('filter/getfilter', 		'App\Api\V1\Controllers\FilterController@getfilter');
	$api->post('filter/getpublicfilter', 		'App\Api\V1\Controllers\FilterController@getpublicfilter');
	$api->get('filter/getpublicfilter', 		'App\Api\V1\Controllers\FilterController@getpublicfilter');
	$api->post('filter/getprivatefilter', 		'App\Api\V1\Controllers\FilterController@getprviatefilter');
	$api->get('filter/getprivatefilter', 		'App\Api\V1\Controllers\FilterController@getprviatefilter');
	$api->post('filter/getfilterwithid', 		'App\Api\V1\Controllers\FilterController@getfilterwithid');
	$api->post('filter/getfilterwithname', 		'App\Api\V1\Controllers\FilterController@getfilterwithname');
	$api->post('filter/getfilterwithlocation', 		'App\Api\V1\Controllers\FilterController@getfilterwithlocation');
	$api->post('filter/addfilter', 		'App\Api\V1\Controllers\FilterController@addfilter');
	$api->post('filter/removefilter', 'App\Api\V1\Controllers\FilterController@removefilter');
	$api->post('filter/updatefilter', 'App\Api\V1\Controllers\FilterController@updatefilter');

	$api->post('aws/uploadtoken', 'App\Api\V1\Controllers\AWSBucketController@getUploadingToken');
//	$api->get('aws/uploadtoken', 'App\Api\V1\Controllers\AWSBucketController@getUploadingToken');

	// example of protected route
	$api->get('protected', ['middleware' => ['api.auth'], function () {
		return \App\User::all();
    }]);

	// example of free route
	$api->get('free', function() {
		return \App\User::all();
	});

});
