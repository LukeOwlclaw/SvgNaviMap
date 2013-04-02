"use strict";

// Global is a first-class function (like a static class) that holds all global
// variables.
function G() {
	"use strict";
	// var privateVariable = 0;
	// this.publicVariable = 1;
}
G.global = 'This is a global variable accessible from everywhere via G.global';

//Holds XMLs of all SvgNaviMap projects available. These are displayed in editor's view.
var maps = [ "minimal-data.xml", "airport-data.xml", "big-data.xml", "test.xml" ];

//default selected SvgNaviMap project
var selectedMap =  maps[1];

G.getAvailableXmlFiles = function() {
	return maps;
}

//specifies file to be loaded when clicking "load from server"
G.getXmlFilename = function() {
	return selectedMap;
}

G.setXmlFilename = function(xmlPathRelativeToDataDir) {
	selectedMap = xmlPathRelativeToDataDir;
}

//specifies number of levels of map. only available AFTER loading xml file. 
G.getLevelCount = function() {
	if(G.Level_svgpath == null)
		return 0;
	return G.Level_svgpath.length;
}

var isDevel = true;

//returns path to svg map per level. only available AFTER loading xml file.
G.getMapPath = function(level) {
	if(G.Level_svgpath[level].substr(0,7) == "http://")
		return  G.Level_svgpath[level]; //absolute URL
	else
	{	
		if(isDevel)
			return G.getDataDir() + G.Level_svgpath[level]+ "?time=" + Date.now(); //for development: force no cache.
		else
			return G.getDataDir() + G.Level_svgpath[level]; //svg path relative to data dir
	}
}

//required for downloading XML configuration file. internally used only.
G.getXmlPath = function() {
	if(isDevel)
		return G.getDataDir() + G.getXmlFilename() + "?time=" + Date.now(); //for development: force no cache.
	else
		return G.getDataDir() + G.getXmlFilename();
}

//internally used only
G.getDataDir = function() {
	return "data/";
}


G.loadMapsCompleted = false;
/*
 * Appends for each map defined by G.getLevelCount() and G.getMapPath() an
 * embedded element to div#map_container. Async call, pretty quick.
 */
G.loadMaps = function(createScaleButton) {
	
	if(G.getLevelCount()==0)
	{
		G.log("Xml file not loaded. Do not call G.loadMaps directly. Call load_from_server_xml(null, \"minimal-data.xml\"); instead.");
		return;
	}
	
	G.loadMapsCompleted = false;
	
	//remove all old maps
	var el = document.getElementById('map_container');
	while( el.hasChildNodes() ){
	    el.removeChild(el.lastChild);
	}
	
	for ( var i = 0; i < G.getLevelCount(); i++) {
		var newmapdiv = document.createElement("div");
		newmapdiv.setAttribute("class", "mapdiv");
		
		var newmap = document.createElement("embed");
		newmap.setAttribute("src", G.getMapPath(i));
		newmap.setAttribute("id", "map" + i);
		newmap.setAttribute("type", "image/svg+xml");
		newmap.setAttribute("class", "svg_container");
		//newmap.style.width = "440px";
		//newmap.style.height = "200px";

		newmapdiv.appendChild(newmap);
		

		if (createScaleButton) {
			var scalebutton = document.createElement("button");
			scalebutton.setAttribute("id", "map" + i + "_rescale");
			scalebutton.setAttribute("onclick", "MZP.rescale(" + i + ");");
			var content = document.createTextNode("Rescale");
			scalebutton.appendChild(content);
			newmapdiv.appendChild(scalebutton);
			
			var hideshowbutton = document.createElement("button");
			hideshowbutton.setAttribute("onclick", "UIManager.setVisibility(\"map" + i + "\", \"toggle\");");
			var content = document.createTextNode("Hide/Show");
			hideshowbutton.appendChild(content);
			newmapdiv.appendChild(hideshowbutton);
		}
		
		document.getElementById("map_container").appendChild(newmapdiv);
	}

	var embed = document.getElementsByTagName('embed');
	for ( var i = 0; i < embed.length; i++) {
		G.install_init_hook(embed[i], i, embed.length, G.svg_init_callback);
	}
}

