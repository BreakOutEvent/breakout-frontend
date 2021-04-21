const $ = require('jquery');
const SLOWOUT = 'Anywhere';

$(document).ready(function () {
  exportsMap.init('map', window.mapData);
});

var exportsMap = {
  map: null
};

var markers_list = [];

exportsMap.init = function (id, teams) {
  if (window.fullheight) {
    $('#' + id).height($(window).height() - 60 - 50);
  }

  var munich = new google.maps.LatLng(48.150676, 11.580984);
  var berlin = new google.maps.LatLng(52.512643, 13.321876);
  var barcelona = new google.maps.LatLng(41.3947688, 2.0787279);
  var geocenter = new google.maps.LatLngBounds(barcelona, berlin);
  var bounds = new google.maps.LatLngBounds();
  var maximum_zoom = 8;
  window.infowindow = new google.maps.InfoWindow();

  var mapOptions = {
    center: munich,
    styles: mapstyle(),
    zoom: maximum_zoom,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: window.scrollwheel | false,
    fullscreenControl: true
  };

  exportsMap.map = new google.maps.Map(document.getElementById(id), mapOptions);
  if (teams.length === 0) {
    markers_list.push(munich);
    markers_list.push(berlin);
    markers_list.push(barcelona);
  }
  drawRoute(teams);
  zoom_in(markers_list, bounds, geocenter, maximum_zoom);

};


// Set Zoom
function zoom_in(markers_list, bounds, geocenter, maximum_zoom) {
  for (var i = 0; i < markers_list.length; i++) {
    bounds.extend((markers_list[i]));
  }
  //center the map to the geometric center of all markers
  exportsMap.map.setCenter(geocenter.getCenter());
  //fit to boundary
  exportsMap.map.fitBounds(bounds);

  //remove one zoom level to ensure no marker is on the edge.
  exportsMap.map.setZoom(exportsMap.map.getZoom() + 3);

  // set minimum zoom
  if (exportsMap.map.getZoom() > maximum_zoom) {
    exportsMap.map.setZoom(maximum_zoom);
  }
}

// Draw the route of each team
var drawRoute = function (teams) {
  var isSingleTeam = teams.length === 1;

  teams.forEach(function (team) {
    if (!team) return;
    var route = [];
    if (team.event.city !== SLOWOUT) {
      var startingposition = new google.maps.LatLng(team.event.startingLocation.latitude, team.event.startingLocation.longitude);
      markers_list.push(startingposition);
      route = [startingposition];
    }
   
    var priorLocation = null;

    team.locations.forEach(function (location) {
      var loc = new google.maps.LatLng(location.latitude, location.longitude);

      if (isSingleTeam) {
        if (team.event.city !== SLOWOUT) {
          route = [startingposition, loc];
        } else {
          route = [loc];
        }
        
        var color = '#919191';

        if (priorLocation) {
          route = [priorLocation, loc];
          color = (team.event.city == SLOWOUT
            ? getHeatMapColor(location.speed * 30 | 0)
            : getHeatMapColor(location.speed | 0));
        }

        var flightPath = new google.maps.Polyline({
          path: route,
          strokeColor: color,
          strokeOpacity: 1.0,
          strokeWeight: 5
        });

        marker(route, team, exportsMap.map, flightPath, false);
        flightPath.setMap(exportsMap.map);
        priorLocation = loc;
      } else {
        route.push(loc);
        markers_list.push(loc);
      }
    });

    if (!isSingleTeam) {
      var flightPath = new google.maps.Polyline({
        path: route,
        strokeColor: getCityColor(team),
        strokeOpacity: 1.0,
        strokeWeight: 3
      });

      marker(route, team, exportsMap.map, flightPath, true);
      flightPath.setMap(exportsMap.map);
    }

  });
};


//Marker on last position
function marker(route, team, map, flightPath, visible) {
  var marker;
  marker = new google.maps.Marker({
    position: route[route.length - 1],
    map: map
  });
  //Hide all Starting Markers
  if (route.length) {
    marker.setVisible(visible); //but still keep them in the array
  }

  //Adds the last position to the markers_list for autofit
  markers_list.push(route[route.length - 1]);


  google.maps.event.addListener(marker, 'click', function () {
    infowindow.setContent(makeContent(team));
    infowindow.open(map, marker);
  });
  google.maps.event.addListener(flightPath, 'click', function () {
    infowindow.setContent(makeContent(team));
    infowindow.open(map, marker);
  });
}


//Window that shows on a marker
// Hier kannst du das Html ändern. Ansonsten natürlich auch über map.css
function makeContent(team) {
  var contentstring = '<div id="content">' +
    '<div id="siteNotice">' +
    '</div>' +
    '<h4 id="firstHeading" class="firstHeading"><a href="/team/' + team.id + '">' + team.name + '</a></h4>';

  if (team.members) {
    contentstring += '<p>' + team.members[0].firstname + ' und ' + team.members[1].firstname + ' aus ' + team.event.city + '</p></div>';
  } else {
    contentstring += '<p>aus ' + team.event.city + '</p></div>';
  }
  return contentstring;
}

