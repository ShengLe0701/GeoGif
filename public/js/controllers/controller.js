'use strict';

app.controller('loginCtrl', ['$scope', '$rootScope', '$location', 'AuthenticationService', 'Base64', function($scope, $rootScope, $location, AuthenticationService, Base64) {

    $scope.msgtext = '';

    if ($rootScope.globals.currentUser) {
        $scope.username = $rootScope.globals.currentUser.username;
        var str = Base64.decode($rootScope.globals.currentUser.authdata);
        var strs = str.split(':');
        $scope.password = strs[1];
    }


    $scope.submit = function() {
        if ($scope.username == '' || $scope.password == '') return;
        if ($scope.RmbMe == true) AuthenticationService.ClearCredentials();

        AuthenticationService.GetUrlInfo(function(res) {
            if (res.success) {
                $rootScope.apiURL = res.success.url;

                AuthenticationService.Login($scope.username, $scope.password, function(response) {
                    if (response.success) {
                        //console.log('success=' + response.success);
                        if ($scope.RmbMe == true) AuthenticationService.SetCredentials($scope.username, $scope.password, response.success);
                        else {
                            var authdata = Base64.encode($scope.username + ':' + $scope.password + ':' + response.success);
                            $rootScope.globals = {
                                currentUser: {
                                    username: $scope.username,
                                    authdata: authdata
                                }
                            };
                        }

                        AuthenticationService.GetList(function(res) {
                            if (res.success == true) {
                                $rootScope.Filters = res.data;
                                for (var i = 0; i < $rootScope.Filters.length; i++) {
                                    var url = $rootScope.Filters[i].url;


                                    var lastthree = url.substr(url.length - 3);
                                    lastthree = lastthree.toLowerCase();
                                    var filetype = '';
                                    if (lastthree == 'jpg' || lastthree == 'png' || lastthree == 'bmp') {
                                        filetype = 'image';
                                    } else if (lastthree == 'mp4') {
                                        filetype = 'video';
                                    }
                                    $rootScope.Filters[i].videoFlag = filetype;
                                }
                                //                               console.log('root=' + JSON.stringify($rootScope.Filters));

                                $location.path('/manage');


                            } else {
                                $location.path('/login');

                            }
                        });


                        //    $scope.msgtext = 'login OK!!';

                    } else {
                        $scope.msgtext = response.message;

                    }
                });

            } else {
                $scope.msgtext = res.message;
            }
        })





    };


}]);


app.controller('emailctrl', ['$scope', '$rootScope', '$location', 'AuthenticationService', 'Base64', function($scope, $rootScope, $location, AuthenticationService, Base64) {
    var frmvalidator = new Validator("forgot_form");
    frmvalidator.addValidation("email", "req", "Please provide your email");
    frmvalidator.addValidation("email", "email", "Please enter a valid email address");
    $scope.email_send = function() {
        AuthenticationService.emailTo($scope.email, function(response) {
            if (response.success) {

                //$location.path('/manage');
                $scope.msgtext = 'Mail Sent!!';

            } else {
                $scope.msgtext = response.message;

            }
        });

    }
}]);

