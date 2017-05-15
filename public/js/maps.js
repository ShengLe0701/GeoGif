var map;
var poly;
var path;
var markers = [];
var markersPath = [];
var lastMarker;
var worldSelected;
var hasInput;
var readyLock;
var squareMilage;
var uniqueId = 1;
var UniqueId = 1;

//$('#spinner').show();
function loadMap(){
var myLatlng = new google.maps.LatLng(41.850033, -87.6500523);
	if(page == 'addOverlay')
	{
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 4,
    center: myLatlng
  });
		
var polyOptions = {
    fillColor: '#B0E18B',
    fillOpacity: .4,
    strokeColor: '#898482',
    strokeOpacity: 1.0,
    strokeWeight: 3
}

poly = new google.maps.Polyline(polyOptions);
poly.setMap(map);

map.addListener('click', addLatLng);
map.addListener('rightclick', removeLast);

function addLatLng(event) {
 document.getElementById("mapStatus").innerHTML = "Use the map tools to complete your geofence";
	
$('#selectWorld').addClass('animated pulse');
$('#clearSelection').addClass('animated pulse');
$('#removeLast').addClass('animated pulse');
$('#lockIn').addClass('animated pulse');

  path = poly.getPath();
  path.push(event.latLng);
	
 var whitecircle ={
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#F7F7F7',
    fillOpacity: .8,
    scale: 4.5,
    strokeColor: '#918E82',
    strokeWeight: 1
};
	var bluecircle ={
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#4CBBF3',
    fillOpacity: .8,
    scale: 4.5,
    strokeColor: '#918E82',
    strokeWeight: 1
};
	
  var marker = new google.maps.Marker({
    position: event.latLng,
    title: '#' + path.getLength(),
    map: map,
	  draggable: true,
	  icon: bluecircle
  });
	
	marker.position = event.latLng;
	marker.id = uniqueId;
   uniqueId++;
	
	markers.push(marker);
	markersPath.push(new google.maps.LatLng(marker.position.lat, marker.position.long));
	
	squareMilage = getMiles(google.maps.geometry.spherical.computeArea(path));
	document.getElementById("pointsNumber").innerHTML = path.getLength() + " markers dropped";
	squareMilage = numeral(squareMilage).format('0.0a');
	document.getElementById("squareNumber").innerHTML = squareMilage + " sq mi. selected";
	
	var redrawListener = marker.addListener('dragend', redrawPolyline);
}
	
function redrawPolyline() {
	path.clear();

	poly.setPath(markersPath);
}
		
function getMiles(i) {
     return i*0.000621371192;
}

function clearMap(){
	path.clear();
	deleteMarkers();
}
		
function deleteMarkers(){
	        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
}

    function DeleteMarker(id) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].id == id) {         
                markers[i].setMap(null);
                markers.splice(i, 1);
                return;
            }
        }
    }
	
var worldDiv = document.getElementById("selectWorld");
var clearDiv = document.getElementById("clearSelection");
var removeDiv = document.getElementById("removeLast");
var lockDiv = document.getElementById("lockIn");
  
worldDiv.addEventListener("click", selectWorld);
clearDiv.addEventListener("click", clearSelection);
removeDiv.addEventListener("click", removeLast);
lockDiv.addEventListener("click", lockIn);

  
function selectWorld(){
$('#selectWorld').animateCss('bounce');
bootbox.confirm("Are you sure you want to select the entire world for this region, allowing everyone to access this overlay?", function(result) {
  Example.show("Confirm result: "+result);
}); 
}
	
function clearSelection(){
if(!markers){
	return false;
} else {
$('#clearSelection').animateCss('pulse');
clearMap();
}
}

function removeLast(){
if(markers){
$('#removeLast').animateCss('rubberBand');
DeleteMarker(markers.length);
redrawPolyline();
} else {
return false;
}
}
	
  function lockIn(){
$('#lockIn').animateCss('tada');
	  //convert to polygon
document.getElementById("mapStatus").innerHTML = "Reshape the geofence as you see fit then click next";
 }
	
	 function clearPosition(){
  $('#map-canvas').css('position','static');
		 $('#spinner').hide();
}
  google.maps.event.addDomListener(window, 'load', clearPosition);
	}
if(page == 'globalMap')
{
  var map = new google.maps.Map(document.getElementById('map-overview'), {
    zoom: 4,
    center: myLatlng
  });
}
		
	 function clearPosition(){
  $('#map-overview').css('position','static');
		 $('#spinner').hide();
}
  google.maps.event.addDomListener(window, 'load', clearPosition);
}