function colorGradientByWeight(color1, color2, weight) {
  var p = weight;
  var w = p * 2 - 1;
  var w1 = (w / 1 + 1) / 2;
  var w2 = 1 - w1;
  var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2)];
  return rgb;
}

//Select Teamcolor for Event
function getCityColor(team) {
  const colorlist = {
    'München': '#F7931D',
    'Berlin': '#5AACA5',
    'Barcelona': '#415dac',
    'Köln': '#6b5aac'
  };

  return colorlist[team.event.city] ? colorlist[team.event.city] : stringColor(team.event.city);
}

function stringColor(string) {
  if (string === SLOWOUT) return '#e6823c';
  var hash = 0;
  if (string.length === 0) return hash;
  for (var i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  var color = '#';
  for (var j = 0; j < 3; j++) {
    var value = (hash >> (j * 8)) & 255;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

//Select Teamcolor for Munich/Berlin
function getHeatMapColor(speed) {

  var normSpeed = Math.log(Math.log(speed + 11.8)) - 0.9;
  //[255, 128, 0],[106, 185, 255]
  var rgb = colorGradientByWeight([0, 255, 0], [255, 0, 0], normSpeed);
  var rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');

  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}


//Map Night-Daystyle -> only Day_style
//Only Select one Style
function mapstyle() {

  // TODO: For now disable eslint here, maybe fix to singlequotes some time
  /* eslint-disable*/
  var day_map = [{
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [{"visibility": "on"}, {"color": "#e0efef"}]
  }, {
    "featureType": "poi",
    "elementType": "geometry.fill",
    "stylers": [{"visibility": "on"}, {"hue": "#1900ff"}, {"color": "#c0e8e8"}]
  }, {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"lightness": 100}, {"visibility": "simplified"}]
  }, {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [{"visibility": "off"}]
  }, {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{"visibility": "on"}, {"lightness": 700}]
  }, {"featureType": "water", "elementType": "all", "stylers": [{"color": "#7dcdcd"}]}];
  var night_map = [{
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#ffffff"}]
  }, {
    "featureType": "all",
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#000000"}, {"lightness": 13}]
  }, {
    "featureType": "administrative",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#000000"}]
  }, {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#144b53"}, {"lightness": 14}, {"weight": 1.4}]
  }, {"featureType": "landscape", "elementType": "all", "stylers": [{"color": "#08304b"}]}, {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{"color": "#0c4152"}, {"lightness": 5}]
  }, {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#000000"}]
  }, {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#0b434f"}, {"lightness": 25}]
  }, {
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#000000"}]
  }, {
    "featureType": "road.arterial",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#0b3d51"}, {"lightness": 16}]
  }, {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [{"color": "#000000"}]
  }, {"featureType": "transit", "elementType": "all", "stylers": [{"color": "#146474"}]}, {
    "featureType": "water",
    "elementType": "all",
    "stylers": [{"color": "#021019"}]
  }];
  var breakout_map_2015 = [{
    featureType: "administrative",
    elementType: "labels.text",
    stylers: [{visibility: "on"}]
  }, {
    featureType: "administrative",
    elementType: "labels.icon",
    stylers: [{visibility: "simplified"}]
  }, {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{color: "#ababab"}]
  }, {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{visibility: "off"}]
  }, {
    featureType: "administrative.locality",
    elementType: "all",
    stylers: [{visibility: "on"}]
  }, {
    featureType: "administrative.locality",
    elementType: "labels.text",
    stylers: [{visibility: "on"}]
  }, {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{color: "#404041"}]
  }, {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{visibility: "on"}, {color: "#e3e3e3"}]
  }, {featureType: "poi", elementType: "all", stylers: [{visibility: "off"}]}, {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{color: "#cccccc"}]
  }, {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{color: "#cccccc"}, {weight: "0.50"}]
  }, {featureType: "road", elementType: "labels.icon", stylers: [{saturation: "-100"}]}, {
    featureType: "road.highway",
    elementType: "all",
    stylers: [{visibility: "simplified"}]
  }, {
    featureType: "road.highway",
    elementType: "labels",
    stylers: [{visibility: "off"}]
  }, {featureType: "road.arterial", elementType: "all", stylers: [{visibility: "on"}]}, {
    featureType: "road.local",
    elementType: "all",
    stylers: [{visibility: "on"}]
  }, {featureType: "transit", elementType: "labels.icon", stylers: [{visibility: "off"}]}, {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{visibility: "off"}]
  }, {
    featureType: "transit.line",
    elementType: "labels.text",
    stylers: [{visibility: "off"}]
  }, {
    featureType: "transit.station.airport",
    elementType: "geometry",
    stylers: [{visibility: "off"}]
  }, {
    featureType: "transit.station.airport",
    elementType: "labels",
    stylers: [{visibility: "off"}]
  }, {featureType: "water", elementType: "geometry", stylers: [{color: "#b1b1b1"}]}, {
    featureType: "water",
    elementType: "labels",
    stylers: [{visibility: "off"}]
  }];
  /* eslint-enable */

  // TODO: Will we ever use another map style again?
  // var date = new Date();
  // var hour = date.getHours();
  // if(6 < hour && hour < 21) {
  //   return night_map;
  // } else {
  // return day_map;
  // }
  return breakout_map_2015;
}

module.exports = exportsMap;