app.controller('ManageCtrl', ['$scope', '$rootScope', 'modals', '$location', 'AuthenticationService', function($scope, $rootScope, modals, $location, AuthenticationService) {
    //  $scope.msgtext = '';

    var mapDiv123;
    var map123;
    var mapPolygon;

    $scope.username = $rootScope.globals.currentUser.username;

    $scope.FilterList = $rootScope.Filters;

    var positionarray = [];

    var initGlobal = false;

    $scope.EditModal = function(item) {
        console.log("sel_item=" + JSON.stringify(item));


        $scope.sel_item = item;
        $scope.FilterName = item.name;
        $scope.FilterEndDate = item.end_date;
        $scope.FilterEndTime = item.end_time;
        $scope.FilterStart = item.start_date;
        positionarray = JSON.parse(item.location_area);

        if (item.location_iswholeworld == true) {
            GlobalMap();
        } else {
            initMap();
        }


        var promise = modals.open(
            "prompt", {
                message: "Who rocks the party the rocks the body?",
                placeholder: "MC Lyte."
            }
        );
        promise.then(
            function handleResolve(response) {
                //						console.log( "Prompt resolved with [ %s ].", response );

            },
            function handleReject(error) {
                //						console.warn( "Prompt rejected!" );
            }

        );
    };


    $scope.DeleteModal = function(item) {

        //   DelFileUrl = item.url;
        //      console.log('DelFileUrl' + JSON.stringify(item));
        $scope.sel_item = item;
        var promise = modals.open(
            "prompt", {
                message: "Who rocks the party the rocks the body?",
                placeholder: "MC Lyte."
            }
        );
        promise.then(
            function handleResolve(response) {
                //						console.log( "Prompt resolved with [ %s ].", response );
            },
            function handleReject(error) {
                //						console.warn( "Prompt rejected!" );
            }

        );
    };
    $scope.LogOut = function() {
        AuthenticationService.ClearCredentials();
        $location.path('/login');
    };
    var ddd = [];
    $scope.FilterEdit = function() {
        if ($("#timepicker").val() != "") {
            var endTime = $("#timepicker").val().split(':');
            if (endTime[2].toLowerCase().indexOf('pm') != -1) {
                endTime[0] = (parseInt(endTime[0]) + 12).toString();

            }
            $scope.FilterEndTime = endTime[0] + ':' + endTime[1];

        }
        $scope.FilterName = $("#FilterName").val();
        $scope.FilterEndDate = $("#datepicker").val();

        if (!initGlobal)
            ddd = mapPolygon.getPath().getArray();
        var isWorld = false;
        if (ddd.length == 0) {
            isWorld = true;
        }
        //  console.log('update item=' + $scope.sel_item.id + ":" + $scope.FilterName + ":" + $scope.sel_item.url + ":" +
        //      $scope.FilterStart + ":" + $scope.sel_item.start_time + ":" + $scope.FilterEndDate + ":" + $scope.FilterEndTime + ":" + isWorld + ":" + JSON.stringify(ddd));

        AuthenticationService.FilterUpdate($scope.sel_item.id, $scope.FilterName, $scope.sel_item.url, $scope.FilterStart,
            $scope.sel_item.start_time, $scope.FilterEndDate, $scope.FilterEndTime, 'KL', isWorld, JSON.stringify(ddd),
            function(res) {
                if (res.success) {
                    AuthenticationService.GetList(function(res) {
                        if (res.success == true) {
                            $rootScope.Filters = res.data;
                            for (var i = 0; i < $rootScope.Filters.length; i++) {
                                var url = $rootScope.Filters[i].url;


                                var lastthree = url.substr(url.length - 3);
                                lastthree = lastthree.toLowerCase();
                                var filetype = '';
                                if (lastthree == 'jpg' || lastthree == 'png' || lastthree == 'bmp') {
                                    filetype = 'image';
                                } else if (lastthree == 'mp4') {
                                    filetype = 'video';
                                }
                                $rootScope.Filters[i].videoFlag = filetype;
                            }
                            //                               console.log('root=' + JSON.stringify($rootScope.Filters));

                            // $location.path('/manage');

                            $scope.FilterList = $rootScope.Filters;

                        } else {
                            //                                $location.path('/login');

                        }
                    });


                } else {
                    $scope.msgtext = 'Filter Edit Failure!'

                }
            })


        //        console.log(ddd.toString());
    };

    function getType(fileurl) {

        var lastthree = fileurl.substr(fileurl.length - 3);
        lastthree = lastthree.toLowerCase();
        var filetype = '';
        if (lastthree == 'jpg' || lastthree == 'png' || lastthree == 'bmp') {
            filetype = 'image';
        } else if (lastthree == 'mp4') {
            filetype = 'video';
        }
        return filetype;

    }


    Array.prototype.remove = function() {
        var what, a = arguments,
            L = a.length,
            ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };


    $scope.DeleteFilter = function() {
        //       element.parentNode.parentNode.style.display = 'none';
        console.log('sel_item=' + JSON.stringify($scope.sel_item));
        AuthenticationService.FilterDelete($scope.sel_item.id, function(response) {
            if (response.success) {
                var filetype = getType($scope.sel_item.url);
                if (filetype == 'video') {
                    var el = document.getElementsByTagName('source');
                    var e = undefined;
                    for (var i = 0; i < el.length; i++) {

                        if (el[i].getAttribute('src') == $scope.sel_item.url) {
                            e = el[i];
                            break;
                        }

                    }

                    if (e != undefined) {
                        e.parentNode.parentNode.parentNode.parentNode.style.display = 'none';
                        //     $scope.sel_item = null;
                    }

                } else if (filetype == 'image') {
                    var el = document.getElementsByClassName('thumbimg');
                    var e = undefined;
                    for (var i = 0; i < el.length; i++) {

                        if (el[i].getAttribute('ng-src') == $scope.sel_item.url) {
                            e = el[i];
                            break;
                        }

                    }

                    if (e != undefined) {
                        e.parentNode.parentNode.parentNode.style.display = 'none';
                        //     $scope.sel_item = null;
                    }
                }


                $rootScope.Filters.remove($scope.sel_item);
                $scope.FilterList = $rootScope.Filters;



            } else {
                $scope.msgtext = response.data;

            }
        });


    };



    function initMap() {
        mapDiv123 = document.getElementById('map-tie');
        map123 = new google.maps.Map(mapDiv123, {
            center: { lat: 44.542, lng: -78.554 },
            zoom: 35,
            editable: true
                //  mapTypeId: google.maps.MapTypeId.ROAD
        });
        initGlobal = false;

        var bounds = new google.maps.LatLngBounds();
        mapPolygon = new google.maps.Polygon({
            path: positionarray,
            strokeColor: '#0e78b5',
            strokeOpacity: 0.8,
            editable: true,
            fillColor: '#68B946',
            fillOpacity: 0.35,
            strokeWeight: 2
        });
        mapPolygon.setMap(map123);

        var array_elem = MapElemMake(positionarray);
        for (var j = 0; j < array_elem.length; j++) {
            bounds.extend(array_elem[j]);
        }

        map123.fitBounds(bounds);

        window.setTimeout(function() {
            google.maps.event.trigger(map123, 'resize');
        }, 500);





    }


    function MapElemMake(array) {
        var retVal = [];
        for (var i = 0; i < array.length; i++) {
            var item = new google.maps.LatLng(array[i].lat, array[i].lng);
            retVal.push(item);
        }
        return retVal;
    };

    function GlobalMap() {
        mapDiv123 = document.getElementById('map-tie');
        map123 = new google.maps.Map(mapDiv123, {
            center: { lat: 0, lng: 0 },
            zoom: 1
        });
        map123.setOptions({ draggableCursor: 'default' });

        //       mapPolygon = null;


        initGlobal = true;

        var metertofeet = 3.2808398950131;

        var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: false,

            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']

            },
            markerOptions: { icon: 'img/marknormal.png', click: true, draggable: true },
            polygonOptions: {
                fillColor: '#68B946',
                fillOpacity: 0.6,
                strokeColor: '#0e78b5',
                strokeWeight: 2,
                clickable: true,
                editable: true,
                zIndex: 1
            }
        });
        //drawingManager.hide;
        drawingManager.setMap(map123);

        google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
            drawingManager.setDrawingMode(null);

            //            console.log($rootScope.value.location.toString());
            ddd = polygon.getPath().getArray();


            GetArea(polygon);


            var place_polygon_path = polygon.getPath();
            google.maps.event.addListener(place_polygon_path, 'set_at', polygonChanged);
            google.maps.event.addListener(place_polygon_path, 'insert_at', polygonChanged);

            function polygonChanged() {
                GetArea(polygon)
            }
            google.maps.event.addListener(polygon, 'click', function(point) {
                var temp = point.latLng;
                var arr = this.getPath().getArray();
                var index = arr.indexOf(temp);



            });
            google.maps.event.addListener(polygon, 'rightclick', function(point) {
                var projection = map.getProjection();
                var temp = point.latLng;
                point = projection.fromLatLngToPoint(point.latLng);

                var arr = this.getPath().getArray();

                var index = arr.indexOf(temp);
                if (index > -1) {

                    var minDist = Number.MAX_VALUE;
                    var idx = -1;
                    for (var i = 0; i < arr.length; i++) {
                        var point2 = projection.fromLatLngToPoint(arr[i]);
                        var dx = point.x - point2.x;
                        var dy = point.y - point2.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDist) {
                            minDist = dist;
                            idx = i;
                        }
                    }
                    if (minDist < 3) {
                        this.getPath().removeAt(idx);
                    }
                    if (arr.length < 2) {
                        polygon.setMap(null);
                        drawingManager.setDrawingMode('polygon');
                    }

                    GetArea(polygon);

                }
            });
        });

        google.maps.Polygon.prototype.move = function(latLng, shape, p) {
            var lat = latLng.lat();
            var lng = latLng.lng();

            latDiff = shape.latLng.lat() - lat;
            lngDiff = shape.latLng.lng() - lng;

            for (var i = 0; i < p.length; i++) {
                pLat = p.getAt(i).lat();
                pLng = p.getAt(i).lng();
                p.setAt(i, new google.maps.LatLng(pLat - latDiff, pLng - lngDiff));
            }
            shape.latLng = latLng;
        }

        function GetArea(mypolygon) {
            var temp = google.maps.geometry.spherical.computeArea(mypolygon.getPath());
            var tempsize = parseInt(temp * Math.pow(metertofeet, 2));

        }


        window.setTimeout(function() {
            google.maps.event.trigger(map123, 'resize');
        }, 500);


    }


    $scope.ViewGlobalMap = function() {

        $location.path('/viewmap');
    };

    $scope.AddNewOverlay = function() {
        $rootScope.value = {};
        $rootScope.value.location = [];
        $rootScope.value.filternames = [];
        $rootScope.value.filtertypes = [];
        $rootScope.value.starttime = null;
        $rootScope.value.endtime = null;
        $rootScope.value.startdate = null;
        $rootScope.value.enddate = null;

        $location.path('/createfilter');
    };
    // Datepicker Popups calender to Choose date.
    $(function() {
        $("#datepicker").datepicker({
            onSelect: function(dateText, inst) {
                $scope.FilterEndDate = dateText;
                //          $("input[name='date']").val(dateText);
            }
        });
    });

    $('#timepicker').timepicki({ increase_direction: 'up' });

    // $('#setTimeExample').timepicker('setTime', new Date());



}]);



