function import_open() {
	"use strict";
	G.menu_current = 'import';
	document.getElementById('import').style.display = 'block';
	document.getElementById('files').addEventListener('change',
			load_from_client_xml, false);

	// alert('Warning: If you load content from files, all current content will
	// deleted!');

}

function load_from_string(content_string) {
	G.log("load_from_string()");

	var parser = new DOMParser();
	var xml_dom = parser.parseFromString(content_string, 'text/xml');
	// content_string2 = xml_dom;
	// G.log(xml_dom);

	if (xml_dom.getElementsByTagName('parsererror').length != 0) {
		alert('the given file was not a valid xml document.');
		return;
	}

	import_xml(xml_dom);
}

function load_from_client_xml(evt) {
	"use strict";
	var files = evt.target.files;
	for ( var i = 0, f; f = files[i]; i++) {
		var reader = new FileReader();
		reader.onload = (function(theFile) {
			return function(e) {
				// handle single file

				var content_string = e.target.result;
				// G.log(content_string);

				G.log('import file ' + theFile.name);

				load_from_string(content_string);
			};
		})(f);

		reader.readAsText(f);
	}
}

function load_from_server_xml(callback) {
	"use strict";
	// relativer Verzeichnispfad zu Dateien
	var dir = "data/";
	// zu ladene Dateien
	var file = "svgmap-data.xml";

	// G.log("load_from_server_xml(callback)");

	var asyncXMLRequest = new XMLHttpRequest();
	asyncXMLRequest.open('GET', dir + file);
	asyncXMLRequest.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.responseXML != null)
				import_xml(this.responseXML, callback);
			else {
				if (this.response != null)
					import_xml(this.response);
				else
					G.log('import: responseXML is null.');
			}
		}
	};
	// G.log("asyncXMLRequest.send();");
	asyncXMLRequest.send();
}

function import_close() {
	"use strict";
	G.menu_current = null;
	document.getElementById('import').style.display = 'none';
	document.getElementById('files').removeEventListener('change',
			load_from_client_xml, false);
}

function import_xml(xmlDom, callback) {
	"use strict";
	if (xmlDom.documentElement.tagName != 'svgmap-data') {
		G.log('xml file has not a svgmap-data root element.');
		return;
	}

	var svgmap = xmlDom.documentElement;

	// delete old points
	while (!Vertex_container.isEmpty()) {
		Vertex_container.getAll()[0].remove();
	}

	if (!Edge_container.isEmpty()) {
		G.log('Not all edges are deleted.');
		return;
	}
	if (!Stepmarker_container.isEmpty()) {
		G.log('Not all stepmarkers are deleted.');
		return;
	}
	if (!Affiliation_borderpoint_container.isEmpty()) {
		G.log('Not all borderpoints are deleted.');
		return;
	}
	if (!Affiliation_borderline_container.isEmpty()) {
		G.log('Not all borderlines are deleted.');
		return;
	}

	// delete old categories
	while (!Category_container.isEmpty()) {
		Category_container.getAll()[0].remove();
	}

	// delete old gpsmarkers
	while (!Gpsmarker_container.isEmpty()) {
		Gpsmarker_container.getAll()[0].remove();
	}

	// reset level altitudes
	for ( var i = 0; i < G.svg_element.length; i++) {
		LevelAltitude_min[i] = undefined;
		LevelAltitude_max[i] = undefined;
	}

	var vertexes_done = false;

	if (svgmap.childNodes == undefined) {
		G.log('svgmap-data has no children');
		return;
	}

	for ( var i = 0, c = svgmap.childNodes[i]; i < svgmap.childNodes.length; c = svgmap.childNodes[++i]) {
		switch (c.nodeName) {
		case 'categories':
			import_xml_categories(c);
			break;
		case 'vertexes':
			import_xml_vertexes(c);
			vertexes_done = true;
			break;
		case 'edges':
			if (vertexes_done) {
				import_xml_edges(c);
				vertexes_done = false;
			} else
				G.log('abort trying to import edges first.');
			break;
		case 'gpsmarkers':
			import_xml_gpsmarkers(c);
			break;
		case 'levelaltitudes':
			import_xml_levelaltitudes(c);
			break;
		case '#text':
			/*
			 * ignore text childs, like <TextNode textContent="\n">
			 */
			break;

		default:
			G.log('unknown svgmap-data child: ' + c.nodeName);
			break;
		}
	}

	// G.log('import completed');
	if (isFunction(callback)) {
		callback();
	}
}

