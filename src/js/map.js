$(document).ready(function () {
  exportsMap.init('map',window.mapData);
});

var exportsMap =  {
  map: null
};

var markers_list = [];

exportsMap.init = function (id,teams) {
  var munich = new google.maps.LatLng(48.150676, 11.580984);
  var berlin = new google.maps.LatLng(52.512643, 13.321876);
  var geocenter = new google.maps.LatLngBounds(munich, berlin);
  var bounds = new google.maps.LatLngBounds();
  var maximum_zoom = 8;
  window.infowindow = new google.maps.InfoWindow();
  
  var mapOptions = {
    center: munich,
    styles: mapstyle(),
    zoom: maximum_zoom,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false
  };

  exportsMap.map = new google.maps.Map(document.getElementById(id), mapOptions);
  if(teams.length == 0) {
    markers_list.push(munich);
    markers_list.push(berlin);
  }
  drawRoute(teams);
  zoom_in(markers_list, bounds, geocenter, maximum_zoom);

};


// Set Zoom
function zoom_in(markers_list, bounds, geocenter, maximum_zoom){
  for(var i = 0; i < markers_list.length; i++) {
    bounds.extend((markers_list[i]));
  }
  //center the map to the geometric center of all markers
  exportsMap.map.setCenter(geocenter.getCenter());
  //fit to boundary
  exportsMap.map.fitBounds(bounds);

  //remove one zoom level to ensure no marker is on the edge.
  exportsMap.map.setZoom(exportsMap.map.getZoom()+3);

  // set minimum zoom
  if(exportsMap.map.getZoom()> maximum_zoom){
    exportsMap.map.setZoom(maximum_zoom);
  }
}

// Draw the route of each team
var drawRoute = function (teams){
  teams.forEach(function (team){
    if(!team) return;
    var startingposition = new google.maps.LatLng(team.event.startingLocation.latitude, team.event.startingLocation.longitude);
    var route = [startingposition];
    markers_list.push(startingposition);
    var i;

    for (i = 0; i < team.locations.length; i++) {
      var loc = new google.maps.LatLng(team.locations[i].latitude, team.locations[i].longitude);
      route.push(loc);
      markers_list.push(loc);
    }

    var flightPath = new google.maps.Polyline({
      path:route,
      strokeColor: getColor(team),
      strokeOpacity: 1.0,
      strokeWeight: 3
    });
    marker(route, team, exportsMap.map, flightPath);

    flightPath.setMap(exportsMap.map);
  });
};


//Marker on last position
function marker(route, team, map, flightPath) {
  var marker;
  marker = new google.maps.Marker({
    position: route[route.length-1],
    map: map
  });
  //Hide all Starting Markers
  if(route.length == 1){
    marker.setVisible(false); //but still keep them in the array
  }

  //Adds the last position to the markers_list for autofit
  markers_list.push(route[route.length - 1]);


  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(makeContent(team));
    infowindow.open(map, marker);
  });
  google.maps.event.addListener(flightPath, 'click', function() {
    infowindow.setContent(makeContent(team));
    infowindow.open(map, marker);
  });
}



//Window that shows on a marker
// Hier kannst du das Html ändern. Ansonsten natürlich auch über map.css
function makeContent(team) {
  var contentstring = '<div id="content">'+
    '<div id="siteNotice">'+
    '</div>'+
    '<h4 id="firstHeading" class="firstHeading"><a href="/team/'+ team.id + '">'+ team.name + '</a></h4>';

    if(team.members) {
      contentstring += '<p>' + team.members[0].firstname + ' und ' + team.members[1].firstname + ' aus ' + team.event.city + '</p></div>';
    } else {
      contentstring += '<p>aus ' + team.event.city + '</p></div>'
    }
  return contentstring;
}



//Select Teamcolor for Munich/Berlin
function getColor(team) {
  var colorlist = {
    "München": '#F7931D',
    "Berlin": '#5AACA5'
  };
  return colorlist[team.event.city];
}

//Map Night-Daystyle -> only Day_style
//Only Select one Style
function mapstyle (){
  var date = new Date();
  var day_map = [{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#7dcdcd"}]}];
  var night_map = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}];
  var breakout_map_2015=[{featureType:"administrative",elementType:"labels.text",stylers:[{visibility:"on"}]},{featureType:"administrative",elementType:"labels.icon",stylers:[{visibility:"simplified"}]},{featureType:"administrative.country",elementType:"geometry.stroke",stylers:[{color:"#ababab"}]},{featureType:"administrative.province",elementType:"geometry.stroke",stylers:[{visibility:"off"}]},{featureType:"administrative.locality",elementType:"all",stylers:[{visibility:"on"}]},{featureType:"administrative.locality",elementType:"labels.text",stylers:[{visibility:"on"}]},{featureType:"administrative.locality",elementType:"labels.text.fill",stylers:[{color:"#404041"}]},{featureType:"landscape",elementType:"geometry",stylers:[{visibility:"on"},{color:"#e3e3e3"}]},{featureType:"poi",elementType:"all",stylers:[{visibility:"off"}]},{featureType:"road",elementType:"geometry.fill",stylers:[{color:"#cccccc"}]},{featureType:"road",elementType:"geometry.stroke",stylers:[{color:"#cccccc"},{weight:"0.50"}]},{featureType:"road",elementType:"labels.icon",stylers:[{saturation:"-100"}]},{featureType:"road.highway",elementType:"all",stylers:[{visibility:"simplified"}]},{featureType:"road.highway",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road.arterial",elementType:"all",stylers:[{visibility:"on"}]},{featureType:"road.local",elementType:"all",stylers:[{visibility:"on"}]},{featureType:"transit",elementType:"labels.icon",stylers:[{visibility:"off"}]},{featureType:"transit.line",elementType:"geometry",stylers:[{visibility:"off"}]},{featureType:"transit.line",elementType:"labels.text",stylers:[{visibility:"off"}]},{featureType:"transit.station.airport",elementType:"geometry",stylers:[{visibility:"off"}]},{featureType:"transit.station.airport",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"water",elementType:"geometry",stylers:[{color:"#b1b1b1"}]},{featureType:"water",elementType:"labels",stylers:[{visibility:"off"}]}];
  // var hour = date.getHours();
  // if(6 < hour && hour < 21) {
  //   return night_map;
  // } else {
  // return day_map;
  // }
  return breakout_map_2015;
}

module.exports = exportsMap;