app.controller('viewmapCtrl', ['$scope', '$rootScope', 'modals', '$location', 'AuthenticationService', '$compile', function($scope, $rootScope, modals, $location, AuthenticationService, $compile) {
    //  $scope.msgtext = '';
    $scope.username = $rootScope.globals.currentUser.username;

    var infoWindow;
    initMap();

    $scope.RedirectToURL = function() {
        $location.path('/manage');
    };

    $scope.LogOut = function() {
        AuthenticationService.ClearCredentials();
        $location.path('/login');
    };




    $scope.AddNewOverlay = function() {
        $rootScope.value = {};
        $rootScope.value.location = [];
        $rootScope.value.filternames = [];
        $rootScope.value.filtertypes = [];
        $rootScope.value.starttime = null;
        $rootScope.value.endtime = null;
        $rootScope.value.startdate = null;
        $rootScope.value.enddate = null;

        $location.path('/createfilter');
    };






    function initMap() {
        var mapDiv = document.getElementById('map-tie');
        var map = new google.maps.Map(mapDiv, {
            center: { lat: 44.544, lng: -78.546 },
            zoom: 15
        });
        map.setOptions({ draggableCursor: 'default' });

        setGUI();



        function drawPolygon(pointarray, color) {
            var mapPolygon = new google.maps.Polygon({
                path: pointarray,
                strokeColor: '#0e78b5',
                strokeOpacity: 0.8,
                fillColor: color,
                fillOpacity: 0.35,
                strokeWeight: 2
            });
            mapPolygon.setMap(map);
        }





        function showArrays(imagearray, marker) {

            var contentString = MakeInfoWindow(imagearray);
            var infoBubble = new InfoBubble({
                minWidth: 200,
                padding: 13

            });

            //      var compiled = $compile(infoBubble)($scope);
            //infoBubble.setMaxWidth('500');
            //setMaxHeight('300px');
            infoBubble.setMinHeight(90);
            infoBubble.setContent(contentString);
            infoBubble.open(map, marker);




        }

        function GetFileType(fileurl) {


            var lastthree = fileurl.substr(fileurl.length - 3);
            lastthree = lastthree.toLowerCase();
            var filetype = '';
            if (lastthree == 'jpg' || lastthree == 'png' || lastthree == 'bmp') {
                filetype = 'image';
            } else if (lastthree == 'mp4') {
                filetype = 'video';
            }
            return filetype;
        }


        function MakeInfoWindow(imageArray) {
            //   var strContent = "<span class=\"bubble-details-button\">Get Details about </span>";
            var absUrl = $location.absUrl();
            var urls = absUrl.split('/');
            var newUrl = "";
            for (var i = 0; i < (urls.length - 1); i++) {
                newUrl += urls[i] + '/';
            }
            newUrl += 'manage';

            var strContent = '<div id=\"InfoContent\"><div class=\"row container\" style=\"width:200px; text-align:center;\">\n';

            for (var i = 0; i < imageArray.length; i++) {
                if (i == 3) {
                    break;
                }
                var filetype = GetFileType(imageArray[i]);

                if (filetype == 'video') {
                    strContent += '<video style=\"width: 40px; padding-left:1px;\">\n' +
                        '<source src=\"' + imageArray[i] + '\" type=\"video/mp4\">\n' +
                        '</video>';

                }
                if (filetype == 'image') {
                    strContent += '<img src=\"' + imageArray[i] + '\" style=\"width:45px; height:45px; padding-left:1px;\"  >\n'
                }

            }
            strContent += '</div>\n';

            strContent += '<div style=\"text-align:center;\" ng-controller=\"viewmapCtrl\">\n';
            strContent += '<a href=\"' + newUrl + '\" >see all</a></div></div>\n';

            return strContent;
        }


        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        function LocationsCompare(x, y) {
            if (x.length != y.length) return false;
            for (var i = 0; i < x.length; i++) {
                if (x[i].lat != y[i].lat) return false;
                if (x[i].lng != y[i].lng) return false;
            }
            return true;
        }

        function setGUI() {

            var list = [];
            var bounds = new google.maps.LatLngBounds();

            for (var i = 0; i < $rootScope.Filters.length; i++) {
                var exist = false;

                var array12 = JSON.parse($rootScope.Filters[i].location_area);
                //               console.log('array12=' + JSON.stringify(array12));

                for (var j = 0; j < list.length; j++) {
                    //                   console.log('listI.location=' + j + ':' + JSON.stringify(list[j].location_area));
                    //   if (list[j].location_area.equals(array12) == true) {
                    if (LocationsCompare(array12, list[j].location_area) == true) {
                        console.log('SAME!!!');
                        exist = true;
                        list[j].image_array.push($rootScope.Filters[i].url);
                        break;
                    }

                }
                if (exist == false) {
                    var item = {};
                    item.location_area = [];
                    item.image_array = [];
                    item.location_area = array12;
                    item.image_array.push($rootScope.Filters[i].url);
                    list.push(item);

                    drawPolygon(item.location_area, getRandomColor());

                    var array_elem = MapElemMake(array12);
                    for (var j = 0; j < array_elem.length; j++) {
                        bounds.extend(array_elem[j]);
                    }

                }



            }
            map.fitBounds(bounds);

            for (var i = 0; i < list.length; i++) {

                if (list[i].location_area.length == 0) {
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(0, 0)
                    });
                    //       showArrays(list[i].image_array, marker);

                } else {
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(list[i].location_area[0].lat, list[i].location_area[0].lng)
                    });
                    showArrays(list[i].image_array, marker);

                }


            }

        }
    };

    function MapElemMake(array) {
        var retVal = [];
        for (var i = 0; i < array.length; i++) {
            var item = new google.maps.LatLng(array[i].lat, array[i].lng);
            retVal.push(item);
        }
        return retVal;
    };


}]);