//hooks that is called when SVG has finished loading.
//instance of SvgNaviMap may implement svg_init_custom() which is called from here.
G.svg_init_callback = function() {
	G.loadMapsCompleted = true;
	G.log("SVG loaded completely.");
	
	
	if (typeof(svg_init_custom) == 'undefined' || isFunction(svg_init_custom) == false) {
		G.log("svg_init_custom() is not implemented.");
		return;
	}
	else
		svg_init_custom();
}

/*
 * Appends for each map defined by G.getLevelCount() and G.getMapPath() an input
 * radio element to div#svgselection for selecting the according SVG
 */
G.loadMapSelectors = function() {
	
	//remove all old items
	var el = document.getElementById('svgselection');
	while( el.hasChildNodes() ){
	    el.removeChild(el.lastChild);
	}	
	
	for ( var i = 0; i < G.getLevelCount(); i++) {
		var selector = document.createElement("input");
		selector.setAttribute("type", "radio");
		selector.setAttribute("src", G.getMapPath(i));
		selector.setAttribute("id", "select_map" + i);
		selector.setAttribute("name", "svgid");
		selector.setAttribute("value", i);
		selector.setAttribute("onchange", "client_selectsvg(" + i + ")");
		if (i == 0)
			selector.setAttribute("checked", "checked");

		document.getElementById("svgselection").appendChild(selector);

		var content = document.createTextNode("Level " + i);
		selector.parentNode.appendChild(content);
		var br = document.createElement("br");
		selector.parentNode.appendChild(br);

	}
}

//called on document ready. do some internal init of SvgNaviMap. Pretty quick.
G.init = function() {
	"use strict";
	// G.log('init start');
	document.getElementById('noscript').style.display = 'none';

	if (null == (window.BlobBuilder || window.WebKitBlobBuilder
			|| window.MozBlobBuilder || window.MSBlobBuilder || Blob)) {
		var warning = "Warning! This browser does not support BlobBuilder. You will NOT be able to export and save your changes!";
		document.getElementById('noscript').style.display = 'block';
		document.getElementById('noscript').innerHTML = warning;
		document.getElementById('noscript').style.color = "red";
		// alert(warning);
	}

	G.svg_init = new Array();
	G.svg_parent = new Array();
	G.svg_document = new Array();
	G.svg_element = new Array();
	G.svg_unit_tuhh = new Array();
	G.svg_unit_vertex = new Array();
	G.svg_unit_edge = new Array();
	G.svg_unit_stepmarker = new Array();
	G.svg_unit_borderpoint = new Array();
	G.svg_unit_borderline = new Array();
	G.svg_unit_dijkstra = new Array();
	G.svg_unit_affiliation_area = new Array();
	G.svg_unit_gpsmarker = new Array();
	
	//init_custom() may be implemented as global function by each view with uses SvgNaviMap.
	if (typeof(init_custom) == 'undefined' || isFunction(init_custom) == false) {
		G.log("init_custom() is not implemented.");
		return;
	}
	else
		init_custom();

};

// Installiert Event Listener, der für jedes SVG init_svg() aufruft, und sobald alle SVG elemente
// geladen sind callback ausführt.
G.install_init_hook = function(element, id, count, callback) {
	G.svg_init[id] = false;
	element
			.addEventListener(
					'load',
					function(evt) {
						switch (G.svg_init[id]) {
						case false:
							G.init_svg(element, id);

							if (callback != null && callback != undefined) {
								// call only func, if everything is init'ed
								for ( var i = 0; i < count; i++) {
									if (G.svg_init[i] != true)
										return;
								}
								callback();
							}
							break;
						case true:
							G.svg_parent[id] = element;
							G.svg_document[id] = G.svg_parent[id]
									.getSVGDocument();
							G.svg_element[id] = G.svg_document[id]
									.getElementsByTagName('svg')[0];
							G.svg_element[id].appendChild(G.svg_unit_tuhh[id]);
							MZP.init(id);

							// renew vertex events, so that chrome gets them
							for ( var i = 0, v = Vertex_container.getAll()[i]; i < Vertex_container
									.getAll().length; v = Vertex_container
									.getAll()[++i]) {
								if (v.getSvgid() == id)
									v.refreshChrome();
							}
							// renew positionpoint animation also, so that
							// chrome starts
							// it
							if (currPositionPoint != null
									&& currPositionPoint.getSvgid() == id) {
								currPositionPoint.refreshChrome();
							}
							break;
						default:
							console.log('invalid entry ' + G.svg_init[id]
									+ ' in G.svg_init[' + id + ']');
							break;
						}
					});
};

