function export_open() {
	"use strict";
	G.menu_current = 'export';
	document.getElementById('export_warnings').innerHTML = 'none';
	document.getElementById('export').style.display = 'block';
	make_qr_code();
	export_xml();
}

function export_close() {
	"use strict";
	G.menu_current = null;
	document.getElementById('export').style.display = 'none';
	document.getElementById("qrcode").innerHTML = '';
}

function get_xml_data(useRedundantBorderpointFormat, useLongXmlTags) {
	"use strict";

	// XML tag definitions
	var NL = "\r\n";
	var TAB = "\t";
	var TagBorderpoint = "borderpoint";
	var TagBorderpointList = "borderpointlist";
	var TagGpsmarker = "gpsmarker";
	var TagLatitude = "latitude";
	var TagLongitude = "longitude";
	var TagCategory = "category";
	var TagVertex = "vertex";
	var TagXPos = "x-pos";
	var TagYPos = "y-pos";
	var TagShortDescription = "shortDescription";
	var TagLongDescription = "longDescription";
	var TagEdge = "edge";
	var TagVertex1Stepmarker = "vertex1-stepmarker";
	var TagVertex1Reachable = "vertex1-reachable";
	var TagVertex1 = "vertex1";
	var TagVertex2Stepmarker = "vertex2-stepmarker";
	var TagVertex2Reachable = "vertex2-reachable";
	var TagVertex2 = "vertex2";
	var TagDisabledAdapted = "disabledAdapted";
	// end: XML tag definitions

	if (useLongXmlTags == false) {
		// short XML tag definitions
		NL = "";
		TAB = "";
		TagBorderpoint = "b";
		TagBorderpointList = "bl";
		TagGpsmarker = "g";
		TagLatitude = "la";
		TagLongitude = "lo";
		TagCategory = "c";
		TagVertex = "v";
		TagXPos = "x";
		TagYPos = "y";
		TagShortDescription = "sd";
		TagLongDescription = "ld";
		TagEdge = "e";
		TagVertex1Stepmarker = "v1s";
		TagVertex1Reachable = "v1r";
		TagVertex1 = "v1";
		TagVertex2Stepmarker = "v2s";
		TagVertex2Reachable = "v2r";
		TagVertex2 = "v2";
		TagDisabledAdapted = "d";
		// end: short XML tag definitions
	}

	var gpsmarkerarray = Gpsmarker_container.getAll();
	var categoryarray = Category_container.getAll();
	var vertexarray = Vertex_container.getAll();
	var edgearray = Edge_container.getAll();
	var borderpointarray = Affiliation_borderpoint_container.getAll();

	var file_content = "";

	file_content = file_content.concat('<!-- ' + G.getXmlFilename() + ' -->' + NL);
	file_content = file_content.concat('<svgmap-data>' + NL);

	// test for min 2 gps marker per level
	var markerArray = new Array();
	for (var i = 0; i < G.svg_element.length; i++) {
		markerArray[i] = 0;
	}
	if (gpsmarkerarray.length > 0) {
		for (var i = 0, g = gpsmarkerarray[i]; i < gpsmarkerarray.length; g = gpsmarkerarray[++i]) {
			markerArray[g.getSvgid()] += 1;
		}
	}
	for (var i = 0; i < G.svg_element.length; i++) {
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
		file_content = file_content.concat(TAB + '<levels>' + NL);
		for (var i = 0; i < G.svg_element.length; i++) {

			var min = G.Level_min_altitude[i];
			var max = G.Level_max_altitude[i];
			var svgpath = G.Level_svgpath[i];
			var levelname = G.Level_name[i];

			file_content = file_content.concat(TAB + TAB + '<level>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<id>' + i + '</id>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<name>' + levelname + '</name>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<svgpath>' + svgpath + '</svgpath>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<min_altitude>' + min + '</min_altitude>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<max_altitude>' + max + '</max_altitude>' + NL);
			file_content = file_content.concat(TAB + TAB + '</level>' + NL);
		}
		file_content = file_content.concat(TAB + '</levels>' + NL);
	}

	if (gpsmarkerarray.length > 0) {
		file_content = file_content.concat(TAB + '<gpsmarkers>' + NL);
		for (var i = 0, g = gpsmarkerarray[i]; i < gpsmarkerarray.length; g = gpsmarkerarray[++i]) {

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
			file_content = file_content.concat(TAB + TAB + '<' + TagGpsmarker + '>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<id>' + g.getId() + '</id>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<svgid>' + g.getSvgid()
					 + '</svgid>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<' + TagXPos + '>' + g.getX()
					 + '</' + TagXPos + '>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<' + TagYPos + '>' + g.getY()
					 + '</' + TagYPos + '>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<' + TagLatitude + '>' + g.getLatitude()
					 + '</' + TagLatitude + '>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<' + TagLongitude + '>' + g.getLongitude()
					 + '</' + TagLongitude + '>' + NL);
			file_content = file_content.concat(TAB + TAB + '</' + TagGpsmarker + '>' + NL);
		}
		file_content = file_content.concat(TAB + '</gpsmarkers>' + NL);
	}

	if (categoryarray.length > 0) {
		file_content = file_content.concat(TAB + '<categories>' + NL);
		for (var i = 0, c = categoryarray[i]; i < categoryarray.length; c = categoryarray[++i]) {
			file_content = file_content.concat(TAB + TAB + '<' + TagCategory + '>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<id>' + c.getId() + '</id>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<name>' + escape(c.getName())
					 + '</name>' + NL);
			file_content = file_content.concat(TAB + TAB + '</' + TagCategory + '>' + NL);
		}
		file_content = file_content.concat(TAB + '</categories>' + NL);
	}

	if (!useRedundantBorderpointFormat) {
		if (borderpointarray.length > 0) {
			file_content = file_content.concat(TAB + '<borderpoints>' + NL);
			for (var j = 0; j < borderpointarray.length; j++) {

				file_content = file_content.concat(TAB + TAB + '<' + TagBorderpoint + '>' + NL);
				file_content = file_content.concat(TAB + TAB + TAB + '<id>'
						 + borderpointarray[j].getId() + '</id>' + NL);
				file_content = file_content.concat(TAB + TAB + TAB + '<' + TagXPos + '>'
						 + borderpointarray[j].getX() + '</' + TagXPos + '>' + NL);
				file_content = file_content.concat(TAB + TAB + TAB + '<' + TagYPos + '>'
						 + borderpointarray[j].getY() + '</' + TagYPos + '>' + NL);
				file_content = file_content.concat(TAB + TAB + '</' + TagBorderpoint + '>' + NL);
			}
			file_content = file_content.concat(TAB + '</borderpoints>' + NL);
		}
	}

	if (vertexarray.length > 0) {
		file_content = file_content.concat(TAB + '<vertices>' + NL);
		for (var i = 0, v = vertexarray[i]; i < vertexarray.length; v = vertexarray[++i]) {
			file_content = file_content.concat(TAB + TAB + '<' + TagVertex + '>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<id>' + v.getId() + '</id>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<svgid>' + v.getSvgid()
					 + '</svgid>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<' + TagXPos + '>' + v.getX()
					 + '</' + TagXPos + '>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<' + TagYPos + '>' + v.getY()
					 + '</' + TagYPos + '>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<poi>' + v.getPoi()
					 + '</poi>' + NL);

			if (v.getShortDesc() != '')
				file_content = file_content.concat(TAB + TAB + TAB + '<' + TagShortDescription + '>'
						 + escape(v.getShortDesc()) + '</' + TagShortDescription + '>' + NL);
			if (v.getLongDesc() != '')
				file_content = file_content.concat(TAB + TAB + TAB + '<' + TagLongDescription + '>'
						 + escape(v.getLongDesc()) + '</' + TagLongDescription + '>' + NL);
			if (v.getPolygon() != null) {
				var points = v.getPolygon().getBorderPoints();
				if (useRedundantBorderpointFormat) {
					for (var j = 0; j < points.length; j++) {
						file_content = file_content.concat(TAB + TAB + TAB + '<' + TagBorderpoint + '>' + NL);
						file_content = file_content.concat(TAB + TAB + TAB + TAB + '<id>'
								 + points[j].getId() + '</id>' + NL);
						file_content = file_content.concat(TAB + TAB + TAB + TAB + '<' + TagXPos + '>'
								 + points[j].getX() + '</' + TagXPos + '>' + NL);
						file_content = file_content.concat(TAB + TAB + TAB + TAB + '<' + TagYPos + '>'
								 + points[j].getY() + '</' + TagYPos + '>' + NL);
						file_content = file_content.concat(TAB + TAB + TAB + '</' + TagBorderpoint + '>' + NL);
					}
				} else {
					if (points.length > 0) {
						file_content = file_content.concat(TAB + TAB + TAB + '<' + TagBorderpointList + '>');
						file_content = file_content.concat('' + points[0].getId());
						for (var j = 1; j < points.length; j++) {
							file_content = file_content.concat(','
									 + points[j].getId());

						}
						file_content = file_content.concat('</' + TagBorderpointList + '>' + NL);
					}
				}

			}
			if (v.getCategory() != null) {
				file_content = file_content.concat(TAB + TAB + TAB + '<' + TagCategory + '>'
						 + v.getCategory().getId() + '</' + TagCategory + '>' + NL);
			}
			file_content = file_content.concat(TAB + TAB + '</' + TagVertex + '>' + NL);
		}

		file_content = file_content.concat(TAB + '</vertices>' + NL);
	}

	if (edgearray.length > 0) {
		file_content = file_content.concat(TAB + '<edges>' + NL);
		for (var i = 0, e = edgearray[i]; i < edgearray.length; e = edgearray[++i]) {
			file_content = file_content.concat(TAB + TAB + '<' + TagEdge + '>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<id>' + e.getId() + '</id>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<' + TagVertex1 + '>'
					 + e.getVertex1().getId() + '</' + TagVertex1 + '>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<' + TagVertex1Reachable + '>'
					 + e.getVertex1_reachable() + '</' + TagVertex1Reachable + '>' + NL);

			if (e.getVertex1_stepmarker() != null) {
				file_content = file_content.concat(TAB + TAB + TAB + '<' + TagVertex1Stepmarker + '>' + NL);
				file_content = file_content.concat(TAB + TAB + TAB + TAB + '<' + TagXPos + '>'
						 + e.getVertex1_stepmarker().getX() + '</' + TagXPos + '>' + NL);
				file_content = file_content.concat(TAB + TAB + TAB + TAB + '<' + TagYPos + '>'
						 + e.getVertex1_stepmarker().getY() + '</' + TagYPos + '>' + NL);
				file_content = file_content.concat(TAB + TAB + TAB + '</' + TagVertex1Stepmarker + '>' + NL);
			}

			file_content = file_content.concat(TAB + TAB + TAB + '<' + TagVertex2 + '>'
					 + e.getVertex2().getId() + '</' + TagVertex2 + '>' + NL);
			file_content = file_content.concat(TAB + TAB + TAB + '<' + TagVertex2Reachable + '>'
					 + e.getVertex2_reachable() + '</' + TagVertex2Reachable + '>' + NL);

			if (e.getVertex2_stepmarker() != null) {
				file_content = file_content.concat(TAB + TAB + TAB + '<' + TagVertex2Stepmarker + '>' + NL);
				file_content = file_content.concat(TAB + TAB + TAB + TAB + '<' + TagXPos + '>'
						 + e.getVertex2_stepmarker().getX() + '</' + TagXPos + '>' + NL);
				file_content = file_content.concat(TAB + TAB + TAB + TAB + '<' + TagYPos + '>'
						 + e.getVertex2_stepmarker().getY() + '</' + TagYPos + '>' + NL);
				file_content = file_content.concat(TAB + TAB + TAB + '</' + TagVertex2Stepmarker + '>' + NL);
			}

			if (e.getDistanceFactor() != 1.0) {
				file_content = file_content.concat(TAB + TAB + TAB + '<distanceFactor>'
						 + e.getDistanceFactor() + '</distanceFactor>' + NL);
			}
			file_content = file_content.concat(TAB + TAB + TAB + '<' + TagDisabledAdapted + '>'
					 + e.getDisabledAdapted() + '</' + TagDisabledAdapted + '>' + NL);
			file_content = file_content.concat(TAB + TAB + '</' + TagEdge + '>' + NL);
		}

		file_content = file_content.concat(TAB + '</edges>' + NL);
	}

	file_content = file_content.concat('</svgmap-data>' + NL);
	file_content = file_content.concat('<!-- EOF -->' + NL);

	return file_content;
}