app.controller('createfilterCtrl', ['$scope', '$rootScope', 'modals', '$location', 'AuthenticationService', function($scope, $rootScope, modals, $location, AuthenticationService) {
    //  $scope.msgtext = '';
    $scope.username = $rootScope.globals.currentUser.username;
    $scope.RedirectToURL = function() {
        $location.path('/manage');
    };

    $scope.tab2_click = function() {
        if ($rootScope.value.wholeWorld == false && $rootScope.value.location.length == 0) return;
        $location.path('/tab2');
    };
    $scope.ResetRegion = function() {
        initMap();
    };
    $rootScope.value.wholeWorld = false;

    $scope.globalresult = 'private';
    $scope.SelectWholeWorld = function() {
        if ($scope.globalresult == 'private') {
            $rootScope.value.wholeWorld = false;
            initMap();

        } else if ($scope.globalresult == 'public') {
            $rootScope.value.location = [];
            $rootScope.value.wholeWorld = true;
            GlobalMap();
        }

    };
    $scope.LogOut = function() {
        AuthenticationService.ClearCredentials();
        $location.path('/login');
    };
    var markArray = [];
    var positionArray = [];
    var mapPolygon;
    var mapPolyline;
    var marker;
    var mapDiv;
    var map;
    var metertofeet = 3.2808398950131;
    initMap();

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    };

    function initMap() {
        mapDiv = document.getElementById('map-tie');
        map = new google.maps.Map(mapDiv, {
            center: { lat: 44.540, lng: -78.546 },
            zoom: 15

        });
        var infoWindow = new google.maps.InfoWindow({ map: map });
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                infoWindow.setPosition(pos);
                infoWindow.setContent('Location found.');
                map.setCenter(pos);
            }, function() {
                handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }




        map.setOptions({ draggableCursor: 'default' });

        var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: false,

            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']

            },
            markerOptions: { icon: 'img/marknormal.png', click: true, draggable: true },
            polygonOptions: {
                fillColor: '#68B946',
                fillOpacity: 0.6,
                strokeColor: '#0e78b5',
                strokeWeight: 2,
                clickable: true,
                editable: true,
                zIndex: 1
            }
        });
        //drawingManager.hide;
        drawingManager.setMap(map);

        google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
            drawingManager.setDrawingMode(null);

            $rootScope.value.location = polygon.getPath().getArray();
            //            console.log($rootScope.value.location.toString());


            GetArea(polygon);


            var place_polygon_path = polygon.getPath();
            google.maps.event.addListener(place_polygon_path, 'set_at', polygonChanged);
            google.maps.event.addListener(place_polygon_path, 'insert_at', polygonChanged);

            function polygonChanged() {
                GetArea(polygon)
            }
            google.maps.event.addListener(polygon, 'click', function(point) {
                var temp = point.latLng;
                var arr = this.getPath().getArray();
                var index = arr.indexOf(temp);



            });
            google.maps.event.addListener(polygon, 'rightclick', function(point) {
                var projection = map.getProjection();
                var temp = point.latLng;
                point = projection.fromLatLngToPoint(point.latLng);

                var arr = this.getPath().getArray();

                var index = arr.indexOf(temp);
                if (index > -1) {

                    var minDist = Number.MAX_VALUE;
                    var idx = -1;
                    for (var i = 0; i < arr.length; i++) {
                        var point2 = projection.fromLatLngToPoint(arr[i]);
                        var dx = point.x - point2.x;
                        var dy = point.y - point2.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDist) {
                            minDist = dist;
                            idx = i;
                        }
                    }
                    if (minDist < 3) {
                        this.getPath().removeAt(idx);
                    }
                    if (arr.length < 2) {
                        polygon.setMap(null);
                        drawingManager.setDrawingMode('polygon');
                    }

                    GetArea(polygon);

                }
            });
        });

        google.maps.Polygon.prototype.move = function(latLng, shape, p) {
            var lat = latLng.lat();
            var lng = latLng.lng();

            latDiff = shape.latLng.lat() - lat;
            lngDiff = shape.latLng.lng() - lng;

            for (var i = 0; i < p.length; i++) {
                pLat = p.getAt(i).lat();
                pLng = p.getAt(i).lng();
                p.setAt(i, new google.maps.LatLng(pLat - latDiff, pLng - lngDiff));
            }
            shape.latLng = latLng;
        }

        function GetArea(mypolygon) {
            var temp = google.maps.geometry.spherical.computeArea(mypolygon.getPath());
            var tempsize = parseInt(temp * Math.pow(metertofeet, 2));
            document.getElementById('squareNumber').innerHTML = tempsize.toLocaleString() + "Sq. Ft";
            document.getElementById('squareNumber').style.fontWeight = "bold";

        }


    }



    function GlobalMap() {
        mapDiv = document.getElementById('map-tie');
        map = new google.maps.Map(mapDiv, {
            center: { lat: 0, lng: 0 },
            zoom: 1
        });
        map.setOptions({ draggableCursor: 'default' });




    }




    function click_world() {
        initMap();
        // map.setZoom(15);
    }



    /*   var cities = [{
        city: 'India',
        desc: 'This is the best country in the world!',
        lat: 23.200000,
        long: 79.225487
    }, {
        city: 'New Delhi',
        desc: 'The Heart of India!',
        lat: 28.500000,
        long: 77.250000
    }, {
        city: 'Mumbai',
        desc: 'Bollywood city!',
        lat: 19.000000,
        long: 72.90000
    }, {
        city: 'Kolkata',
        desc: 'Howrah Bridge!',
        lat: 22.500000,
        long: 88.400000
    }, {
        city: 'Chennai  ',
        desc: 'Kathipara Bridge!',
        lat: 13.000000,
        long: 80.250000
    }];


    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(25, 80),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }

    $scope.map = new google.maps.Map(document.getElementById('map-tie'), mapOptions);

    $scope.markers = [];

    var infoWindow = new google.maps.InfoWindow();

    var createMarker = function(info) {

        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.long),
            title: info.city
        });
        marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';

        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
        });

        $scope.markers.push(marker);

    }

    for (var i = 0; i < cities.length; i++) {
        createMarker(cities[i]);
    }

    $scope.openInfoWindow = function(e, selectedMarker) {
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }
*/
}]);





