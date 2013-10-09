/**
 * Interface to be used by Android app. All these functions may be called with
 * webview.loadUrl("javascript: Interface.function_name();");
 */

"use strict";

/**
 * If svgapp is defined which is injected by Android app cf.
 * FragmentWebview#initWebview() svgapp.instruct() is used to send a response
 * back to Android app. Otherwise - i.e. if HTML is opened in browser - response
 * is written to the console.
 */
var send_response = function(s) {
	if (typeof svgapp === 'undefined') {
		console.log(s);
	} else {
		svgapp.instruct(s);
	}
};

var send_returnvalue = function(name, value) {
	if (typeof svgapp === 'undefined') {
		console.log('Returned variable ' + name + ' with content: ' + value);
	} else {
		svgapp.return_value(name, value);
	}
};

function Interface() {
	"use strict";
	// var privateVariable = 0;
	// this.publicVariable = 1;
}

Interface.currentsvg = 0;
Interface.disabledAdapted = false;
Interface.dodemowalk = false;

/**
 * Returns a list of all POIs which can be shown inside the Android app to the
 * user.
 */
Interface.get_poiArray = function() {
	var vertexarray = Vertex_container.getAll();
	var poiArray = new Array();
	for ( var i = 0, v = vertexarray[i]; i < vertexarray.length; v = vertexarray[++i]) {
		if (v.getPoi())
			poiArray.push(({
				id : v.getId(),
				short : v.getShortDesc(),
				long : v.getLongDesc()
			}));
	}
	send_returnvalue("poiArray", JSON.stringify(poiArray));
};

// Interface.zoom = function(scale, focusX, focusY) {
// "use strict";
// MZP.scaledZoom(scale, [ focusX, focusY ], Interface.currentsvg);
// };

Interface.position_activate = function() {
	"use strict";
	for ( var i = 0; i < G.svg_parent.length; i++) {
		G.svg_element[i].addEventListener('click', position_click, false);
	}
};

Interface.position_deactivate = function() {
	"use strict";
	for ( var i = 0; i < G.svg_parent.length; i++) {
		G.svg_element[i].removeEventListener('click', position_click, false);
	}
};

Interface.position_delete = function() {
	"use strict";
	position_delete();
};

// translate SVG X,Y and svgId to lat, long, height
Interface.position_translate_svg_gps = function(xPos, yPos, svgid) {
	return convertSVG_GPS(xPos, yPos, svgid);
};

// translate lat, long, height to SVG X,Y and svgId
Interface.position_translate_gps_svg = function(latitude, longitude, height) {
	return convertGPS_SVG(latitude, longitude, height);
};

Interface.position_set = function(latitude, longitude, height) {
	"use strict";
	G.log('latitude:' + latitude + ' longitude:' + longitude + ' height:' + height);
	var position = Interface.position_translate_gps_svg(latitude, longitude, height);
	if (position == null) {
		send_response('position_set_failed');
		send_response('position_translation_failed');
		return;
	}

	var posX = position[0];
	var posY = position[1];
	var svgid = position[2];
	G.log('posX:' + posX + ' posY:' + posY + ' svgid:' + svgid);
	// send_response("position_set");

	if (isNaN(svgid) || G.svg_element[svgid] == undefined) {
		G.log('svgid:' + svgid);
		send_response('position_set_failed');
		return;
	}
	if (isNaN(posX) || posX < 0 || posX > MZP.backup_width[svgid]) {
		G.log('x: ' + posX + "; width: " + MZP.backup_width[svgid]);
		send_response('position_set_failed');
		return;
	}
	if (isNaN(posY) || posY < 0 || posY > MZP.backup_height[svgid]) {
		G.log('y: ' + posY + "; height: " + MZP.backup_height[svgid]);
		send_response('position_set_failed');
		return;
	}

	if (currPositionPoint == null) {
		currPositionPoint = new PositionPoint(svgid, posX, posY);
	} else {
		currPositionPoint.setPosition(svgid, posX, posY);
	}

	send_response('position_is_set');

	Interface.route_refresh();
};

Interface.position_setSVG = function(posX, posY, svgid) {

	if (isNaN(svgid) || G.svg_element[svgid] == undefined) {
		G.log('svgid:' + svgid);
		send_response('position_set_failed');
		return;
	}
	if (isNaN(posX) || posX < 0 || posX > MZP.backup_width[svgid]) {
		G.log('x: ' + posX + "; " + MZP.backup_width[svgid]);
		send_response('position_set_failed');
		return;
	}
	if (isNaN(posY) || posY < 0 || posY > MZP.backup_height[svgid]) {
		G.log('y: ' + posY + "; " + MZP.backup_height[svgid]);
		send_response('position_set_failed');
		return;
	}

	if (currPositionPoint == null) {
		currPositionPoint = new PositionPoint(svgid, posX, posY);
	} else {
		currPositionPoint.setPosition(svgid, posX, posY);
	}

	send_response('position_is_set');

	refresh_location();
	Interface.route_refresh();
};