G.init_svg = function(element, id) {
	"use strict";
	 G.log('init_svg ' + id);

	// required for SVG embedded using <embed>
	// e.g. <embed id="map0" src="office_simple.svg" type="image/svg+xml"
	// onload="G.init();">
	G.svg_parent[id] = element;
	G.svg_document[id] = G.svg_parent[id].getSVGDocument();
	if (G.svg_document[id] == null) {
		G.log("G.init_svg() failed. SVG not loaded yet.1");
		return;
	}
	G.svg_element[id] = G.svg_document[id].getElementsByTagName('svg')[0];
	if (G.svg_element[id] == null) {
		G.log("G.init_svg() failed. SVG not loaded yet.2");
		return;
	}

	// initialise g-elements
	var unit_tuhh = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	unit_tuhh.setAttribute('id', 'unit_tuhh');
	G.svg_element[id].appendChild(unit_tuhh);
	G.svg_unit_tuhh[id] = G.svg_element[id].getElementById('unit_tuhh');

	var unit_vertex = document.createElementNS('http://www.w3.org/2000/svg',
			'g');
	unit_vertex.setAttribute('id', 'unit_vertex');
	G.svg_unit_tuhh[id].appendChild(unit_vertex);
	G.svg_unit_vertex[id] = G.svg_element[id].getElementById('unit_vertex');

	var unit_edge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	unit_edge.setAttribute('id', 'unit_edge');
	G.svg_unit_tuhh[id].appendChild(unit_edge);
	G.svg_unit_edge[id] = G.svg_element[id].getElementById('unit_edge');

	var unit_stepmarker = document.createElementNS(
			'http://www.w3.org/2000/svg', 'g');
	unit_stepmarker.setAttribute('id', 'unit_stepmarker');
	G.svg_unit_tuhh[id].appendChild(unit_stepmarker);
	G.svg_unit_stepmarker[id] = G.svg_element[id]
			.getElementById('unit_stepmarker');

	var unit_borderpoint = document.createElementNS(
			'http://www.w3.org/2000/svg', 'g');
	unit_borderpoint.setAttribute('id', 'unit_borderpoint');
	G.svg_unit_tuhh[id].appendChild(unit_borderpoint);
	G.svg_unit_borderpoint[id] = G.svg_element[id]
			.getElementById('unit_borderpoint');

	var unit_borderline = document.createElementNS(
			'http://www.w3.org/2000/svg', 'g');
	unit_borderline.setAttribute('id', 'unit_borderline');
	G.svg_unit_tuhh[id].appendChild(unit_borderline);
	G.svg_unit_borderline[id] = G.svg_element[id]
			.getElementById('unit_borderline');

	var unit_dijkstra = document.createElementNS('http://www.w3.org/2000/svg',
			'g');
	unit_dijkstra.setAttribute('id', 'unit_dijkstra');
	G.svg_unit_tuhh[id].appendChild(unit_dijkstra);
	G.svg_unit_dijkstra[id] = G.svg_element[id].getElementById('unit_dijkstra');

	var unit_gpsmarker = document.createElementNS('http://www.w3.org/2000/svg',
			'g');
	unit_gpsmarker.setAttribute('id', 'unit_gpsmarker');
	G.svg_unit_tuhh[id].appendChild(unit_gpsmarker);
	G.svg_unit_gpsmarker[id] = G.svg_element[id]
			.getElementById('unit_gpsmarker');

	// add title
	var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
	title.setAttribute('id', 'identifier');
	title.setAttribute('value', id);
	G.svg_unit_tuhh[id].appendChild(title);

	// add edge marker
	// <defs>
	// <marker id='Triangle'
	// viewBox='0 0 10 10' refX='0' refY='5'
	// markerUnits='strokeWidth'
	// markerWidth='4' markerHeight='3'
	// orient='auto'>
	// <path d='M 0 0 L 10 5 L 0 10 z' />
	// </marker>
	// </defs>

	// 1. start marker
	var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
	var marker_1 = document.createElementNS('http://www.w3.org/2000/svg',
			'marker');
	marker_1.setAttribute('id', 'Triangle-start');
	marker_1.setAttribute('viewBox', '0 0 8 8');
	marker_1.setAttribute('refX', '4');
	marker_1.setAttribute('refY', '4');
	marker_1.setAttribute('markerUnits', 'strokeWidth');
	// marker_1.setAttribute('markerUnits', 'userSpaceOnUse');
	marker_1.setAttribute('markerWidth', '4');
	marker_1.setAttribute('markerHeight', '4');
	marker_1.setAttribute('orient', 'auto');
	marker_1.setAttribute('fill', G.routingEdgeArrowColor);
	var path_1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path_1.setAttribute('d', 'M 0 4 L 8 8 L 8 0 z');
	marker_1.appendChild(path_1);
	defs.appendChild(marker_1);

	// 2. end marker
	var marker_2 = document.createElementNS('http://www.w3.org/2000/svg',
			'marker');
	marker_2.setAttribute('id', 'Triangle-end');
	marker_2.setAttribute('viewBox', '0 0 8 8');
	marker_2.setAttribute('refX', '4');
	marker_2.setAttribute('refY', '4');
	marker_2.setAttribute('markerUnits', 'strokeWidth');
	// marker_2.setAttribute('markerUnits', 'userSpaceOnUse');
	marker_2.setAttribute('markerWidth', '4');
	marker_2.setAttribute('markerHeight', '4');
	marker_2.setAttribute('orient', 'auto');
	marker_2.setAttribute('fill', G.routingEdgeArrowColor);
	var path_2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path_2.setAttribute('d', 'M 0 0 L 8 4 L 0 8 z');
	marker_2.appendChild(path_2);
	defs.appendChild(marker_2);

	// 3. switch marker
	var marker_3 = document.createElementNS('http://www.w3.org/2000/svg',
			'marker');
	marker_3.setAttribute('id', 'Triangle-switch');
	marker_3.setAttribute('viewBox', '0 0 8 8');
	marker_3.setAttribute('refX', '4');
	marker_3.setAttribute('refY', '4');
	marker_3.setAttribute('markerUnits', 'strokeWidth');
	// marker_3.setAttribute('markerUnits', 'userSpaceOnUse');
	marker_3.setAttribute('markerWidth', '4');
	marker_3.setAttribute('markerHeight', '4');
	marker_3.setAttribute('orient', 'auto');
	var path_3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path_3.setAttribute('d', 'M 0 4 L 4 0 L 8 4 L 4 8 z');
	path_3.setAttribute('fill', 'rgb(0,200,0)');
	path_3.setAttribute('style', 'stroke:rgb(0,0,0)');
	path_3.setAttribute('stroke-width', '0.9');
	marker_3.appendChild(path_3);
	defs.appendChild(marker_3);

	// append markers
	G.svg_unit_tuhh[id].appendChild(defs);

	MZP.init(id);

	G.svg_init[id] = true;

	// if (typeof (svgapp) != "undefined") {
	// // set size of svg images
	//
	// var ViewX = "0";
	// var ViewY = "0";
	// if (self.innerHeight) {
	// ViewX = self.innerWidth;
	// ViewY = self.innerHeight;
	// } else if (document.documentElement
	// && document.documentElement.clientHeight) {
	// ViewX = document.documentElement.clientWidth;
	// ViewY = document.documentElement.clientHeight;
	// } else if (document.body) {
	// ViewX = document.body.clientWidth;
	// ViewY = document.body.clientHeight;
	// } else {
	// alert('Can not estimate screen resolution!');
	// ViewX = null;
	// ViewY = null;
	// }
	//			
	//		
	// if (ViewX != null && ViewY != null) {
	// G.svg_parent[id].style.width = ViewX*97/100 + "px";
	// G.svg_parent[id].style.height = ViewY*97/100 + "px";
	// }
	// }
};

