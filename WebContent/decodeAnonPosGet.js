var Anonposition_container = new IDSet();
var Anonposition_radius = G.scale * 2;
var Injection = "";

function clearPositions() {
	"use strict";

	debug('clear start');

	// delete old positions
	while (!Anonposition_container.isEmpty()) {
		Anonposition_container.getAll()[0].remove();
	}

	Injection = "";

	debug('clear end ' + Anonposition_container.isEmpty());
}

function anonPosInit() {
	"use strict";

	// vertices_hide();
	// edges_hide();
	// edgemarkers_hide(),
	// borderpoints_hide();
	// borderlines_hide();
	// bordergpsmarkers_hide();
	all_overlay_hide();

	// load xml file for gpsmarkers
	load_from_server_xml(anonPosStart);
}

function anonPosStart() {
	"use strict";

	// do nothing on empty get string
	if (window.location.search.substring(1) == "") {
		return;
	}

	// limit tested with firefox
	if (window.location.search.substring(1).length >= 2027)
		debug('querystring might be to long, so not show all positions');

	injectAnonPositions(window.location.search.substring(1));
}

function getQueryVariable(querystring, variable) {
	"use strict";

	// var querystring = window.location.search.substring(1);
	var vars = querystring.split('&');
	for ( var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (decodeURIComponent(pair[0]) == variable) {
			return decodeURIComponent(pair[1].replace(/[+]/g, " "));
		}
	}
	debug('Query variable %s not found', variable);
}

function drawAnonPositions(querystring) {
	"use strict";

	// var querystring = window.location.search.substring(1);

	var anon_id = 0;
	var vars = querystring.split('&');
	for ( var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (decodeURIComponent(pair[0]) == 'p') {
			var p = decodeURIComponent(pair[1]);
			var coordinates = p.split(':');
			if (coordinates.length != 3) {
				debug('coordinates length: ' + coordinates.length);
				continue;
			}

			coordinates = convertGPS_SVG(coordinates);

			if (coordinates == null) {
				debug('coordinates transformation failed');
				continue;
			}

			var x = parseInt(coordinates[0], 10);
			var y = parseInt(coordinates[1], 10);
			var svgid = parseInt(coordinates[2], 10);
			if (svgid == null || isNaN(svgid)
					|| G.svg_element[svgid] == undefined) {
				debug('invalid svgid: ' + svgid);
				continue;
			}
			if (x == null || isNaN(x) || x < 0 || x > MZP.backup_width[svgid]) {
				debug('invalid x: ' + x);
				continue;
			}
			if (y == null | isNaN(y) || y < 0 || y > MZP.backup_height[svgid]) {
				debug('invalid y: ' + y);
				continue;
			}

			// check for collision
			var collision = false;
			var anonpositions = Anonposition_container.getAll();
			for ( var j = 0, a = anonpositions[j]; j < anonpositions.length; a = anonpositions[++j]) {
				if (a.getSvgid() != svgid) {
					continue;
				}

				var distance = parseInt(Math.sqrt(Math.pow(a.getX() - x, 2)
						+ Math.pow(a.getY() - y, 2)), 10);

				if (distance < Anonposition_radius) {
					a.collision();
					collision = true;
					// G.log('collision');
					break;
				}
			}

			if (!collision) {
				var id = Anonposition_container.getUnusedId();
				var ap = new AnonPosition(id, svgid, x, y);
				ap.paint_collision();
			}
		} else if (decodeURIComponent(pair[0]) == 'a') {
			var a = decodeURIComponent(pair[1]);
			var p = a.split('P');
			for ( var j = 0; j < p.length; j++) {
				var coordinates = p[j].split(':');
				if (coordinates.length != 3) {
					// do not complain about empty last split result
					if (coordinates.length == 1 && coordinates[0] == "") {
						continue;
					}
					debug('coordinates length: ' + coordinates.length
							+ '; coordinates: ' + coordinates);
					continue;
				}

				coordinates = convertGPS_SVG(coordinates);

				if (coordinates == null) {
					debug('coordinates transformation failed');
					continue;
				}

				var x = parseInt(coordinates[0], 10);
				var y = parseInt(coordinates[1], 10);
				var svgid = parseInt(coordinates[2], 10);
				if (svgid == null || isNaN(svgid)
						|| G.svg_element[svgid] == undefined) {
					debug('invalid svgid: ' + svgid);
					continue;
				}
				if (x == null || isNaN(x) || x < 0
						|| x > MZP.backup_width[svgid]) {
					debug('invalid x: ' + x);
					continue;
				}
				if (y == null | isNaN(y) || y < 0
						|| y > MZP.backup_height[svgid]) {
					debug('invalid y: ' + y);
					continue;
				}

				var id = Anonposition_container.getUnusedId();
				var ap = new AnonPosition(id, svgid, x, y);
				ap.paint_anonid(anon_id);
			}
			anon_id++;
		}
	}

	var htmlstring = "Info: ";
	htmlstring += '<br>Displaying ' + Anonposition_container.getAll().length
			+ ' positions.';
	if (anon_id != 0) {
		htmlstring += '<br>Displaying ' + (anon_id + 1)
				+ ' different anonymous id\'s.';
	}

	document.getElementById('info').innerHTML = htmlstring;
}

function injectAnonPositions(querystring) {
	"use strict";

	debug('start decoding');
	debug('querystring length: ' + querystring.length);

	// alert('start decoding');

	var start = getQueryVariable(querystring, 'start');
	var end = getQueryVariable(querystring, 'end');
	var htmlstring = "Anonymous Positions";

	if (start != undefined && end != undefined) {
		htmlstring += ' (Start: ' + start + ', End: ' + end + ')';
	} else if (start != undefined) {
		htmlstring += ' (Start: ' + start + ')';
	} else if (end != undefined) {
		htmlstring += ' (Start: ' + end + ')';
	}
	document.getElementById('title').innerHTML = htmlstring;

	drawAnonPositions(querystring);
}

function injectSingleParameter(string) {
	"use strict";

	Injection += string + '&';
}

function injectionEnd() {
	"use strict";

	injectAnonPositions(Injection);
}

function debug(d) {
	if (typeof bridge === "undefined") {
		document.getElementById("debug").innerHTML += d + "<br>";
		console.log(d);
	} else {
		bridge.log(d);
		// document.getElementById("debug").innerHTML = "";
	}

}