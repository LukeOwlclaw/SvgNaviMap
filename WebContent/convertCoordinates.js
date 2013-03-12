function convertGPS_SVG(latitude, longitude, height) {
	"use strict";
	// test for array given
	if (typeof (latitude) == "object" && longitude == undefined
			&& height == undefined) {
		height = latitude[2];
		longitude = latitude[1];
		latitude = latitude[0];
	}

	height = parseFloat(height);
	longitude = parseFloat(longitude);
	latitude = parseFloat(latitude);

	// for testing...
	// Dieser kleine Eingriff erlaubt die Position mittels wificompass zu
	// erfassen.
	// Wenn wificompass die gleiche Bilddatei, wie die Dibus-App nutzt, stimmen
	// die Koordinaten überein. Es muss also nichts umgerechnet werden.
	if (latitude < 53.4 || latitude > 53.7 || longitude < 9.9
			|| longitude > 10.1)
		return [ longitude, latitude, 0 ];
	// end: for testing

	// G.log("convertGPS_SVG: lat, long, alt: " + latitude + ", " + longitude
	// + ", " + height);

	var svgid = -1;

	for ( var i = 0; i < G.svg_element.length; i++) {
		if (Level_min_altitude[i] <= height && height <= Level_max_altitude[i]) {
			svgid = i;
			break;
		}
	}

	if (svgid == -1) {
		G.log('no level matched for height: ' + height);
		return null;
	}

	var allgpsmarkers = Gpsmarker_container.getAll();
	var levelgpsmarkers = new Array();
	for ( var j = 0, g = allgpsmarkers[j]; j < allgpsmarkers.length; g = allgpsmarkers[++j]) {
		if (g.getSvgid() == svgid) {
			levelgpsmarkers.push(g);
		}
	}

	if (levelgpsmarkers.length < 2) {
		G.log('not enough gps markers (' + levelgpsmarkers.length
				+ ') in level ' + svgid);
		return null;
	}

	// test: take only nearest points (up to 3)
	var gpsmarker_array = new Array();
	var distance_array = new Array();
	for ( var j = 0, g = levelgpsmarkers[j]; j < levelgpsmarkers.length; g = levelgpsmarkers[++j]) {
		var distance = Math.sqrt(Math.pow(g.getLatitude() - latitude, 2)
				+ Math.pow(g.getLongitude() - longitude, 2));
		var ret = insertGpsmarkerSortedDistance(gpsmarker_array,
				distance_array, g, distance);
		gpsmarker_array = ret[0];
		distance_array = ret[1];
	}
	var min = 3;
	if (min > gpsmarker_array.length) {
		min = gpsmarker_array.length;
	}
	levelgpsmarkers = new Array();
	for ( var j = 0, g = gpsmarker_array[j]; j < min; g = gpsmarker_array[++j]) {
		levelgpsmarkers.push(g);
	}

	// for ( var j = 0, g = levelgpsmarkers[j]; j < levelgpsmarkers.length; g =
	// levelgpsmarkers[++j]) {
	// console.log('selected gpsmarker: ' + g.getId());
	// }

	// calc focus
	var focusGPS_x = 0;
	var focusGPS_y = 0;
	var focusSVG_x = 0;
	var focusSVG_y = 0;
	for ( var j = 0, g = levelgpsmarkers[j]; j < levelgpsmarkers.length; g = levelgpsmarkers[++j]) {
		focusGPS_y += g.getLatitude();
		focusGPS_x += g.getLongitude();
		focusSVG_x += g.getX();
		focusSVG_y += g.getY();
	}
	focusGPS_x = focusGPS_x / levelgpsmarkers.length;
	focusGPS_y = focusGPS_y / levelgpsmarkers.length;
	focusSVG_x = focusSVG_x / levelgpsmarkers.length;
	focusSVG_y = focusSVG_y / levelgpsmarkers.length;

	// console.log("focusGPS: lat, long: " + focusGPS_y + ", " + focusGPS_x);
	// console.log("focusSVG: x, y: " + focusSVG_x + ", " + focusSVG_y);

	// calc scale
	var scalelist = new Array();
	for ( var j = 0, g = levelgpsmarkers[j]; j < levelgpsmarkers.length; g = levelgpsmarkers[++j]) {
		var scaleGPS = Math.sqrt(Math.pow(g.getLatitude() - focusGPS_y, 2)
				+ Math.pow(g.getLongitude() - focusGPS_x, 2));
		var scaleSVG = Math.sqrt(Math.pow(g.getX() - focusSVG_x, 2)
				+ Math.pow(g.getY() - focusSVG_y, 2));

		var scale = scaleSVG / scaleGPS;
		// console.log("g id: " + g.getId() + " scale: " + scale);
		scalelist = insertSorted(scalelist, scale);
	}

	// calc rotation
	var alphalist = new Array();
	for ( var j = 0, g = levelgpsmarkers[j]; j < levelgpsmarkers.length; g = levelgpsmarkers[++j]) {
		// console.log("g id: " + g.getId());
		var alphaGPS = Math.atan2(g.getLatitude() - focusGPS_y, g
				.getLongitude()
				- focusGPS_x);

		var alphaSVG = Math.atan2(-(g.getY() - focusSVG_y), g.getX()
				- focusSVG_x);
		// console.log('alphaSVG: ' + todeg(alphaSVG));
		// console.log('alphaGPS: ' + todeg(alphaGPS));
		var alpha = alphaSVG - alphaGPS;
		// console.log('alpha1: ' + todeg(alpha));

		while (alpha < 0) {
			alpha += 2 * Math.PI;
		}
		while (alpha > 2 * Math.PI) {
			alpha -= 2 * Math.PI;
		}
		// console.log('alpha2: ' + todeg(alpha));
		//
		// console.log('---');

		alphalist = insertSorted(alphalist, alpha);
	}

	// taking scale and alpha
	var scale = scalelist[Math.ceil(scalelist.length / 2)];
	var alpha = alphalist[Math.ceil(alphalist.length / 2)];

	scale = 0;
	for ( var i = 0; i < scalelist.length; i++) {
		scale += scalelist[i];
	}
	scale /= scalelist.length;

	alpha = 0;
	for ( var i = 0; i < alphalist.length; i++) {
		alpha += alphalist[i];
	}
	alpha /= alphalist.length;

	// convert point
	var scale_point = Math.sqrt(Math.pow(latitude - focusGPS_y, 2)
			+ Math.pow(longitude - focusGPS_x, 2));
	// console.log("scale_point: " + scale_point + ', invers: '
	// + (1 / scale_point));
	// console.log("scale: " + scale + ", scale inverted: " + (1 / scale));
	var alpha_point = Math.atan2(latitude - focusGPS_y, longitude - focusGPS_x);
	// console.log("alpha_point: " + todeg(alpha_point));
	// console.log("alpha: " + todeg(alpha));

	var x_point = focusSVG_x + scale * scale_point
			* Math.cos(alpha_point + alpha);
	var y_point = focusSVG_y - scale * scale_point
			* Math.sin(alpha_point + alpha);

	// G.log("convertGPS_SVG: return: " + x_point + ", " + y_point + ", " +
	// svgid);

	return [ x_point, y_point, svgid ];
}