G.getSvgId = function(event) {
	"use strict";
	var svg = null;

	switch (event.target.tagName) {
	case "svg":
		svg = event.target;
		break;
	case "EMBED":
		svg = event.target.getSVGDocument().getElementsByTagName('svg')[0];
		break;

	default:
		svg = event.target.ownerSVGElement;
		break;
	}

	return svg.getElementById('identifier').getAttribute('value');
};

G.debug = function(s) {
	"use strict";
	if (document.getElementById('debug') != null)
		document.getElementById('debug').innerHTML = s;
};

G.debug_append = function(s) {
	"use strict";
	if (document.getElementById('debug') != null)
		document.getElementById('debug').innerHTML += s;
};

function isFunction(functionToCheck) {
	var getType = {};
	return functionToCheck
			&& getType.toString.call(functionToCheck) === '[object Function]';
}

G.log = function(s) {
	"use strict";

	if (console && isFunction(console.log))
		console.log(s);

	if (typeof (debug) != "undefined" && debug != null && debug != undefined
			&& isFunction(debug))
		debug(s);

	/*
	 * if (document.getElementById('debug') != null)
	 * document.getElementById('debug').innerHTML = s;
	 */
};

// defined by menu.js
G.menu_current = null;

G.svg_init = null;
G.svg_element = null;
G.svg_parent = null;
G.svg_document = null;
G.svg_unit_tuhh = null;
G.svg_unit_vertex = null;
G.svg_unit_edge = null;
G.svg_unit_stepmarker = null;
G.svg_unit_borderpoint = null;
G.svg_unit_borderline = null;
G.svg_unit_dijkstra = null;
G.svg_unit_gpsmarker = null;

