'use strict';
var user_id = "";
app.factory('AuthenticationService', ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout', function(Base64, $http, $cookieStore, $rootScope, $timeout) {

    var service = {};
    service.GetUrlInfo = function(callback) {
        $http.get("config.json")
            .success(function(data) {
                var res = { success: data };
                callback(res);
            })
            .error(function(response) {
                var res = {};
                res.message = 'There is not config file';
                callback(res);
            });


    };



    service.Login = function(username, password, callback) {
        var url = $rootScope.apiURL + '/api/auth/login';
        $http.post(url, { email: username, password: password })
            .success(function(response) {
                var res = { success: response.token };
                callback(res);
            })
            .error(function(response) {
                var res = {};
                res.message = 'Username or password is incorrect';
                callback(res);
            });


    };

    service.GetList = function(callback) {
        var url = $rootScope.apiURL + '/api/filter/getfilter';

        $http.post(url)
            .success(function(data) {
                //                console.log('data=' + JSON.stringify(data));
                var res = {};
                res.success = true;
                res.data = data;
                callback(res);
            })
            .error(function(err) {
                console.log(err);
                var res = {};
                res.success = false;
                res.data = err;
                callback(res);
            });


    };


    service.FilterDelete = function(Fid, callback) {
        var url = $rootScope.apiURL + '/api/filter/removefilter';

        $http.post(url, { id: Fid })
            .success(function() {
                var res = {};
                res.success = true;
                //    res.data = data;
                callback(res);
            })
            .error(function(err) {
                console.log(err);
                var res = {};
                res.success = false;
                res.data = err;
                callback(res);
            });


    };



    service.FilterUpdate = function(Fid, name, filterurl, start_date, start_time, end_date, end_time, location_name, location_iswholeworld, location_area, callback) {
        var url = $rootScope.apiURL + '/api/filter/updatefilter';

        $http.post(url, {
                id: Fid,
                name: name,
                url: filterurl,
                start_date: start_date,
                start_time: start_time,
                end_date: end_date,
                end_time: end_time,
                location_name: location_name,
                location_iswholeworld: location_iswholeworld,
                location_area: location_area
            })
            .success(function() {
                var res = {};
                res.success = true;
                //    res.data = data;
                callback(res);
            })
            .error(function(err) {
                console.log(err);
                var res = {};
                res.success = false;
                res.data = err;
                callback(res);
            });


    };



    service.FilterUpload = function(name, filterurl, start_date, start_time, end_date, end_time, location_name, location_iswholeworld, location_area, callback) {
        var apiurl = $rootScope.apiURL + '/api/filter/addfilter';

        $http.post(apiurl, {
                name: name,
                url: filterurl,
                start_date: start_date,
                start_time: start_time,
                end_date: end_date,
                end_time: end_time,
                location_name: location_name,
                location_iswholeworld: location_iswholeworld,
                location_area: location_area
            })
            .success(function() {
                var res = { success: true };
                console.log('upload success');
                callback(res);
            })
            .error(function(err) {
                console.log(err);
                //var res = {};
                //res.message = 'Username or password is incorrect';
                //callback(res);
                var res = { success: false };
                callback(res);
            });

    };



    service.emailTo = function(email, callback) {

        $http.post('/GPS/api/form-to-email.php', { email: email })
            .success(function(response) {
                callback(response);
            });

    };

    service.SetCredentials = function(username, password, token) {
        var authdata = Base64.encode(username + ':' + password + ':' + token);

        $rootScope.globals = {
            currentUser: {
                username: username,
                authdata: authdata
            }
        };

        $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
        $cookieStore.put('GPS_globals', $rootScope.globals);
    };

    service.ClearCredentials = function() {
        $rootScope.globals = {};
        $cookieStore.remove('GPS_globals');
        $http.defaults.headers.common.Authorization = 'Basic ';
    };

    return service;

}]);

app.factory('Base64', function() {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function(input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function(input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

    /* jshint ignore:end */
});