function import_xml_categories(xmlDom) {
	"use strict";
	if (xmlDom.childNodes == undefined) {
		G.log('categories has no children');
		return;
	}

	for ( var i = 0, c = xmlDom.childNodes[i]; i < xmlDom.childNodes.length; c = xmlDom.childNodes[++i]) {
		switch (c.nodeName) {
		case 'category':
			import_xml_category(c);
			break;
		case '#text':
			/*
			 * ignore text childs, like <TextNode textContent="\n">
			 */
			break;

		default:
			G.log('unknown categories child: ' + c.nodeName);
			break;
		}
	}
}

function import_xml_category(xmlDom) {
	"use strict";
	var id = null;
	var cname = null;

	if (xmlDom.childNodes == undefined) {
		G.log('category has no children');
		return;
	}

	for ( var i = 0, c = xmlDom.childNodes[i]; i < xmlDom.childNodes.length; c = xmlDom.childNodes[++i]) {
		switch (c.nodeName) {
		case 'id':
			id = parseInt(c.childNodes[0].nodeValue, 10);
			break;
		case 'name':
			cname = unescape(c.childNodes[0].nodeValue);
			break;
		case '#text':
			/*
			 * ignore text childs, like <TextNode textContent="\n">
			 */
			break;

		default:
			G.log('unknown category child: ' + c.nodeName);
			break;
		}
	}

	if (id == null || isNaN(id) || id < 0) {
		G.log('categoryid ' + id + ' is not a valid id.');
		return;
	}

	if (cname == null || cname == '' || cname == 'new category') {
		G.log('category ' + id + ': name ' + cname + ' is not a valid name.');
		return;
	}

	if (Category_container.get(id) != null) {
		G.log('category ' + id
				+ ': there exists allready a category with this id.');
		return;
	}

	// finally add category
	new Category(id, cname);
}

function import_xml_levelaltitudes(xmlDom) {
	"use strict";
	if (xmlDom.childNodes == undefined) {
		G.log('levelaltitudes has no children');
		return;
	}

	for ( var i = 0, c = xmlDom.childNodes[i]; i < xmlDom.childNodes.length; c = xmlDom.childNodes[++i]) {
		switch (c.nodeName) {
		case 'levelaltitude':
			import_xml_levelaltitude(c);
			break;
		case '#text':
			/*
			 * ignore text childs, like <TextNode textContent="\n">
			 */
			break;

		default:
			G.log('unknown levelaltitudes child: ' + c.nodeName);
			break;
		}
	}
}

function import_xml_levelaltitude(xmlDom) {
	"use strict";
	var id = null;
	var min = null;
	var max = null;

	if (xmlDom.childNodes == undefined) {
		G.log('levelaltitude has no children');
		return;
	}

	for ( var i = 0, c = xmlDom.childNodes[i]; i < xmlDom.childNodes.length; c = xmlDom.childNodes[++i]) {
		switch (c.nodeName) {
		case 'id':
			id = parseInt(c.childNodes[0].nodeValue, 10);
			break;
		case 'min':
			min = parseFloat(c.childNodes[0].nodeValue);
			break;
		case 'max':
			max = parseFloat(c.childNodes[0].nodeValue);
			break;
		case '#text':
			/*
			 * ignore text childs, like <TextNode textContent="\n">
			 */
			break;

		default:
			G.log('unknown levelaltitude child: ' + c.nodeName);
			break;
		}
	}

	if (id == null || isNaN(id) || id < 0 || G.svg_element[id] == undefined) {
		G.log('levelaltitudeid ' + id + ' is not a valid id.');
		return;
	}

	if (min == null || isNaN(min)) {
		G.log('levelaltitude ' + id + ': min ' + min + ' is not a valid min.');
		return;
	}

	if (max == null || isNaN(max)) {
		G.log('levelaltitude ' + id + ': max ' + max + ' is not a valid max.');
		return;
	}

	if (min >= max) {
		G.log('levelaltitude ' + id + ': min must be lower than max.');
		return;
	}

	for ( var j = 0; j < G.svg_element.length; j++) {
		if (j == id)
			continue;

		var min2 = LevelAltitude_min[j];
		var max2 = LevelAltitude_max[j];

		if (min2 === undefined || max2 === undefined) {
			continue;
		}

		if ((min2 < max && max < max2) || (min2 < min && min < max2)) {
			G.log('levelaltitude ' + id + ': conflicts with level ' + j + '.');
			return;
		}
	}

	LevelAltitude_min[id] = min;
	LevelAltitude_max[id] = max;
}

