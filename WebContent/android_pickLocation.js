/* Code based on Google Map APIv3 Tutorials */

var gmapdata;
var gmapmarker;
var infoWindow;

var def_zoomval = 17;
var def_latval = 53.631013;
var def_longval = 10.005605;

function if_map_setCoordinate(latitude, longitude) {
	document.getElementById("gpsmarker_latitude").value = latitude;
	document.getElementById("gpsmarker_longitude").value = longitude;
	var coordinate = new google.maps.LatLng(latitude, longitude);
	gmapmarker.setPosition(coordinate);
	if_gmap_updateInfoWindow();
}

function if_gmap_init() {
	var curpoint = new google.maps.LatLng(def_latval, def_longval);

	gmapdata = new google.maps.Map(document.getElementById("mapitems"), {
		center : curpoint,
		zoom : def_zoomval,
		// mapTypeId : 'roadmap'
		mapTypeId : "OSM",
		mapTypeControlOptions : {
			mapTypeIds : [ "roadmap", "satellite", "OSM" ]
		}

	});

	gmapdata.mapTypes.set("OSM", new google.maps.ImageMapType({
		getTileUrl : function(coord, zoom) {
			return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x
					+ "/" + coord.y + ".png";
		},
		tileSize : new google.maps.Size(256, 256),
		name : "OpenStreetMap",
		maxZoom : 18
	}));

	gmapmarker = new google.maps.Marker({
		map : gmapdata,
		position : curpoint
	});

	infoWindow = new google.maps.InfoWindow;
	google.maps.event.addListener(gmapdata, 'click', function(event) {

		if_map_setCoordinate(event.latLng.lat().toFixed(6), event.latLng.lng()
				.toFixed(6));
	});

	google.maps.event.addListener(gmapmarker, 'click', function() {
		if_gmap_updateInfoWindow();
		infoWindow.open(gmapdata, gmapmarker);

	});

	document.getElementById("gpsmarker_longitude").value = def_longval;
	document.getElementById("gpsmarker_latitude").value = def_latval;

	return false;
} // end of if_gmap_init

function if_gmap_loadpicker() {
	var longval = document.getElementById("gpsmarker_longitude").value;
	var latval = document.getElementById("gpsmarker_latitude").value;

	if (java == undefined)
		alert("doof");
	else
		alert("gut");
	java.exit();

	if (longval.length > 0) {
		if (isNaN(parseFloat(longval)) == true) {
			longval = def_longval;
		} // end of if
	} else {
		longval = def_longval;
	} // end of if

	if (latval.length > 0) {
		if (isNaN(parseFloat(latval)) == true) {
			latval = def_latval;
		} // end of if
	} else {
		latval = def_latval;
	} // end of if

	var curpoint = new google.maps.LatLng(latval, longval);

	gmapmarker.setPosition(curpoint);
	gmapdata.setCenter(curpoint);
	// gmapdata.setZoom(zoomval);

	if_gmap_updateInfoWindow();
	return false;
} // end of if_gmap_loadpicker

function if_gmap_updateInfoWindow() {
	infoWindow.setContent("Latitude: "
			+ gmapmarker.getPosition().lat().toFixed(6) + "<br>"
			+ "Longitude: " + gmapmarker.getPosition().lng().toFixed(6));

	if (typeof Interface !== 'undefined')
		Interface.position_set(gmapmarker.getPosition().lat().toFixed(6),
				gmapmarker.getPosition().lng().toFixed(6), 0);

	if (typeof bridge === "undefined") {
		document.getElementById("debug").innerHTML = "bridge gibt es nicht.";
	} else {
		if (typeof bridge.setCoordinate === "function") {
			bridge.setCoordinate(gmapmarker.getPosition().lat().toFixed(6),
					gmapmarker.getPosition().lng().toFixed(6));
		} else {
			document.getElementById("debug").innerHTML = "bridge.setCoordinate() no fct";
		}
	}

} // end of if_gmap_bindInfoWindow

function testfct() {
	document.getElementById("gpsmarker_longitude").value = "testfct() was called.";
	alert("asdf");
} // end of testfct