// scaling variables
// edit only this one if vertices and edges are to small or big for the svg
// image
G.scale = 2;
// do not edit the following ones
G.vertex_radius = G.scale * 2;
G.vertex_hereami_radius = G.scale * 4;
G.vertex_edging = G.scale * 0.5;
G.vertex_minDistance = G.scale * 5;
G.edge_lineWidth = G.scale * 1;
G.edge_vertexDistance = G.scale * 4.1;
G.edge_strokeColor = G.scale * 1.25;
G.edge_strokeNoColor = G.scale * 0.5;
G.edge_switchWeight = G.scale * 50;
G.stepmarker_length = G.scale * 3.5;
G.stepmarker_stroke = G.scale * 0.5;
G.border_radius = G.scale;
G.border_edging = G.scale * 0.5;
G.border_lineWidth = G.scale * 0.5;
G.border_lineDiff = G.scale * 1.3;
G.border_lineStyle = 'stroke:rgb(255,00,00)';
G.border_lineStyleActive = 'stroke:rgb(153,153,153)';

G.routingEdgeStyle = 'stroke:rgb(255,0,0)';
G.routingEdgeArrowColor = 'black';

G.positionpoint_radius_min = G.scale * 1;
G.positionpoint_radius_max = G.scale * 4;
G.positionpoint_duration = '2.5s';
G.positionpoint_radius_edging = G.scale * 0.5;
G.destinationmarker_dim = G.scale * 2;

// arrays and counter
var Vertex_container = new IDSet();
var Vertex_clickedID = null;
var Vertex_current = null;
var Vertex_hoover = null;
var Vertex_move_enabled = false;

var Edge_clickedID = null;
var Edge_current = null;
var Edge_firstvertex = null;
var Edge_container = new IDSet();

var Stepmarker_clickedID = null;
var Stepmarker_current = null;
var Stepmarker_container = new IDSet();

var Stepmarker_backup1_x = null;
var Stepmarker_backup1_y = null;
var Stepmarker_backup2_x = null;
var Stepmarker_backup2_y = null;

var Affiliation_currentPolygon = null;
var Affiliation_borderPointClickedID = null;

var Affiliation_borderpoint_container = new IDSet();
var Affiliation_borderline_container = new IDSet();

var currPositionPoint = null;
var currLocation = null;

var DijkstraArrows = new Array();
var Routing_destination = null;
var Routing_disabledAdapted = null;

var Client_event_clickRouting = false;

var Category_container = new IDSet();

var Gpsmarker_container = new IDSet();
var Gpsmarker_clickedID = null;
var Gpsmarker_current = null;
var Gpsmarker_move_enabled = false;

var Level_min_altitude = new Array();
var Level_max_altitude = new Array();
var Level_svgpath = new Array();