function import_xml_gpsmarkers(xmlDom) {
	"use strict";
	if (xmlDom.childNodes == undefined) {
		G.log('gpsmarkers has no children');
		return;
	}

	for ( var i = 0, c = xmlDom.childNodes[i]; i < xmlDom.childNodes.length; c = xmlDom.childNodes[++i]) {
		switch (c.nodeName) {
		case 'gpsmarker':
			import_xml_gpsmarker(c);
			break;
		case '#text':
			/*
			 * ignore text childs, like <TextNode textContent="\n">
			 */
			break;

		default:
			G.log('unknown gpsmarkers child: ' + c.nodeName);
			break;
		}
	}
}

function import_xml_gpsmarker(xmlDom) {
	"use strict";
	var id = null;
	var svgid = null;
	var x_pos = null;
	var y_pos = null;
	var latitude = null;
	var longitude = null;

	if (xmlDom.childNodes == undefined) {
		G.log('vertex has no children');
		return;
	}

	for ( var i = 0, c = xmlDom.childNodes[i]; i < xmlDom.childNodes.length; c = xmlDom.childNodes[++i]) {
		switch (c.nodeName) {
		case 'id':
			id = parseInt(c.childNodes[0].nodeValue, 10);
			break;
		case 'svgid':
			svgid = parseInt(c.childNodes[0].nodeValue, 10);
			break;
		case 'x-pos':
			x_pos = parseFloat(c.childNodes[0].nodeValue);
			break;
		case 'y-pos':
			y_pos = parseFloat(c.childNodes[0].nodeValue);
			break;
		case 'latitude':
			latitude = parseFloat(c.childNodes[0].nodeValue);
			break;
		case 'longitude':
			longitude = parseFloat(c.childNodes[0].nodeValue);
			break;
		case '#text':
			/*
			 * ignore text childs, like <TextNode textContent="\n">
			 */
			break;

		default:
			G.log('unknown gpsmarker child: ' + c.nodeName);
			break;
		}
	}

	if (id == null || isNaN(id) || id < 0) {
		G.log('gpsmarkerid ' + id + ' is not a valid id.');
		return;
	}

	if (svgid == null || isNaN(svgid) || svgid < 0
			|| G.svg_element[svgid] == undefined) {
		G.log('gpsmarker ' + id + ': svgid ' + svgid + ' is not a valid id.');
		return;
	}

	if (x_pos == null || isNaN(x_pos) || x_pos < 0
			|| x_pos > MZP.backup_width[svgid]) {
		G.log('gpsmarker ' + id + ': x-value ' + x_pos + ' is not valid.');
		return;
	}

	if (y_pos == null || isNaN(y_pos) || y_pos < 0
			|| y_pos > MZP.backup_height[svgid]) {
		G.log('gpsmarker ' + id + ': y-value ' + y_pos + ' is not valid.');
		return;
	}

	if (latitude == null || isNaN(latitude)) {
		G.log('gpsmarker ' + id + ': latitude ' + latitude + ' is not valid.');
		return;
	}

	if (longitude == null || isNaN(longitude)) {
		G
				.log('gpsmarker ' + id + ': longitude ' + longitude
						+ ' is not valid.');
		return;
	}

	if (Gpsmarker_container.get(id) != null) {
		G.log('gpsmarker ' + id
				+ ': there exists allready a gpsmarker with this id.');
		return;
	}

	// check for too close gpsmarker
	var gpsmarkerarray = Gpsmarker_container.getAll();
	for ( var i = 0, g = gpsmarkerarray[i]; i < gpsmarkerarray.length; g = gpsmarkerarray[++i]) {
		// only check in same level
		if (g.getSvgid() != svgid)
			continue;

		var distance = parseInt(Math.sqrt(Math.pow(g.getX() - x_pos, 2)
				+ Math.pow(g.getY() - y_pos, 2)), 10);
		if (distance < G.vertex_minDistance) {
			G.log('gpsmarker ' + id + ': detect too close gpsmarker with id '
					+ i + '.');
			return;
		}
	}

	var gpsmarker = new Gpsmarker(id, svgid, x_pos, y_pos);

	if (latitude != null)
		gpsmarker.setLatitude(latitude);
	if (longitude != null)
		gpsmarker.setLongitude(longitude);
}

