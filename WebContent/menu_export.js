function export_open() {
	"use strict";
	G.menu_current = 'export';
	document.getElementById('export_warnings').innerHTML = 'none';
	document.getElementById('export').style.display = 'block';

	export_xml();
}

function export_close() {
	"use strict";
	G.menu_current = null;
	document.getElementById('export').style.display = 'none';
}

function export_xml() {
	"use strict";

	var gpsmarkerarray = Gpsmarker_container.getAll();
	var categoryarray = Category_container.getAll();
	var vertexarray = Vertex_container.getAll();
	var edgearray = Edge_container.getAll();

	var file_content = "";

	file_content = file_content.concat('<!-- '+G.getXmlFilename()+' -->\n');
	file_content = file_content.concat('<svgmap-data>\n');

	// test for min 2 gps marker per level
	var markerArray = new Array();
	for ( var i = 0; i < G.svg_element.length; i++) {
		markerArray[i] = 0;
	}
	if (gpsmarkerarray.length > 0) {
		for ( var i = 0, g = gpsmarkerarray[i]; i < gpsmarkerarray.length; g = gpsmarkerarray[++i]) {
			markerArray[g.getSvgid()] += 1;
		}
	}
	for ( var i = 0; i < G.svg_element.length; i++) {
		if (markerArray[i] < 2) {
			export_warn('Level ' + i + ' has less than two gps markers');
		}
	}

	// test for valid level altitudes
	var check = level_check();
	if (check != '') {
		export_warn(check);
	}

	// start exporting

	if (G.Level_min_altitude.length > 0 && G.Level_max_altitude.length > 0) {
		file_content = file_content.concat('<levels>\n');
		for ( var i = 0; i < G.svg_element.length; i++) {

			var min = G.Level_min_altitude[i];
			var max = G.Level_max_altitude[i];
			var svgpath = G.Level_svgpath[i];

			file_content = file_content.concat('<level>\n');
			file_content = file_content.concat('<id>' + i + '</id>\n');
			file_content = file_content.concat('<svgpath>' + svgpath + '</svgpath>\n');
			file_content = file_content.concat('<min_altitude>' + min + '</min_altitude>\n');
			file_content = file_content.concat('<max_altitude>' + max + '</max_altitude>\n');
			file_content = file_content.concat('</level>\n');
		}
		file_content = file_content.concat('</levels>\n');
	}

	if (gpsmarkerarray.length > 0) {
		file_content = file_content.concat('<gpsmarkers>\n');
		for ( var i = 0, g = gpsmarkerarray[i]; i < gpsmarkerarray.length; g = gpsmarkerarray[++i]) {

			var latitude = parseFloat(g.getLatitude());
			if (isNaN(latitude)) {
				export_warn('gps marker ' + g.getId() + ' in level '
						+ g.getSvgid() + ' has a invalid latitude.');
				continue;
			}
			var longitude = parseFloat(g.getLatitude());

			if (isNaN(longitude)) {
				export_warn('gps marker ' + g.getId() + ' in level '
						+ g.getSvgid() + ' has a invalid longitude.');
				continue;
			}
			file_content = file_content.concat('<gpsmarker>\n');
			file_content = file_content.concat('<id>' + g.getId() + '</id>\n');
			file_content = file_content.concat('<svgid>' + g.getSvgid()
					+ '</svgid>\n');
			file_content = file_content.concat('<x-pos>' + g.getX()
					+ '</x-pos>\n');
			file_content = file_content.concat('<y-pos>' + g.getY()
					+ '</y-pos>\n');
			file_content = file_content.concat('<latitude>' + g.getLatitude()
					+ '</latitude>\n');
			file_content = file_content.concat('<longitude>' + g.getLongitude()
					+ '</longitude>\n');
			file_content = file_content.concat('</gpsmarker>\n');
		}
		file_content = file_content.concat('</gpsmarkers>\n');
	}

	if (categoryarray.length > 0) {
		file_content = file_content.concat('<categories>\n');
		for ( var i = 0, c = categoryarray[i]; i < categoryarray.length; c = categoryarray[++i]) {
			file_content = file_content.concat('<category>\n');
			file_content = file_content.concat('<id>' + c.getId() + '</id>\n');
			file_content = file_content.concat('<name>' + escape(c.getName())
					+ '</name>\n');
			file_content = file_content.concat('</category>\n');
		}
		file_content = file_content.concat('</categories>\n');
	}

	if (vertexarray.length > 0) {
		file_content = file_content.concat('<vertices>\n');
		for ( var i = 0, v = vertexarray[i]; i < vertexarray.length; v = vertexarray[++i]) {
			file_content = file_content.concat('<vertex>\n');
			file_content = file_content.concat('<id>' + v.getId() + '</id>\n');
			file_content = file_content.concat('<svgid>' + v.getSvgid()
					+ '</svgid>\n');
			file_content = file_content.concat('<x-pos>' + v.getX()
					+ '</x-pos>\n');
			file_content = file_content.concat('<y-pos>' + v.getY()
					+ '</y-pos>\n');
			file_content = file_content.concat('<poi>' + v.getPoi()
					+ '</poi>\n');

			if (v.getShortDesc() != '')
				file_content = file_content.concat('<shortDescription>'
						+ escape(v.getShortDesc()) + '</shortDescription>\n');
			if (v.getLongDesc() != '')
				file_content = file_content.concat('<longDescription>'
						+ escape(v.getLongDesc()) + '</longDescription>\n');
			if (v.getPolygon() != null) {
				var points = v.getPolygon().getBorderPoints();
				for ( var j = 0; j < points.length; j++) {
					file_content = file_content.concat('<borderpoint>\n');
					file_content = file_content.concat('<id>'
							+ points[j].getId() + '</id>\n');
					file_content = file_content.concat('<x-pos>'
							+ points[j].getX() + '</x-pos>\n');
					file_content = file_content.concat('<y-pos>'
							+ points[j].getY() + '</y-pos>\n');
					file_content = file_content.concat('</borderpoint>\n');
				}
			}
			if (v.getCategory() != null) {
				file_content = file_content.concat('<category>'
						+ v.getCategory().getId() + '</category>\n');
			}
			file_content = file_content.concat('</vertex>\n');
		}

		file_content = file_content.concat('</vertices>\n');
	}

	if (edgearray.length > 0) {
		file_content = file_content.concat('<edges>\n');
		for ( var i = 0, e = edgearray[i]; i < edgearray.length; e = edgearray[++i]) {
			file_content = file_content.concat('<edge>\n');
			file_content = file_content.concat('<id>' + e.getId() + '</id>\n');
			file_content = file_content.concat('<vertex1>'
					+ e.getVertex1().getId() + '</vertex1>\n');
			file_content = file_content.concat('<vertex1-reachable>'
					+ e.getVertex1_reachable() + '</vertex1-reachable>\n');

			if (e.getVertex1_stepmarker() != null) {
				file_content = file_content.concat('<vertex1-stepmarker>\n');
				file_content = file_content.concat('<x-pos>'
						+ e.getVertex1_stepmarker().getX() + '</x-pos>\n');
				file_content = file_content.concat('<y-pos>'
						+ e.getVertex1_stepmarker().getY() + '</y-pos>\n');
				file_content = file_content.concat('</vertex1-stepmarker>\n');
			}

			file_content = file_content.concat('<vertex2>'
					+ e.getVertex2().getId() + '</vertex2>\n');
			file_content = file_content.concat('<vertex2-reachable>'
					+ e.getVertex2_reachable() + '</vertex2-reachable>\n');

			if (e.getVertex2_stepmarker() != null) {
				file_content = file_content.concat('<vertex2-stepmarker>\n');
				file_content = file_content.concat('<x-pos>'
						+ e.getVertex2_stepmarker().getX() + '</x-pos>\n');
				file_content = file_content.concat('<y-pos>'
						+ e.getVertex2_stepmarker().getY() + '</y-pos>\n');
				file_content = file_content.concat('</vertex2-stepmarker>\n');
			}

			if (e.getDistanceFactor() != 1.0) {
				file_content = file_content.concat('<distanceFactor>'
						+ e.getDistanceFactor() + '</distanceFactor>\n');
			}
			file_content = file_content.concat('<disabledAdapted>'
					+ e.getDisabledAdapted() + '</disabledAdapted>\n');
			file_content = file_content.concat('</edge>\n');
		}

		file_content = file_content.concat('</edges>\n');
	}

	file_content = file_content.concat('</svgmap-data>\n');
	file_content = file_content.concat('<!-- EOF -->\n');

	window.URL = window.webkitURL || window.URL;
	window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder
			|| window.MozBlobBuilder || window.MSBlobBuilder;

	var blob;
	if (typeof BlobBuilder !== "undefined") {
		var blobbuilder = new BlobBuilder();
		blobbuilder.append(file_content);
		blob = blobbuilder.getBlob('text\/xml');

	} else {
		blob = new Blob([ file_content ], {
			"type" : "text\/xml"
		});
	}

	var a_vertex = document.getElementById('export_xml_link');
	a_vertex.href = window.URL.createObjectURL(blob);
	a_vertex.download = G.getXmlFilename();

}

function export_warn(message) {
	"use strict";
	if (document.getElementById('export_warnings').innerHTML == 'none') {
		// first time
		document.getElementById('export_warnings').innerHTML = message;
	} else {
		document.getElementById('export_warnings').innerHTML += message;
	}

	document.getElementById('export_warnings').innerHTML += '<br>';
}
