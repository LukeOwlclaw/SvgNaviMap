function vertices_hide() {
	set_for_all('unit_vertex', 'visibility', 'hidden');
}

function vertices_show() {
	set_for_all('unit_vertex', 'visibility', 'visible');
}

function visibility_vertex() {
	"use strict";
	var button = document.getElementById('visibility_vertex');
	if (button.checked) {
		for ( var i = 0; i < G.svg_element.length; i++) {
			G.svg_element[i].getElementById('unit_vertex').setAttribute(
					'visibility', 'visible');
		}
	} else {
		for ( var i = 0; i < G.svg_element.length; i++) {
			G.svg_element[i].getElementById('unit_vertex').setAttribute(
					'visibility', 'hidden');
		}
	}
}

function edges_hide() {
	set_for_all('unit_edge', 'visibility', 'hidden');
}

function edges_show() {
	set_for_all('unit_edge', 'visibility', 'visible');
}

function visibility_edge() {
	"use strict";
	var button = document.getElementById('visibility_edge');
	if (button.checked) {
		edges_show();
	} else {
		edges_hide();
	}
}

function edgemarkers_hide() {
	set_for_all('Triangle-start', 'visibility', 'hidden');
	set_for_all('Triangle-end', 'visibility', 'hidden');
	set_for_all('unit_stepmarker', 'visibility', 'hidden');
}

function edgemarkers_show() {
	set_for_all('Triangle-start', 'visibility', 'visible');
	set_for_all('Triangle-end', 'visibility', 'visible');
	set_for_all('unit_stepmarker', 'visibility', 'visible');
}

function visibility_edgemarker() {
	"use strict";
	var button = document.getElementById('visibility_edgemarker');
	if (button.checked) {
		edgemarkers_show();
	} else {
		edgemarkers_hide();
	}
}

function set_for_all(id, attribute, status) {
	for ( var i = 0; i < G.svg_element.length; i++) {
		if (G.svg_element[i].getElementById(id) != null)
			G.svg_element[i].getElementById(id).setAttribute(attribute, status);
	}
}
function borderpoints_hide() {
	set_for_all('unit_borderpoint', 'visibility', 'hidden');
}
function borderpoints_show() {
	set_for_all('unit_borderpoint', 'visibility', 'visible');
}
function visibility_borderpoint() {
	"use strict";
	var button = document.getElementById('visibility_borderpoint');
	if (button.checked) {
		borderpoints_show();
	} else {
		borderpoints_hide();
	}
}

function borderlines_hide() {
	set_for_all('unit_borderline', 'visibility', 'hidden');
}
function borderlines_show() {
	set_for_all('unit_borderline', 'visibility', 'visible');
}

function visibility_borderline() {
	"use strict";
	var button = document.getElementById('visibility_borderline');
	if (button.checked) {
		borderlines_show();
	} else {
		borderlines_hide();
	}
}

function bordergpsmarkers_hide() {
	set_for_all('unit_gpsmarker', 'visibility', 'hidden');
}
function bordergpsmarkers_show() {
	set_for_all('unit_gpsmarker', 'visibility', 'visible');
}

function visibility_gpsmarker() {
	"use strict";
	var button = document.getElementById('visibility_gpsmarker');
	if (button.checked) {
		bordergpsmarkers_show();
	} else {
		bordergpsmarkers_hide();
	}
}

function all_overlay_hide() {
	bordergpsmarkers_hide();
	borderlines_hide();
	borderpoints_hide();
	edgemarkers_hide();
	edges_hide();
	vertices_hide();
}