function convertSVG_GPS(xPos, yPos, svgid) {
	"use strict";
	// test for array given
	if (typeof (xPos) == "object" && yPos == undefined && svgid == undefined) {
		svgid = xPos[2];
		yPos = xPos[1];
		xPos = xPos[0];
	}

	svgid = parseInt(svgid, 10);
	yPos = parseInt(yPos, 10);
	xPos = parseInt(xPos, 10);

	// G.log("convertSVG_GPS: xPos, yPos, svgid: " + xPos + ", " + xPos + ", "
	// + svgid);

	var height = (Level_min_altitude[svgid] + Level_max_altitude[svgid]) / 2;

	var allgpsmarkers = Gpsmarker_container.getAll();
	var levelgpsmarkers = new Array();
	for ( var j = 0, g = allgpsmarkers[j]; j < allgpsmarkers.length; g = allgpsmarkers[++j]) {
		if (g.getSvgid() == svgid) {
			levelgpsmarkers.push(g);
		}
	}

	if (levelgpsmarkers.length < 2) {
		G.log('not enough gps markers (' + levelgpsmarkers.length
				+ ') in level ' + svgid);
		return null;
	}

	// test: take only nearest points (up to 3)
	var gpsmarker_array = new Array();
	var distance_array = new Array();
	for ( var j = 0, g = levelgpsmarkers[j]; j < levelgpsmarkers.length; g = levelgpsmarkers[++j]) {
		var distance = Math.sqrt(Math.pow(g.getX() - xPos, 2)
				+ Math.pow(g.getY() - yPos, 2));
		var ret = insertGpsmarkerSortedDistance(gpsmarker_array,
				distance_array, g, distance);
		gpsmarker_array = ret[0];
		distance_array = ret[1];
	}
	var min = 3;
	if (min > gpsmarker_array.length) {
		min = gpsmarker_array.length;
	}
	levelgpsmarkers = new Array();
	for ( var j = 0, g = gpsmarker_array[j]; j < min; g = gpsmarker_array[++j]) {
		levelgpsmarkers.push(g);
	}

	// for ( var j = 0, g = levelgpsmarkers[j]; j < levelgpsmarkers.length; g =
	// levelgpsmarkers[++j]) {
	// console.log('selected gpsmarker: ' + g.getId());
	// }

	// calc focus
	var focusGPS_x = 0;
	var focusGPS_y = 0;
	var focusSVG_x = 0;
	var focusSVG_y = 0;
	for ( var j = 0, g = levelgpsmarkers[j]; j < levelgpsmarkers.length; g = levelgpsmarkers[++j]) {
		focusGPS_y += g.getLatitude();
		focusGPS_x += g.getLongitude();
		focusSVG_x += g.getX();
		focusSVG_y += g.getY();
	}
	focusGPS_x = focusGPS_x / levelgpsmarkers.length;
	focusGPS_y = focusGPS_y / levelgpsmarkers.length;
	focusSVG_x = focusSVG_x / levelgpsmarkers.length;
	focusSVG_y = focusSVG_y / levelgpsmarkers.length;

	// console.log("focusGPS: lat, long: " + focusGPS_y + ", " + focusGPS_x);
	// console.log("focusSVG: x, y: " + focusSVG_x + ", " + focusSVG_y);

	// calc scale
	var scalelist = new Array();
	for ( var j = 0, g = levelgpsmarkers[j]; j < levelgpsmarkers.length; g = levelgpsmarkers[++j]) {
		var scaleGPS = Math.sqrt(Math.pow(g.getLatitude() - focusGPS_y, 2)
				+ Math.pow(g.getLongitude() - focusGPS_x, 2));
		var scaleSVG = Math.sqrt(Math.pow(g.getX() - focusSVG_x, 2)
				+ Math.pow(g.getY() - focusSVG_y, 2));

		var scale = scaleSVG / scaleGPS;
		// console.log("g id: " + g.getId() + " scale: " + scale);
		scalelist = insertSorted(scalelist, scale);
	}

	// calc rotation
	var alphalist = new Array();
	for ( var j = 0, g = levelgpsmarkers[j]; j < levelgpsmarkers.length; g = levelgpsmarkers[++j]) {
		// console.log("g id: " + g.getId());
		var alphaGPS = Math.atan2(g.getLatitude() - focusGPS_y, g
				.getLongitude()
				- focusGPS_x);

		var alphaSVG = Math.atan2(-(g.getY() - focusSVG_y), g.getX()
				- focusSVG_x);
		// console.log('alphaSVG: ' + todeg(alphaSVG));
		// console.log('alphaGPS: ' + todeg(alphaGPS));
		var alpha = alphaSVG - alphaGPS;
		// console.log('alpha1: ' + todeg(alpha));

		while (alpha < 0) {
			alpha += 2 * Math.PI;
		}
		while (alpha > 2 * Math.PI) {
			alpha -= 2 * Math.PI;
		}
		// console.log('alpha2: ' + todeg(alpha));
		//
		// console.log('---');

		alphalist = insertSorted(alphalist, alpha);
	}

	// taking scale and alpha
	var scale = scalelist[Math.ceil(scalelist.length / 2)];
	var alpha = alphalist[Math.ceil(alphalist.length / 2)];

	scale = 0;
	for ( var i = 0; i < scalelist.length; i++) {
		scale += scalelist[i];
	}
	scale /= scalelist.length;

	alpha = 0;
	for ( var i = 0; i < alphalist.length; i++) {
		alpha += alphalist[i];
	}
	alpha /= alphalist.length;

	// convert point
	var scale_point = Math.sqrt(Math.pow(xPos - focusSVG_x, 2)
			+ Math.pow(yPos - focusSVG_y, 2));
	// console.log("scale_point: " + scale_point + ', invers: '
	// + (1 / scale_point));
	// console.log("scale: " + scale + ", scale inverted: " + (1 / scale));
	var alpha_point = Math.atan2(-(yPos - focusSVG_y), xPos - focusSVG_x);
	// console.log("alpha_point: " + todeg(alpha_point));
	// console.log("alpha: " + todeg(alpha));

	var longitude = focusGPS_x + (1 / scale) * scale_point
			* Math.cos(alpha_point - alpha);
	var latitude = focusGPS_y + (1 / scale) * scale_point
			* Math.sin(alpha_point - alpha);

	// G.log("convertSVG_GPS: return: " + latitude + ", " + longitude + ", "
	// + height);

	return [ latitude, longitude, height ];
}