if (typeof KeyEvent == "undefined") {
	var KeyEvent = {
		DOM_VK_CANCEL : 3,
		DOM_VK_HELP : 6,
		DOM_VK_BACK_SPACE : 8,
		DOM_VK_TAB : 9,
		DOM_VK_CLEAR : 12,
		DOM_VK_RETURN : 13,
		DOM_VK_ENTER : 14,
		DOM_VK_SHIFT : 16,
		DOM_VK_CONTROL : 17,
		DOM_VK_ALT : 18,
		DOM_VK_PAUSE : 19,
		DOM_VK_CAPS_LOCK : 20,
		DOM_VK_ESCAPE : 27,
		DOM_VK_SPACE : 32,
		DOM_VK_PAGE_UP : 33,
		DOM_VK_PAGE_DOWN : 34,
		DOM_VK_END : 35,
		DOM_VK_HOME : 36,
		DOM_VK_LEFT : 37,
		DOM_VK_UP : 38,
		DOM_VK_RIGHT : 39,
		DOM_VK_DOWN : 40,
		DOM_VK_PRINTSCREEN : 44,
		DOM_VK_INSERT : 45,
		DOM_VK_DELETE : 46,
		DOM_VK_0 : 48,
		DOM_VK_1 : 49,
		DOM_VK_2 : 50,
		DOM_VK_3 : 51,
		DOM_VK_4 : 52,
		DOM_VK_5 : 53,
		DOM_VK_6 : 54,
		DOM_VK_7 : 55,
		DOM_VK_8 : 56,
		DOM_VK_9 : 57,
		DOM_VK_SEMICOLON : 59,
		DOM_VK_EQUALS : 61,
		DOM_VK_A : 65,
		DOM_VK_B : 66,
		DOM_VK_C : 67,
		DOM_VK_D : 68,
		DOM_VK_E : 69,
		DOM_VK_F : 70,
		DOM_VK_G : 71,
		DOM_VK_H : 72,
		DOM_VK_I : 73,
		DOM_VK_J : 74,
		DOM_VK_K : 75,
		DOM_VK_L : 76,
		DOM_VK_M : 77,
		DOM_VK_N : 78,
		DOM_VK_O : 79,
		DOM_VK_P : 80,
		DOM_VK_Q : 81,
		DOM_VK_R : 82,
		DOM_VK_S : 83,
		DOM_VK_T : 84,
		DOM_VK_U : 85,
		DOM_VK_V : 86,
		DOM_VK_W : 87,
		DOM_VK_X : 88,
		DOM_VK_Y : 89,
		DOM_VK_Z : 90,
		DOM_VK_CONTEXT_MENU : 93,
		DOM_VK_NUMPAD0 : 96,
		DOM_VK_NUMPAD1 : 97,
		DOM_VK_NUMPAD2 : 98,
		DOM_VK_NUMPAD3 : 99,
		DOM_VK_NUMPAD4 : 100,
		DOM_VK_NUMPAD5 : 101,
		DOM_VK_NUMPAD6 : 102,
		DOM_VK_NUMPAD7 : 103,
		DOM_VK_NUMPAD8 : 104,
		DOM_VK_NUMPAD9 : 105,
		DOM_VK_MULTIPLY : 106,
		DOM_VK_ADD : 107,
		DOM_VK_SEPARATOR : 108,
		DOM_VK_SUBTRACT : 109,
		DOM_VK_DECIMAL : 110,
		DOM_VK_DIVIDE : 111,
		DOM_VK_F1 : 112,
		DOM_VK_F2 : 113,
		DOM_VK_F3 : 114,
		DOM_VK_F4 : 115,
		DOM_VK_F5 : 116,
		DOM_VK_F6 : 117,
		DOM_VK_F7 : 118,
		DOM_VK_F8 : 119,
		DOM_VK_F9 : 120,
		DOM_VK_F10 : 121,
		DOM_VK_F11 : 122,
		DOM_VK_F12 : 123,
		DOM_VK_F13 : 124,
		DOM_VK_F14 : 125,
		DOM_VK_F15 : 126,
		DOM_VK_F16 : 127,
		DOM_VK_F17 : 128,
		DOM_VK_F18 : 129,
		DOM_VK_F19 : 130,
		DOM_VK_F20 : 131,
		DOM_VK_F21 : 132,
		DOM_VK_F22 : 133,
		DOM_VK_F23 : 134,
		DOM_VK_F24 : 135,
		DOM_VK_NUM_LOCK : 144,
		DOM_VK_SCROLL_LOCK : 145,
		DOM_VK_COMMA : 188,
		DOM_VK_PERIOD : 190,
		DOM_VK_SLASH : 191,
		DOM_VK_BACK_QUOTE : 192,
		DOM_VK_OPEN_BRACKET : 219,
		DOM_VK_BACK_SLASH : 220,
		DOM_VK_CLOSE_BRACKET : 221,
		DOM_VK_QUOTE : 222,
		DOM_VK_META : 224
	};
}