function export_xml() {
	"use strict";
	// var file_content=get_xml_data();
	// window.URL = window.webkitURL || window.URL;
	// window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder
	// || window.MozBlobBuilder || window.MSBlobBuilder;

	// var blob;
	// if (typeof BlobBuilder !== "undefined") {
	// var blobbuilder = new BlobBuilder();
	// blobbuilder.append(file_content);
	// blob = blobbuilder.getBlob('text\/xml');

	// } else {
	// blob = new Blob([ file_content ], {
	// "type" : "text\/xml"
	// });
	// }

	var a_vertex = document.getElementById('export_xml_link');
	// a_vertex.href = window.URL.createObjectURL(blob);
	// a_vertex.download = G.getXmlFilename();

	var project_name = G.getXmlFilename().substr(0, G.getXmlFilename().lastIndexOf('.'));
	get_project_files(project_name, function (files) {
		a_vertex.href = files.zip;
		a_vertex.download = project_name + ".zip";
	});
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

function get_project_files(name, cb) {
	"use strict";

	jQuery.ajax({
		url : '/projects/' + name + '/files.json',
		success : cb,
		error : function (response) {
			G.log("Error: " + response);
		}
	});
}

function make_qr_code() {
	"use strict";
	get_project_files(G.getXmlFilename().substr(0, G.getXmlFilename().lastIndexOf('.')), function (files) {
		for (var i = 0; i < files.zips.length; i++) {
			new QRCode(document.getElementById("qrcode"), 'map,' + files.zips[i] + '?android=true');
			var myP = document.createElement('p');
			myP.innerHTML = files.zips[i];
			document.getElementById("qrcode").appendChild(myP);
		}
		if (files.zips.length == 0) {
			var myP = document.createElement('p');
			myP.innerHTML = "No network interface available to export.";
			document.getElementById("qrcode").appendChild(myP);
		}
	});
}