function insertSorted(array, element) {
	"use strict";
	if (array.length == 0) {
		var ret = new Array();
		ret.push(element);
		return ret;
	}
	if (array.length == 1) {
		if (element <= array[0]) {
			array.unshift(element);
			return array;
		}

		array.push(element);
		return array;
	}

	var pivot = Math.ceil(array.length / 2);
	var lhs = array.slice(0, pivot);
	var rhs = array.slice(pivot);

	if (element <= array[pivot])
		return insertSorted(lhs, element).concat(rhs);

	return lhs.concat(insertSorted(rhs, element));
}

function todeg(alpha) {
	"use strict";
	return alpha * 180 / Math.PI;
}

function insertGpsmarkerSortedDistance(gpsmarker_array, distance_array,
		gps_marker, distance) {
	"use strict";
	if (gpsmarker_array.length == 0) {
		var ret0 = new Array();
		ret0.push(gps_marker);
		var ret1 = new Array();
		ret1.push(distance);
		return [ ret0, ret1 ];
	}
	if (gpsmarker_array.length == 1) {
		if (distance <= distance_array[0]) {
			gpsmarker_array.unshift(gps_marker);
			distance_array.unshift(distance);
			return [ gpsmarker_array, distance_array ];
		}

		gpsmarker_array.push(gps_marker);
		distance_array.push(distance);
		return [ gpsmarker_array, distance_array ];
	}

	var pivot = Math.ceil(gpsmarker_array.length / 2);
	var lhs_gps = gpsmarker_array.slice(0, pivot);
	var rhs_gps = gpsmarker_array.slice(pivot);
	var lhs_dis = distance_array.slice(0, pivot);
	var rhs_dis = distance_array.slice(pivot);

	if (distance <= distance_array[pivot]) {
		var ret = insertGpsmarkerSortedDistance(lhs_gps, lhs_dis, gps_marker,
				distance);
		return [ ret[0].concat(rhs_gps), ret[1].concat(rhs_dis) ];

		// return insertGpsmarkerSortedDistance(lhs, element).concat(rhs);
	}

	var ret = insertGpsmarkerSortedDistance(rhs_gps, rhs_dis, gps_marker,
			distance);
	return [ lhs_gps.concat(ret[0]), lhs_dis.concat(ret[1]) ];
	// return lhs.concat(insertGpsmarkerSortedDistance(rhs, element));
}