app.controller('tab2Ctrl', ['$scope', '$rootScope', 'modals', '$location', 'AuthenticationService', '$interval', 'tempService', function($scope, $rootScope, modals, $location, AuthenticationService, $interval, tempService) {
    //  $scope.msgtext = '';
    $scope.username = $rootScope.globals.currentUser.username;
    $scope.RedirectToURL = function() {
        $location.path('/manage');
    };

    //    $rootScope.value.filternames = [];
    $scope.tab1_click = function() {
        $location.path('/createfilter');
    };
    $scope.tab3_click = function() {
        if ($rootScope.value.filternames.length == 0) return;

        for (var i = 0; i < $rootScope.value.filternames.length; i++) {
            var url = $rootScope.value.filternames[i];


            var lastthree = url.substr(url.length - 3);
            lastthree = lastthree.toLowerCase();
            var filetype = '';
            if (lastthree == 'jpg' || lastthree == 'png' || lastthree == 'bmp') {
                filetype = 'image';
            } else if (lastthree == 'mp4') {
                filetype = 'video';
            }
            $rootScope.value.filtertypes.push(filetype);
        }

        $location.path('/tab3');
    };

    $scope.LogOut = function() {
        AuthenticationService.ClearCredentials();
        $location.path('/login');
    };

    if ($rootScope.value.filternames.length != 0) {
        $scope.records = $rootScope.value.filternames;
    }
    Array.prototype.remove = function() {
        var what, a = arguments,
            L = a.length,
            ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    function getType(fileurl) {

        var lastthree = fileurl.substr(fileurl.length - 3);
        lastthree = lastthree.toLowerCase();
        var filetype = '';
        if (lastthree == 'jpg' || lastthree == 'png' || lastthree == 'bmp') {
            filetype = 'image';
        } else if (lastthree == 'mp4') {
            filetype = 'video';
        }
        return filetype;

    }


    $scope.DeleteModal1 = function(fileurl) {

        //     console.log('ejfekjfekej=' + fileurl);
        $rootScope.value.filternames.remove(fileurl);
        var filetype = getType(fileurl);
        if (filetype == 'video') {
            var el = document.getElementsByTagName('source');
            var e = undefined;
            for (var i = 0; i < el.length; i++) {

                if (el[i].getAttribute('src') == fileurl) {
                    e = el[i];
                    break;
                }

            }

            if (e != undefined) {
                e.parentNode.parentNode.parentNode.style.display = 'none';
            }

        } else if (filetype == 'image') {
            var el = document.getElementsByClassName('thumbimg');
            var e = undefined;
            for (var i = 0; i < el.length; i++) {
                if (el[i].getAttribute('src') == fileurl) {
                    e = el[i];
                    break;
                }
            }

            if (e != undefined) {
                e.parentNode.parentNode.style.display = 'none';
            }
        }






    };



    $scope.files = {};
    $scope.performUpload = false;

    var Timer = null;
    $scope.StartTimer = function() {
        Timer = $interval(function() {
            var el = document.getElementById('myFileName');
            if (el != undefined) {
                if (el.getAttribute("href") != undefined) {
                    var filename = el.getAttribute("href");
                    if (filename != "") {
                        $scope.StopTimer();
                        listFilters(filename);
                    }
                }
            }

            var el1 = document.getElementById('ErrMessage');
            if (el1 != undefined) {
                if (el1.innerHTML != undefined) {
                    var errText = el1.innerHTML;
                    if (errText == "Can't upload more than 10MB.") {
                        $scope.StopTimer();
                        //                        listFilters(filename);
                    }
                }
            }

        }, 300);
    };

    $scope.StopTimer = function() {
        if (angular.isDefined(Timer)) {
            $interval.cancel(Timer);
            Timer = null;
            $scope.performUpload = false;

        }
    };

    var filterid = 0;

    var listFilters = function(fileurl) {
        var elem = '';
        if (document.getElementById('FiltersList') != undefined) {
            elem = document.getElementById("FiltersList").innerHTML;
            var x = document.getElementsByTagName('thumbnail');
            for (var i = 0; i < x.length; i++) {
                var searchstr = x[i].innerHTML;
                elem = elem.replace(searchstr, '');
            }
        }


        $rootScope.value.filternames.push(fileurl);
        $scope.filterexist = true;
        var lastthree = fileurl.substr(fileurl.length - 3);
        lastthree = lastthree.toLowerCase();
        var filetype = '';
        if (lastthree == 'jpg' || lastthree == 'png' || lastthree == 'bmp') {
            filetype = 'image';
        } else if (lastthree == 'mp4') {
            filetype = 'video';
        }
        $scope.newTransaction = tempService.appendhtml(elem, fileurl, filetype);


        //      console.log('$scope.newTransaction==' + $scope.newTransaction);

    }
    $scope.filterexist = false;
    $scope.newTransaction = null;


    $scope.Clear = function() {
        var el = document.getElementById('myFileName');
        if (el != undefined) {
            el.setAttribute("href", '');

        }
    };

    $scope.UploadFiles = function() {
        $scope.performUpload = true;
        $scope.StartTimer();
    };

    (function(e, t, n) {
        var r = e.querySelectorAll("html")[0];
        r.className = r.className.replace(/(^|\s)no-js(\s|$)/, "$1js$2")
    })(document, window, 0);

    'use strict';

    ;
    (function($, window, document, undefined) {
        // feature detection for drag&drop upload

        var isAdvancedUpload = function() {
            var div = document.createElement('div');
            return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
        }();



        // applying the effect for every form

        $('.box').each(function() {
            var $form = $(this),
                $input = $form.find('input[type="file"]'),
                $label = $form.find('label'),
                $errorMsg = $form.find('.box__error span'),
                $restart = $form.find('.box__restart'),
                droppedFiles = false,
                showFiles = function(files) {
                    $label.text(files.length > 1 ? ($input.attr('data-multiple-caption') || '').replace('{count}', files.length) : files[0].name);
                };

            // letting the server side to know we are going to make an Ajax request
            $form.append('<input type="hidden" name="ajax" value="1" />');

            // automatically submit the form on file select
            $input.on('change', function(e) {
                showFiles(e.target.files);
                $form.trigger('submit');

            });
            // drag&drop files if the feature is available
            if (isAdvancedUpload) {
                $form
                    .addClass('has-advanced-upload') // letting the CSS part to know drag&drop is supported by the browser
                    .on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
                        // preventing the unwanted behaviours
                        e.preventDefault();
                        e.stopPropagation();
                    })
                    .on('dragover dragenter', function() //
                        {
                            $form.addClass('is-dragover');
                        })
                    .on('dragleave dragend drop', function() {
                        $form.removeClass('is-dragover');
                    });
                /*               .on('drop', function(e) {
                                   droppedFiles = e.originalEvent.dataTransfer.files; // the files that were dropped
                                   //					console.log('droppedFiles='+JSON.stringify(droppedFiles));
                                   showFiles(droppedFiles);
                                   $form.trigger('submit'); // automatically submit the form on file drop
                               });  */
            }


            // if the form was submitted

            $form.on('submit', function(e) {
                // preventing the duplicate submissions if the current one is in progress
                if ($form.hasClass('is-uploading')) return false;

                $form.addClass('is-uploading').removeClass('is-error');

                if (isAdvancedUpload) // ajax file upload for modern browsers
                {
                    e.preventDefault();

                    // gathering the form data
                    var ajaxData = new FormData($form.get(0));
                    if (droppedFiles) {
                        $.each(droppedFiles, function(i, file) {
                            ajaxData.append($input.attr('name'), file);
                        });
                    }

                    console.log('data=' + JSON.stringify(ajaxData));

                    // ajax request
                    $.ajax({
                        url: 'uploads/index.php',
                        type: 'post',
                        data: ajaxData,
                        dataType: 'json',
                        cache: false,
                        contentType: false,
                        processData: false,
                        complete: function() {
                            $form.removeClass('is-uploading');
                        },
                        success: function(data) {
                            //	$form.addClass( data.success == true ? 'is-success' : 'is-error' );
                            droppedFiles = false;
                            $form.addClass('is-success');

                        },
                        error: function(err) {
                            //	alert( 'Error. Please, contact the webmaster!' );
                            console.log('error=' + JSON.stringify(err));
                            $form.addClass('is-error');
                            $errorMsg.text('');
                            //$errorMsg.innerHTML=err.responseText;

                        }
                    });


                } else // fallback Ajax solution upload for older browsers
                {
                    var iframeName = 'uploadiframe' + new Date().getTime(),
                        $iframe = $('<iframe name="' + iframeName + '" style="display: none;"></iframe>');

                    $('body').append($iframe);
                    $form.attr('target', iframeName);

                    $iframe.one('load', function() {
                        var data = $.parseJSON($iframe.contents().find('body').text());
                        $form.removeClass('is-uploading').addClass(data.success == true ? 'is-success' : 'is-error').removeAttr('target');
                        if (!data.success) $errorMsg.text(data.error);
                        $iframe.remove();
                    });
                }
            });


            // restart the form if has a state of error/success

            $restart.on('click', function(e) {
                e.preventDefault();
                $form.removeClass('is-error is-success');
                $input.trigger('click');
            });

            // Firefox focus bug fix for file input
            $input
                .on('focus', function() { $input.addClass('has-focus'); })
                .on('blur', function() { $input.removeClass('has-focus'); });
        });

    })(jQuery, window, document);


}]);




