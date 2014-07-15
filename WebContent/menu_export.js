

// <borderpoints>
// <borderpoint>
// <id>1</id>
// <x-pos>678.2304241569675</x-pos>
// <y-pos>897.6649553571428</y-pos>
// </borderpoint>
// <borderpoint>
// <id>68</id>
// <x-pos>678.2304241569675</x-pos>
// <y-pos>897.6649553571428</y-pos>
// </borderpoint>
// </borderpoints>


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

function get_xml_data(useRedundantBorderpointFormat) {
	"use strict";

	// XML tag definitions
	var TagBorderpoint = "borderpoint";
	var TagBorderpointList = "borderpointlist";
	var TagGpsmarker = "gpsmarker";
	var TagLatitude = "latitude";
	var TagLongitude = "longitude";
	var TagCategory = "category";
	var TagVertex = "vertex";
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

	var gpsmarkerarray = Gpsmarker_container.getAll();
	var categoryarray = Category_container.getAll();
	var vertexarray = Vertex_container.getAll();
	var edgearray = Edge_container.getAll();
	var borderpointarray = Affiliation_borderpoint_container.getAll();

	var file_content = "";

	file_content = file_content.concat('<!-- ' + G.getXmlFilename() + ' -->\r\n');
	file_content = file_content.concat('<svgmap-data>\r\n');

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
		file_content = file_content.concat('\t<levels>\r\n');
		for (var i = 0; i < G.svg_element.length; i++) {

			var min = G.Level_min_altitude[i];
			var max = G.Level_max_altitude[i];
			var svgpath = G.Level_svgpath[i];

			file_content = file_content.concat('\t\t<level>\r\n');
			file_content = file_content.concat('\t\t\t<id>' + i + '</id>\r\n');
			file_content = file_content.concat('\t\t\t<svgpath>' + svgpath + '</svgpath>\r\n');
			file_content = file_content.concat('\t\t\t<min_altitude>' + min + '</min_altitude>\r\n');
			file_content = file_content.concat('\t\t\t<max_altitude>' + max + '</max_altitude>\r\n');
			file_content = file_content.concat('\t\t</level>\r\n');
		}
		file_content = file_content.concat('\t</levels>\r\n');
	}

	if (gpsmarkerarray.length > 0) {
		file_content = file_content.concat('\t<gpsmarkers>\r\n');
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
			file_content = file_content.concat('\t\t<' + TagGpsmarker + '>\r\n');
			file_content = file_content.concat('\t\t\t<id>' + g.getId() + '</id>\r\n');
			file_content = file_content.concat('\t\t\t<svgid>' + g.getSvgid()
					 + '</svgid>\r\n');
			file_content = file_content.concat('\t\t\t<x-pos>' + g.getX()
					 + '</x-pos>\r\n');
			file_content = file_content.concat('\t\t\t<y-pos>' + g.getY()
					 + '</y-pos>\r\n');
			file_content = file_content.concat('\t\t\t<' + TagLatitude + '>' + g.getLatitude()
					 + '</' + TagLatitude + '>\r\n');
			file_content = file_content.concat('\t\t\t<' + TagLongitude + '>' + g.getLongitude()
					 + '</' + TagLongitude + '>\r\n');
			file_content = file_content.concat('\t\t</' + TagGpsmarker + '>\r\n');
		}
		file_content = file_content.concat('\t</gpsmarkers>\r\n');
	}

	if (categoryarray.length > 0) {
		file_content = file_content.concat('\t<categories>\r\n');
		for (var i = 0, c = categoryarray[i]; i < categoryarray.length; c = categoryarray[++i]) {
			file_content = file_content.concat('\t\t<' + TagCategory + '>\r\n');
			file_content = file_content.concat('\t\t\t<id>' + c.getId() + '</id>\r\n');
			file_content = file_content.concat('\t\t\t<name>' + escape(c.getName())
					 + '</name>\r\n');
			file_content = file_content.concat('\t\t</' + TagCategory + '>\r\n');
		}
		file_content = file_content.concat('\t</categories>\r\n');
	}

	if (!useRedundantBorderpointFormat) {
		if (borderpointarray.length > 0) {
			file_content = file_content.concat('\t<borderpoints>\r\n');
			for (var j = 0; j < borderpointarray.length; j++) {

				file_content = file_content.concat('\t<' + TagBorderpoint + '>\r\n');
				file_content = file_content.concat('\t\t<id>'
						 + borderpointarray[j].getId() + '</id>\r\n');
				file_content = file_content.concat('\t\t<x-pos>'
						 + borderpointarray[j].getX() + '</x-pos>\r\n');
				file_content = file_content.concat('\t\t<y-pos>'
						 + borderpointarray[j].getY() + '</y-pos>\r\n');
				file_content = file_content.concat('\t</' + TagBorderpoint + '>\r\n');
			}
			file_content = file_content.concat('\t</borderpoints>\r\n');
		}
	}

	if (vertexarray.length > 0) {
		file_content = file_content.concat('\t<vertices>\r\n');
		for (var i = 0, v = vertexarray[i]; i < vertexarray.length; v = vertexarray[++i]) {
			file_content = file_content.concat('\t\t<' + TagVertex + '>\r\n');
			file_content = file_content.concat('\t\t\t<id>' + v.getId() + '</id>\r\n');
			file_content = file_content.concat('\t\t\t<svgid>' + v.getSvgid()
					 + '</svgid>\r\n');
			file_content = file_content.concat('\t\t\t<x-pos>' + v.getX()
					 + '</x-pos>\r\n');
			file_content = file_content.concat('\t\t\t<y-pos>' + v.getY()
					 + '</y-pos>\r\n');
			file_content = file_content.concat('\t\t\t<poi>' + v.getPoi()
					 + '</poi>\r\n');

			if (v.getShortDesc() != '')
				file_content = file_content.concat('\t\t\t<' + TagShortDescription + '>'
						 + escape(v.getShortDesc()) + '</' + TagShortDescription + '>\r\n');
			if (v.getLongDesc() != '')
				file_content = file_content.concat('\t\t\t<' + TagLongDescription + '>'
						 + escape(v.getLongDesc()) + '</' + TagLongDescription + '>\r\n');
			if (v.getPolygon() != null) {
				var points = v.getPolygon().getBorderPoints();
				if (useRedundantBorderpointFormat) {
					for (var j = 0; j < points.length; j++) {
						file_content = file_content.concat('\t\t\t<' + TagBorderpoint + '>\r\n');
						file_content = file_content.concat('\t\t\t\t<id>'
								 + points[j].getId() + '</id>\r\n');
						file_content = file_content.concat('\t\t\t\t<x-pos>'
								 + points[j].getX() + '</x-pos>\r\n');
						file_content = file_content.concat('\t\t\t\t<y-pos>'
								 + points[j].getY() + '</y-pos>\r\n');
						file_content = file_content.concat('\t\t\t</' + TagBorderpoint + '>\r\n');
					}
				} else {
					if (points.length > 0) {
						file_content = file_content.concat('\t\t\t<' + TagBorderpointList + '>');
						file_content = file_content.concat('' + points[0].getId());
						for (var j = 1; j < points.length; j++) {
							file_content = file_content.concat(','
									 + points[j].getId());

						}
						file_content = file_content.concat('</' + TagBorderpointList + '>\r\n');
					}
				}

			}
			if (v.getCategory() != null) {
				file_content = file_content.concat('\t\t\t<' + TagCategory + '>'
						 + v.getCategory().getId() + '</' + TagCategory + '>\r\n');
			}
			file_content = file_content.concat('\t\t</' + TagVertex + '>\r\n');
		}

		file_content = file_content.concat('\t</vertices>\r\n');
	}

	if (edgearray.length > 0) {
		file_content = file_content.concat('\t<edges>\r\n');
		for (var i = 0, e = edgearray[i]; i < edgearray.length; e = edgearray[++i]) {
			file_content = file_content.concat('\t\t<' + TagEdge + '>\r\n');
			file_content = file_content.concat('\t\t\t<id>' + e.getId() + '</id>\r\n');
			file_content = file_content.concat('\t\t\t<' + TagVertex1 + '>'
					 + e.getVertex1().getId() + '</' + TagVertex1 + '>\r\n');
			file_content = file_content.concat('\t\t\t<' + TagVertex1Reachable + '>'
					 + e.getVertex1_reachable() + '</' + TagVertex1Reachable + '>\r\n');

			if (e.getVertex1_stepmarker() != null) {
				file_content = file_content.concat('\t\t\t<' + TagVertex1Stepmarker + '>\r\n');
				file_content = file_content.concat('\t\t\t\t<x-pos>'
						 + e.getVertex1_stepmarker().getX() + '</x-pos>\r\n');
				file_content = file_content.concat('\t\t\t\t<y-pos>'
						 + e.getVertex1_stepmarker().getY() + '</y-pos>\r\n');
				file_content = file_content.concat('\t\t\t</' + TagVertex1Stepmarker + '>\r\n');
			}

			file_content = file_content.concat('\t\t\t<' + TagVertex2 + '>'
					 + e.getVertex2().getId() + '</' + TagVertex2 + '>\r\n');
			file_content = file_content.concat('\t\t\t<' + TagVertex2Reachable + '>'
					 + e.getVertex2_reachable() + '</' + TagVertex2Reachable + '>\r\n');

			if (e.getVertex2_stepmarker() != null) {
				file_content = file_content.concat('\t\t\t<' + TagVertex2Stepmarker + '>\r\n');
				file_content = file_content.concat('\t\t\t\t<x-pos>'
						 + e.getVertex2_stepmarker().getX() + '</x-pos>\r\n');
				file_content = file_content.concat('\t\t\t\t<y-pos>'
						 + e.getVertex2_stepmarker().getY() + '</y-pos>\r\n');
				file_content = file_content.concat('\t\t\t</' + TagVertex2Stepmarker + '>\r\n');
			}

			if (e.getDistanceFactor() != 1.0) {
				file_content = file_content.concat('\t\t\t<distanceFactor>'
						 + e.getDistanceFactor() + '</distanceFactor>\r\n');
			}
			file_content = file_content.concat('\t\t\t<' + TagDisabledAdapted + '>'
					 + e.getDisabledAdapted() + '</' + TagDisabledAdapted + '>\r\n');
			file_content = file_content.concat('\t\t</' + TagEdge + '>\r\n');
		}

		file_content = file_content.concat('\t</edges>\r\n');
	}

	file_content = file_content.concat('</svgmap-data>\r\n');
	file_content = file_content.concat('<!-- EOF -->\r\n');

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