Interface.position_setID = function(vertexid) {
	var v = Vertex_container.get(vertexid);
	Interface.position_setSVG(v.getX(), v.getY(), v.getSvgid());
};

Interface.position_focus = function() {
	"use strict";
	if (currPositionPoint != null) {
		var svgid = parseInt(currPositionPoint.getSvgid(), 10);
		var xPos = currPositionPoint.getX();
		var yPos = currPositionPoint.getY();
		// handel load time of svg image
		if (svgid != Interface.currentsvg) {
			selectsvg(svgid);
			Interface.currentsvg = svgid;
			window.setTimeout("Interface.position_focus()", 1000);
		} else {
			// MZP.set(xPos, yPos, svgid);
			send_response('position_focus_' + xPos + '_' + yPos);
			// var elem = currPositionPoint.getShape().getClientRects()[0];
			// console.log(elem.left + ', ' + elem.top);
			// window.scrollTo(elem.left, elem.top);
		}
	}
};

Interface.levelup = function() {
	"use strict";
	var id = Interface.currentsvg - 1;
	if (id >= 0) {
		selectsvg(id);
		Interface.currentsvg = id;
	}
};

Interface.leveldown = function() {
	"use strict";
	var id = Interface.currentsvg + 1;
	if (id < G.svg_element.length) {
		selectsvg(id);
		Interface.currentsvg = id;
	}
};

Interface.route_changeDisabledAdapted = function(disabledAdapted) {
	"use strict";
	if (disabledAdapted === true || disabledAdapted === "true")
		Interface.disabledAdapted = true;
	else if (disabledAdapted === false || disabledAdapted === "false")
		Interface.disabledAdapted = false;
	else {
		G.log("unknown value for disabledAdapted: " + disabledAdapted);
		return;
	}

	Interface.route_refresh();
};

Interface.route_enable = function() {
	"use strict";
	if (currPositionPoint == null || currLocation == null) {
		G.log("can not enable route, because no location was set");
		return;
	}

	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].addEventListener('click', navigate, false);
	}
};

Interface.route_disable = function() {
	"use strict";
	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].removeEventListener('click', navigate, false);
	}
};

Interface.route_delete = function() {
	"use strict";
	while (DijkstraArrows.length > 0) {
		(DijkstraArrows.shift()).remove();
	}

	if (Routing_destination != null) {
		Routing_destination.paint();
		Routing_destination = null;
	}
};

Interface.demo = function() {
	// hide all vertices
	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].getElementById('unit_vertex').setAttribute('visibility', 'hidden');
	}
	// set demo position
	Interface.position_setSVG(680, 408, 0);
	// set demo destination
	Interface.route(27);
};

Interface.route_refresh = function() {
	"use strict";
	if (Routing_destination != null) {
		Vertex_clickedID = Routing_destination.getId();
		navigate(null);
	}
};

Interface.route = function(id) {
	"use strict";
	Vertex_clickedID = id;
	navigate(null);
};

function navigate(event) {
	"use strict";

	// repaint old routing destination
	if (Routing_destination != null) {
		Routing_destination.paint();
		Routing_destination = null;
	}

	if (Vertex_clickedID == null) {
		if (event == null) {
			G.log('navigate: event and Vertex_clickedID is null');
			return;
		}
		var posX = MZP.translateX(event);
		var posY = MZP.translateY(event);
		var svgid = G.getSvgId(event);
		var vertexarray = Vertex_container.getAll();
		for ( var i = 0, v = vertexarray[i]; i < vertexarray.length; v = vertexarray[++i]) {
			if (v.getPolygon() == null)
				continue;
			if (v.getSvgid() != svgid)
				continue;

			if (isPositionInPolygon(posX, posY, v.getPolygon())) {
				Routing_destination = v;
				break;
			}
		}
	} else {
		Routing_destination = Vertex_container.get(Vertex_clickedID);
	}

	if (Routing_destination == null) {
		G.log('navigate: no Routing_destination found');
		return;
	}

	Vertex_clickedID = null;
	Routing_destination.paint_destination();

	while (DijkstraArrows.length > 0) {
		(DijkstraArrows.shift()).remove();
	}

	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].removeEventListener('click', navigate, false);
	}

	if (currLocation == null) {
		G.log('navigate: currLocation is null');
		return;
	}

	if (try_preRouting(currLocation, Routing_destination, Interface.disabledAdapted)
			|| dijkstra_reverse(currLocation, Routing_destination, Interface.disabledAdapted, true)) {

		Routing_disabledAdapted = Interface.disabledAdapted;

		// Interface.position_focus();

		send_response("route_success");
	} else {
		send_response("route_failed");
		Routing_destination.paint();
	}
}