app.controller('tab3Ctrl', ['$scope', '$rootScope', 'modals', '$location', 'AuthenticationService', function($scope, $rootScope, modals, $location, AuthenticationService) {
    //  $scope.msgtext = '';
    $scope.username = $rootScope.globals.currentUser.username;
    $scope.RedirectToURL = function() {
        $location.path('/manage');
    };

    $scope.tab1_click = function() {
        $location.path('/createfilter');
    };
    $scope.tab2_click = function() {
        $location.path('/tab2');
    };
    $scope.tab4_click = function() {
        if ($rootScope.value.enddate == undefined || $rootScope.value.enddate == null) return;

        $rootScope.value.starttime = document.getElementById("starttime").value;
        $rootScope.value.endtime = document.getElementById("endtime").value;
        $rootScope.value.startdate = document.getElementById("startdate").value;
        $rootScope.value.enddate = document.getElementById("enddate").value;

        console.log('startdate=' + $rootScope.value.startdate);
        console.log('starttime=' + $rootScope.value.starttime);
        console.log('enddate=' + $rootScope.value.enddate);
        console.log('endtime=' + $rootScope.value.endtime);

        $location.path('/tab4');
    };

    $scope.LogOut = function() {
        AuthenticationService.ClearCredentials();
        $location.path('/login');
    };

    var currentTime = new Date();

    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (hours < 10) {
        hours = "0" + hours;
    }



    // $scope.starttime = hours + ':' + minutes;
    // $scope.endtime = hours + ':' + minutes;

    document.getElementById("starttime").value = hours.toString() + ':' + minutes.toString();
    document.getElementById("endtime").value = hours.toString() + ':' + minutes.toString();


    //alert(hours.toString()+':'+minutes.toString());

    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();
    if (month < 10) { month = "0" + month }
    if (day < 10) { day = "0" + day }

    $scope.startdate = (month + "/" + day + "/" + year);
    //document.getElementById("startdate").value = (month + "/" + day + "/" + year);


    $rootScope.value.starttime = document.getElementById("starttime").value;
    $rootScope.value.endtime = document.getElementById("endtime").value;
    $rootScope.value.startdate = document.getElementById("startdate").value;

    $scope.change_button_color = function(btn) {

        document.getElementById("btn_week").style.backgroundColor = "#FFFFFF";
        document.getElementById("btn_week").style.color = "#0e78b5";

        document.getElementById("btn_year").style.backgroundColor = "#FFFFFF";
        document.getElementById("btn_year").style.color = "#0e78b5";

        document.getElementById("btn_month").style.backgroundColor = "#FFFFFF";
        document.getElementById("btn_month").style.color = "#0e78b5";

        document.getElementById("btn_forever").style.backgroundColor = "#FFFFFF";
        document.getElementById("btn_forever").style.color = "#0e78b5";

        document.getElementById("btn_quick_date").style.backgroundColor = "#FFFFFF";
        document.getElementById("btn_quick_date").style.color = "#68B946";


        var property = document.getElementById(btn);

        if (btn == 'btn_quick_date') {
            property.style.backgroundColor = "#68B946";
            property.style.color = "#ffffff";
        } else {
            property.style.backgroundColor = "#0e78b5";
            property.style.color = "#ffffff";
        }
    }

    $scope.click_week = function() {
        var str_startdate = document.getElementById("startdate").value;
        var str_sDate = new Date(str_startdate);
        var str_new_sDate = new Date();

        str_new_sDate.setDate(str_sDate.getDate() + 7);

        var day = str_new_sDate.getDate();
        var month = str_new_sDate.getMonth() + 1;
        var year = str_new_sDate.getFullYear();

        if (day < 10) { day = "0" + day; }
        if (month < 10) { month = "0" + month; }
        document.getElementById("enddate").value = (month + "/" + day + "/" + year);
        $rootScope.value.enddate = document.getElementById("enddate").value;

    }

    $scope.click_month = function() {



        var str_startdate = document.getElementById("startdate").value;
        var str_sDate = new Date(str_startdate);
        var str_new_sDate = new Date();

        str_new_sDate.setDate(str_sDate.getDate());

        var day = str_new_sDate.getDate();
        var month = str_new_sDate.getMonth() + 2;
        var year = str_new_sDate.getFullYear();

        if (day < 10) { day = "0" + day; }
        if (month < 10) { month = "0" + month; }
        document.getElementById("enddate").value = (month + "/" + day + "/" + year);
        $rootScope.value.enddate = document.getElementById("enddate").value;
    }

    $scope.click_year = function() {


        var str_startdate = document.getElementById("startdate").value;
        var str_sDate = new Date(str_startdate);
        var str_new_sDate = new Date();

        str_new_sDate.setDate(str_sDate.getDate());

        var day = str_new_sDate.getDate();
        var month = str_new_sDate.getMonth() + 1;
        var year = str_new_sDate.getFullYear() + 1;

        if (day < 10) { day = "0" + day; }
        if (month < 10) { month = "0" + month; }
        document.getElementById("enddate").value = (month + "/" + day + "/" + year);
        $rootScope.value.enddate = document.getElementById("enddate").value;
    }

    $scope.click_quick_date = function() {
        var str_startdate = document.getElementById("startdate").value;
        var str_sDate = new Date(str_startdate);

        var day = str_sDate.getDate();
        var month = str_sDate.getMonth() + 1;
        var year = str_sDate.getFullYear();

        if (day < 10) { day = "0" + day; }
        if (month < 10) { month = "0" + month; }
        document.getElementById("enddate").value = (month + "/" + day + "/" + year);
        $rootScope.value.enddate = document.getElementById("enddate").value;
    }


    $scope.click_forever = function() {



        document.getElementById("enddate").value = ("12" + "/" + "31" + "/" + "9999");
        $rootScope.value.enddate = document.getElementById("enddate").value;
    }


    YUI().use('calendar', 'datatype-date', 'cssbutton', function(Y) {

        document.getElementById("enddate").value = "";

        var calendar = new Y.Calendar({
            contentBox: "#mycalendar",
            width: '340px',
            showPrevMonth: true,
            showNextMonth: true,
            date: new Date()
        }).render();

        var dtdate = Y.DataType.Date;

        calendar.on("selectionChange", function(ev) {
            var newDate = ev.newSelection[0];
            var newday = newDate.getDate().toString();
            var newMonth = newDate.getMonth() + 1;
            var newYear = newDate.getFullYear().toString();

            if (newday < 10) { newday = "0" + newday }
            if (newMonth < 10) { newMonth = "0" + newMonth }

            document.getElementById("startdate").value = newMonth.toString() + '/' + newday + '/' + newYear;



            //Y.one("#selecteddate").setHTML(startdate.value(newDate));
        });
        /*
        Y.one("#togglePrevMonth").on('click', function (ev) 
        {
        	ev.preventDefault();
        	calendar.set('showPrevMonth', !(calendar.get("showPrevMonth")));
        });
        Y.one("#toggleNextMonth").on('click', function (ev) {
        	ev.preventDefault();
        	calendar.set('showNextMonth', !(calendar.get("showNextMonth")));
        });*/
    });

}]);



