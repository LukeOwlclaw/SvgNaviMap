//svg_init_custom() is called after SVG are loaded completely.
function svg_init_custom() {
	"use strict";

	// set visibilities
	for ( var i = 0; i < G.svg_element.length; i++) {
		if (G.svg_element[i] == undefined || G.svg_element[i] == null) {
			G.log("svg_init_custom() failed. svg_element " + i + " not ready yet");
			return;
		}

		//G.svg_element[i].getElementById('unit_vertex').setAttribute('visibility', 'hidden');

		//G.svg_element[i].getElementById('unit_edge').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_borderpoint').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_borderline').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_stepmarker').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_gpsmarker').setAttribute('visibility', 'hidden');
	}

	// set size of svg images (required for correct panning NOT FOR ANDROID!)
	// calcSvgSize();

	// set default level
	selectsvg(0);

	send_response("svg_init_custom completed");
}

// to be called after svgnavimap is ready to load svg
function init_custom() {
	"use strict";

	G.showButtonsForSvg = false;

	// load data
	//load_from_server_xml(null);
	var xml = svgapp.getProjectXML();
	if (xml) {
		console.log("importing xml");
		load_from_string(xml);
	} else {
		console.warn("project xml not found");
	}

	send_response("init_custom completed");
}

function selectsvg(svgid) {
	"use strict";

	calcSvgSize();

	if (svgid == null || G.svg_parent[svgid] == undefined) {
		alert('Invalid svg level ' + svgid + ' selected.');
		return;
	}

	for ( var i = 0; i < G.svg_parent.length; i++) {
		G.svg_parent[i].style.display = 'none';
	}

	for ( var i = 0; i < G.svg_parent.length; i++) {
		if (i == svgid) {
			G.svg_parent[i].style.display = 'block';
		} else {
			G.svg_parent[i].style.display = 'none';
		}
	}
}

function calcSvgSize() {
	var ViewX = "0";
	var ViewY = "0";
	if (self.innerHeight && self.outerHeight) {
		if (self.innerHeight > self.outerHeight) {
			ViewX = self.innerWidth;
			ViewY = self.innerHeight;
		} else {
			ViewX = self.outerWidth;
			ViewY = self.outerHeight;
		}
	} else if (self.outerHeight) {
		ViewX = self.outerWidth;
		ViewY = self.outerHeight;
	} else if (self.innerHeight) {
		ViewX = self.innerWidth;
		ViewY = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) {
		ViewX = document.documentElement.clientWidth;
		ViewY = document.documentElement.clientHeight;
	} else if (document.body) {
		ViewX = document.body.clientWidth;
		ViewY = document.body.clientHeight;
	} else {
		alert('Can not estimate screen resolution!');
		ViewX = null;
		ViewY = null;
	}

	G.log("+++++ calc svg size: " + self.innerWidth + " x " + self.innerHeight + "; " + self.outerWidth + " x "
			+ self.outerHeight + "; " + document.documentElement.clientWidth + " x "
			+ document.documentElement.clientHeight + "; " + document.body.clientWidth + " x "
			+ document.body.clientHeight + "; " + screen.width + " x " + screen.height + "; "
			+ document.body.offsetWidth + " x " + document.body.offsetHeight + "; " + document.body.scrollwidth + " x "
			+ document.body.scrollheight + "; ");

	if (ViewX != null && ViewY != null) {
		for ( var i = 0; i < G.svg_parent.length; i++) {
			// console.log('would set size of id ' + i);
			G.svg_parent[i].style.width = ViewX * 97 / 100 + "px";
			G.svg_parent[i].style.height = ViewY * 97 / 100 + "px";
		}
	}
}

function mlog(s) {
	"use strict";

	if (document.getElementById('log')) {
		document.getElementById('log').innerHTML = s + "<br>" + document.getElementById('log').innerHTML;
	}
}

function clearlog() {
	"use strict";

	if (document.getElementById('log'))
		document.getElementById('log').innerHTML = "log20";
}