function import_xml_vertexes(xmlDom) {
	"use strict";
	if (xmlDom.childNodes == undefined) {
		G.log('vertexes has no children');
		return;
	}

	for ( var i = 0, c = xmlDom.childNodes[i]; i < xmlDom.childNodes.length; c = xmlDom.childNodes[++i]) {
		switch (c.nodeName) {
		case 'vertex':
			import_xml_vertex(c);
			break;
		case '#text':
			/*
			 * ignore text childs, like <TextNode textContent="\n">
			 */
			break;

		default:
			G.log('unknown vertexes child: ' + c.nodeName);
			break;
		}
	}
}

function import_xml_vertex(xmlDom) {
	"use strict";
	var id = null;
	var svgid = null;
	var x_pos = null;
	var y_pos = null;
	var poi = null;
	var shortDesc = null;
	var longDesc = null;
	var polygon = null;
	var bp_first = null;
	var categoryid = null;

	if (xmlDom.childNodes == undefined) {
		G.log('vertex has no children');
		return;
	}

	for ( var i = 0, c = xmlDom.childNodes[i]; i < xmlDom.childNodes.length; c = xmlDom.childNodes[++i]) {
		switch (c.nodeName) {
		case 'id':
			id = parseInt(c.childNodes[0].nodeValue, 10);
			break;
		case 'svgid':
			svgid = parseInt(c.childNodes[0].nodeValue, 10);
			break;
		case 'x-pos':
			x_pos = parseFloat(c.childNodes[0].nodeValue);
			break;
		case 'y-pos':
			y_pos = parseFloat(c.childNodes[0].nodeValue);
			break;
		case 'poi':
			poi = c.childNodes[0].nodeValue;
			break;
		case 'shortDescription':
			shortDesc = unescape(c.childNodes[0].nodeValue);
			break;
		case 'longDescription':
			longDesc = unescape(c.childNodes[0].nodeValue);
			break;
		case 'borderpoint':
			if (polygon == null)
				polygon = new Polygon();
			var bp_id = null;
			var bp_x = null;
			var bp_y = null;

			for ( var j = 0, d = c.childNodes[j]; j < c.childNodes.length; d = c.childNodes[++j]) {
				switch (d.nodeName) {
				case 'id':
					bp_id = parseInt(d.childNodes[0].nodeValue, 10);
					break;
				case 'x-pos':
					bp_x = parseFloat(d.childNodes[0].nodeValue);
					break;
				case 'y-pos':
					bp_y = parseFloat(d.childNodes[0].nodeValue);
					break;
				case '#text':
					/*
					 * ignore text childs, like <TextNode textContent="\n">
					 */
					break;

				default:
					G.log('unknown borderpoint child: ' + d.nodeName);
					break;
				}
			}

			if (bp_id == null || isNaN(bp_id) || bp_id < 0) {
				G.log('borderpoint id ' + bp_id + ' is not a valid id.');
				return;
			}
			if (bp_x == null || isNaN(bp_x)) {
				G.log('borderpointpoint ' + id + ': x-value ' + bp_x
						+ ' is not valid.');
				return;
			}
			if (bp_y == null || isNaN(bp_y)) {
				G.log('borderpointpoint ' + id + ': y-value ' + bp_y
						+ ' is not valid.');
				return;
			}

			var bp_tmp = Affiliation_borderpoint_container.get(bp_id);
			if (bp_tmp != null) {
				// borderpoint exists already

				// test if x and y match
				if (bp_x != bp_tmp.getX()) {
					G.log('borderpointpoint ' + id + ': x pos does not match: '
							+ bp_x + ' : ' + bp_tmp.getX());
					return;
				}
				if (bp_y != bp_tmp.getY()) {
					G.log('borderpointpoint ' + id + ': y pos does not match: '
							+ bp_y + ' : ' + bp_tmp.getY());
					return;
				}
			} else {
				// borderpoint does not exist
				bp_tmp = new BorderPoint(bp_id, svgid, bp_x, bp_y);
			}

			polygon.add(bp_tmp);

			// backup first id for closing
			if (bp_first == null)
				bp_first = bp_tmp;

			break;
		case 'category':
			categoryid = parseInt(c.childNodes[0].nodeValue, 10);
			break;
		case '#text':
			/*
			 * ignore text childs, like <TextNode textContent="\n">
			 */
			break;

		default:
			G.log('unknown vertex child: ' + c.nodeName);
			break;
		}
	}

	if (id == null || isNaN(id) || id < 0) {
		G.log('pointid ' + id + ' is not a valid id.');
		return;
	}

	if (svgid == null || isNaN(svgid) || svgid < 0
			|| G.svg_element[svgid] == undefined) {
		G.log('point ' + id + ': svgid ' + svgid + ' is not a valid id.');
		return;
	}

	if (x_pos == null || isNaN(x_pos) || x_pos < 0
			|| x_pos > MZP.backup_width[svgid]) {
		G.log('point ' + id + ': x-value ' + x_pos + ' is not valid.');
		return;
	}

	if (y_pos == null || isNaN(y_pos) || y_pos < 0
			|| y_pos > MZP.backup_height[svgid]) {
		G.log('point ' + id + ': y-value ' + y_pos + ' is not valid.');
		return;
	}

	if (poi != 'true' && poi != 'false') {
		G.log('point ' + id + ': poi-value ' + poi + ' is not valid.');
		return;
	}

	if (Vertex_container.get(id) != null) {
		G.log('point ' + id + ': there exists allready a point with this id.');
		return;
	}

	// check for too close points
	var vertexarray = Vertex_container.getAll();
	for ( var i = 0, v = vertexarray[i]; i < vertexarray.length; v = vertexarray[++i]) {
		// only check in same level
		if (v.getSvgid() != svgid)
			continue;

		var distance = parseInt(Math.sqrt(Math.pow(v.getX() - x_pos, 2)
				+ Math.pow(v.getY() - y_pos, 2)), 10);
		if (distance < G.vertex_minDistance) {
			G
					.log('point ' + id + ': detect too close point with id '
							+ i + '.');
			return;
		}
	}

	if (polygon != null) {
		// close polygon
		if (bp_first == null) {
			G.log('point ' + id + ': bp_firstId of polygon is null.');
			return;
		}
		polygon.add(bp_first);
		polygon.color();
	}

	// finally add point
	var vertex = new Vertex(id, svgid, x_pos, y_pos);

	if (poi == 'false')
		vertex.setPoi(false);
	else
		vertex.setPoi(true);
	if (shortDesc != null)
		vertex.setShortDesc(shortDesc);
	if (longDesc != null)
		vertex.setLongDesc(longDesc);
	if (polygon != null)
		vertex.setPolygon(polygon);
	if (categoryid != null)
		vertex.setCategory(Category_container.get(categoryid));
}