app.controller('tab4Ctrl', ['$scope', '$rootScope', 'modals', '$location', 'AuthenticationService', function($scope, $rootScope, modals, $location, AuthenticationService) {
    //  $scope.msgtext = '';
    $scope.username = $rootScope.globals.currentUser.username;
    $scope.RedirectToURL = function() {
        $location.path('/manage');
    };

    $scope.tab1_click = function() {
        $location.path('/createfilter');
    };
    $scope.tab2_click = function() {
        $location.path('/tab2');
    };
    $scope.tab3_click = function() {
        $location.path('/tab3');
    };

    $scope.LogOut = function() {
        AuthenticationService.ClearCredentials();
        $location.path('/login');
    };
    initMap();

    $scope.records = {};
    $scope.records.filters = [];
    $scope.records.types = [];

    var filternames = $rootScope.value.filternames.slice();
    $scope.img1 = $rootScope.value.filternames[0];
    $rootScope.value.filternames.splice(0, 1);
    $scope.records.filters = $rootScope.value.filternames;
    $rootScope.value.filternames = filternames;



    var filtertype = $rootScope.value.filtertypes.slice();
    $scope.type1 = $rootScope.value.filtertypes[0];
    $rootScope.value.filtertypes.splice(0, 1);
    $scope.records.types = $rootScope.value.filtertypes;
    $rootScope.value.filtertypes = filtertype;



    console.log('img1=' + $scope.img1 + ": type1=" + $scope.type1);
    console.log('records=' + JSON.stringify($scope.records));


    $scope.startdate = $rootScope.value.startdate;
    $scope.enddate = $rootScope.value.enddate;
    $scope.starttime = $rootScope.value.starttime;
    $scope.endtime = $rootScope.value.endtime;


    var tweetRecursive = function(n) {
        if (n < $rootScope.value.filternames.length) {
            AuthenticationService.FilterUpload('Vintage Filter', $rootScope.value.filternames[n], $rootScope.value.startdate, $rootScope.value.starttime, $rootScope.value.enddate,
                $rootScope.value.endtime, 'kuchai lama', $rootScope.value.wholeWorld, JSON.stringify($rootScope.value.location),
                function(res) {
                    if (res.success == true) {
                        tweetRecursive(n + 1);
                    }
                });
        } else {
            AuthenticationService.GetList(function(res) {
                if (res.success == true) {
                    $rootScope.Filters = res.data;
                    for (var i = 0; i < $rootScope.Filters.length; i++) {
                        var url = $rootScope.Filters[i].url;


                        var lastthree = url.substr(url.length - 3);
                        lastthree = lastthree.toLowerCase();
                        var filetype = '';
                        if (lastthree == 'jpg' || lastthree == 'png' || lastthree == 'bmp') {
                            filetype = 'image';
                        } else if (lastthree == 'mp4') {
                            filetype = 'video';
                        }
                        $rootScope.Filters[i].videoFlag = filetype;

                    }
                    $location.path('/manage');


                } else {
                    $location.path('/tab4');

                }
            });


        }
    }



    $scope.uploadFilter = function() {
        console.log('upload value=' + JSON.stringify($rootScope.value));
        tweetRecursive(0);

    };

    function initMap() {
        var mapDiv = document.getElementById('map-tie');
        var map = new google.maps.Map(mapDiv, {
            center: { lat: 44.542, lng: -78.554 },
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROAD
        });

        /*
                var positionarray = [
                    { lat: 44.54264878379179, lng: -78.55999231338501 },
                    { lat: 44.541608816848324, lng: -78.55870485305786 },
                    { lat: 44.53989588962139, lng: -78.55806112289429 },
                    { lat: 44.54053824323721, lng: -78.55248212814331 },
                    { lat: 44.54420869937517, lng: -78.55115175247192 }
                ];
        */
        var positionarray = $rootScope.value.location;

        var mapPolygon = new google.maps.Polygon({
            path: positionarray,
            strokeColor: '#0e78b5',
            strokeOpacity: 0.8,
            fillColor: '#68B946',
            fillOpacity: 0.35,
            strokeWeight: 2
        });
        mapPolygon.setMap(map);

    }

}]);