Interface.routeGPS = function(latitude, longitude, altitude) {
	"use strict";

	var position = Interface.position_translate_gps_svg(latitude, longitude, altitude);
	if (position == null) {
		G.log('position == null');
		send_response('gpsroute_failed');
		return;
	}

	var posX = position[0];
	var posY = position[1];
	var svgid = position[2];

	if (isNaN(svgid) || G.svg_element[svgid] == undefined) {
		G.log('svgid:' + svgid);
		send_response('gpsroute_failed');
		return;
	}
	if (isNaN(posX) || posX < 0 || posX > MZP.backup_width[svgid]) {
		G.log('x: ' + posX + "; " + MZP.backup_width[svgid]);
		send_response('gpsroute_failed');
		return;
	}
	if (isNaN(posY) || posY < 0 || posY > MZP.backup_height[svgid]) {
		G.log('y: ' + posY + "; " + MZP.backup_height[svgid]);
		send_response('gpsroute_failed');
		return;
	}

	var vertex = getVertexByCoordinates(posX, posY, svgid);
	if (vertex == null) {
		G.log('vertex == null');
		send_response('gpsroute_failed');
		return;
	}

	Vertex_clickedID = vertex.getId();

	navigate(null);
};

Interface.demowalk = function() {
	"use strict";
	if (Interface.dodemowalk) {
		Interface.dodemowalk = false;
	} else {
		Interface.dodemowalk = true;
		DemoWalk();
	}
};

Interface.refresh_rotate = function() {
	"use strict";
	window.setTimeout("calcSvgSize()", 1000);
	// calcSvgSize();
};

Interface.init_test = function() {
	"use strict";
	send_response("init test");
};

Interface.distance = function(source, destination) {
	"use strict";

	// var start_node = Vertex_container.get(source_id);
	// var destination_node = Vertex_container.get(destination_id);

	var start_node = null;
	if (!(source instanceof Vertex)) {
		start_node = Vertex_container.get(source);
	} else {
		start_node = source;
	}
	var destination_node = null;
	if (!(destination instanceof Vertex)) {
		destination_node = Vertex_container.get(destination);
	} else {
		destination_node = destination;
	}

	if (!(dijkstra_reverse(start_node, destination_node, Interface.disabledAdapted, false))) {
		send_response('distance: inf');
		return;
	}

	var node = null;
	var next_node = start_node;
	var distanceSVG = 0;
	var distanceGPS = 0;

	while (true) {
		node = next_node;
		next_node = node.getDijkstraNextVertex();

		if (next_node == 'destination') {
			break;
		}

		var edgelist = node.getEdgelist();
		var distanceFactor = 1;
		for ( var i = 0, e = edgelist[i]; i < edgelist.length; e = edgelist[++i]) {
			if (e.getVertex1().getId() == next_node.getId() || e.getVertex2().getId() == next_node.getId()) {
				distanceFactor = e.getDistanceFactor();
				distanceSVG += e.getDistance() * e.getDistanceFactor();
				break;
			}
		}

		distanceGPS += distanceInMeter(node, next_node) * distanceFactor;

	}

	// G.log('distance in svg: ' + distanceSVG);
	// G.log('distance in meter: ' + distanceGPS);

	send_response('distance: ' + distanceGPS);
};

Interface.distanceToId = function(id) {
	"use strict";

	if (currLocation == null) {
		send_response('distance: noLoc');
		return;
	}

	Interface.distance(currLocation, id);
};

/**
 * only between two parent verteces
 * 
 * @param source_node
 * @param destination_node
 * @returns {Number}
 */
function distanceInMeter(source, destination) {
	"use strict";

	var source_node = null;
	if (!(source instanceof Vertex)) {
		source_node = Vertex_container.get(source);
	} else {
		source_node = source;
	}
	var destination_node = null;
	if (!(destination instanceof Vertex)) {
		destination_node = Vertex_container.get(destination);
	} else {
		destination_node = destination;
	}

	var source_coordinates = convertSVG_GPS(source_node.getX(), source_node.getY(), source_node.getSvgid());
	if (source_coordinates == null) {
		return -1;
	}
	var destination_coordinates = convertSVG_GPS(destination_node.getX(), destination_node.getY(), destination_node
			.getSvgid());
	if (destination_coordinates == null) {
		return -1;
	}

	var long2 = destination_coordinates[1];
	var long1 = source_coordinates[1];
	var lat2 = destination_coordinates[0];
	var lat1 = source_coordinates[0];

	// http://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates
	var eQuatorialEarthRadius = 6378.1370;
	var d2r = (Math.PI / 180);

	var dlong = (long2 - long1) * d2r;
	var dlat = (lat2 - lat1) * d2r;
	var a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1 * d2r) * Math.cos(lat2 * d2r)
			* Math.pow(Math.sin(dlong / 2), 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = eQuatorialEarthRadius * c;

	d *= 1000;

	return d;
}