function import_xml_edges(xmlDom) {
	"use strict";
	if (xmlDom.childNodes == undefined) {
		G.log('edges has no children');
		return;
	}

	for ( var i = 0, c = xmlDom.childNodes[i]; i < xmlDom.childNodes.length; c = xmlDom.childNodes[++i]) {
		switch (c.nodeName) {
		case 'edge':
			import_xml_edge(c);
			break;
		case '#text':
			/*
			 * ignore text childs, like <TextNode textContent="\n">
			 */
			break;

		default:
			G.log('unknown edges child: ' + c.nodeName);
			break;
		}
	}
}

function import_xml_edge(xmlDom) {
	"use strict";
	var id = null;
	var v1_id = null;
	var v1_reachable = null;
	var v1_stepmarker_x = null;
	var v1_stepmarker_y = null;
	var v2_id = null;
	var v2_reachable = null;
	var v2_stepmarker_x = null;
	var v2_stepmarker_y = null;
	var distanceFactor = null;
	var disabledAdapted = null;

	if (xmlDom.childNodes == undefined) {
		G.log('edge has no children');
		return;
	}

	for ( var i = 0, c = xmlDom.childNodes[i]; i < xmlDom.childNodes.length; c = xmlDom.childNodes[++i]) {
		switch (c.nodeName) {
		case 'id':
			id = parseInt(c.childNodes[0].nodeValue, 10);
			break;
		case 'vertex1':
			v1_id = parseInt(c.childNodes[0].nodeValue, 10);
			break;
		case 'vertex1-reachable':
			v1_reachable = c.childNodes[0].nodeValue;
			break;
		case 'vertex1-stepmarker':
			for ( var j = 0, d = c.childNodes[j]; j < c.childNodes.length; d = c.childNodes[++j]) {
				switch (d.nodeName) {
				case 'x-pos':
					v1_stepmarker_x = parseInt(d.childNodes[0].nodeValue, 10);
					break;
				case 'y-pos':
					v1_stepmarker_y = parseInt(d.childNodes[0].nodeValue, 10);
					break;
				case '#text':
					/*
					 * ignore text childs, like <TextNode textContent="\n">
					 */
					break;

				default:
					G.log('unknown vertex1-stepmarker child: ' + d.nodeName);
					break;
				}
			}
			break;
		case 'vertex2':
			v2_id = parseInt(c.childNodes[0].nodeValue, 10);
			break;
		case 'vertex2-reachable':
			v2_reachable = c.childNodes[0].nodeValue;
			break;
		case 'vertex2-stepmarker':
			for ( var j = 0, d = c.childNodes[j]; j < c.childNodes.length; d = c.childNodes[++j]) {
				switch (d.nodeName) {
				case 'x-pos':
					v2_stepmarker_x = parseInt(d.childNodes[0].nodeValue, 10);
					break;
				case 'y-pos':
					v2_stepmarker_y = parseInt(d.childNodes[0].nodeValue, 10);
					break;
				case '#text':
					/*
					 * ignore text childs, like <TextNode textContent="\n">
					 */
					break;

				default:
					G.log('unknown vertex2-stepmarker child: ' + d.nodeName);
					break;
				}
			}
			break;
		case 'distanceFactor':
			distanceFactor = parseFloat(c.childNodes[0].nodeValue);
			break;
		case 'disabledAdapted':
			disabledAdapted = c.childNodes[0].nodeValue;
			break;
		case '#text':
			/*
			 * ignore text childs, like <TextNode textContent="\n">
			 */
			break;

		default:
			G.log('unknown edge child: ' + c.nodeName);
			break;
		}
	}

	if (id == null || isNaN(id) || id < 0) {
		G.log('edge id ' + id + ' is not a valid id.');
		return;
	}

	if (Edge_container.get(id) != null) {
		G.log('edge ' + id + ': there exists allready an edge with this id.');
		return;
	}

	if (v1_id == null || isNaN(v1_id) || v1_id < 0) {
		console
				.log('edge ' + id + ': pointid ' + v1_id
						+ ' is not a valid id.');
		return;
	}

	var vertex1 = Vertex_container.get(v1_id);
	if (vertex1 == null) {
		G.log('edge ' + id + ': do not find a point with id ' + v1_id + '.');
		return;
	}

	if (v2_id == null || isNaN(v2_id) || v2_id < 0) {
		console
				.log('edge ' + id + ': pointid ' + v2_id
						+ ' is not a valid id.');
		return;
	}

	var vertex2 = Vertex_container.get(v2_id);
	if (vertex2 == null) {
		G.log('edge ' + id + ': do not find a point with id ' + v2_id + '.');
		return;
	}

	if (v1_id == v2_id) {
		G.log('edge ' + id + ': start and end vertex are the same.');
		return;
	}

	if (v1_reachable != 'true' && v1_reachable != 'false') {
		G.log('edge ' + id + ': to point 1 value ' + v1_reachable
				+ ' is not valid.');
		return;
	}

	if (v2_reachable != 'true' && v2_reachable != 'false') {
		G.log('edge ' + id + ': to point 1 value ' + v2_reachable
				+ ' is not valid.');
		return;
	}

	if (v1_reachable == 'false' && v2_reachable == 'false') {
		G.log('edge ' + id + ': has no route.');
		return;
	}

	if (vertex1.getSvgid() == vertex2.getSvgid()
			&& (v1_stepmarker_x != null || v1_stepmarker_y != null
					|| v2_stepmarker_x != null || v2_stepmarker_y != null)) {
		G.log('edge ' + id
				+ ': stepmarker given, but edge is located only in one level.');
		return;
	}

	if (v1_stepmarker_x != null
			&& (isNaN(v1_stepmarker_x) || v1_stepmarker_x < 0 || v1_stepmarker_x > MZP.backup_width[vertex1
					.getSvgid()])) {
		G.log('edge ' + id + ': stepmarker1: x-value ' + v1_stepmarker_x
				+ ' is not valid.');
		return;
	}

	if (v1_stepmarker_y != null
			&& (isNaN(v1_stepmarker_y) || v1_stepmarker_y < 0 || v1_stepmarker_y > MZP.backup_height[vertex1
					.getSvgid()])) {
		G.log('edge ' + id + ': stepmarker1: y-value ' + v1_stepmarker_y
				+ ' is not valid.');
		return;
	}

	if (v2_stepmarker_x != null
			&& (isNaN(v2_stepmarker_x) || v2_stepmarker_x < 0 || v2_stepmarker_x > MZP.backup_width[vertex2
					.getSvgid()])) {
		G.log('edge ' + id + ': stepmarker2: x-value ' + v2_stepmarker_x
				+ ' is not valid.');
		return;
	}

	if (v2_stepmarker_y != null
			&& (isNaN(v2_stepmarker_y) || v2_stepmarker_y < 0 || v2_stepmarker_y > MZP.backup_height[vertex2
					.getSvgid()])) {
		G.log('edge ' + id + ': stepmarker1: y-value ' + v2_stepmarker_y
				+ ' is not valid.');
		return;
	}

	if (v1_stepmarker_x == null && v1_stepmarker_y != null
			|| v1_stepmarker_x != null && v1_stepmarker_y == null) {
		G.log('edge ' + id + ': stepmarker1: only one coordinate given.');
		return;
	}

	if (v2_stepmarker_x == null && v2_stepmarker_y != null
			|| v2_stepmarker_x != null && v2_stepmarker_y == null) {
		G.log('edge ' + id + ': stepmarker2: only one coordinate given.');
		return;
	}

	if (distanceFactor != null
			&& (isNaN(distanceFactor) || distanceFactor <= 0 || distanceFactor > 9999)) {
		G.log('edge ' + id + ': distance factor ' + distanceFactor
				+ ' is not a valid distance factor.');
		return;
	}

	if (disabledAdapted != 'true' && disabledAdapted != 'false') {
		G.log('edge ' + id + ': disabled adapted value ' + disabledAdapted
				+ ' is not valid.');
		return;
	}

	var edgelist = vertex1.getEdgelist();
	for ( var j = 0, e = edgelist[j]; j < edgelist.length; e = edgelist[++j]) {
		if (e.getVertex1().getId() == v2_id || e.getVertex2().getId() == v2_id) {
			G.log('edge ' + id + ': find allready edge ' + j + ' from point '
					+ v1_id + ' to point ' + v2_id + '.');
			return;
		}
	}

	var edge_toPid1_bool = true;
	var edge_toPid2_bool = true;
	if (v1_reachable == 'false')
		edge_toPid1_bool = false;
	if (v2_reachable == 'false')
		edge_toPid2_bool = false;

	var edge = new Edge(id, vertex1, vertex2, edge_toPid1_bool,
			edge_toPid2_bool);
	if (distanceFactor != null) {
		edge.setDistanceFactor(distanceFactor);
	}

	if (disabledAdapted == 'true') {
		edge.setDisabledAdapted(true);
		edge.drawDisabledAdapted(true);
	} else {
		edge.setDisabledAdapted(false);
		edge.drawDisabledAdapted(false);
	}

	if (v1_stepmarker_x != null)
		edge.getVertex1_stepmarker().setPosition(v1_stepmarker_x,
				v1_stepmarker_y);

	if (v2_stepmarker_x != null)
		edge.getVertex2_stepmarker().setPosition(v2_stepmarker_x,
				v2_stepmarker_y);
}
