//to be called after svg finished loading
function init_custom() {
	"use strict";

	// set visibilities
	for ( var i = 0; i < G.svg_element.length; i++) {
		if (G.svg_element[i] == undefined || G.svg_element[i] == null) {
			G.log("android_init() failed. svg_element " + i + " not ready yet");
			return;
		}

		G.svg_element[i].getElementById('unit_edge').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_borderpoint').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_borderline').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_stepmarker').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_gpsmarker').setAttribute('visibility', 'hidden');
	}

	// set size of svg images
	calcSvgSize();

	// set deafult level
	selectsvg(0);

	// load data
	load_from_server_xml(null);

	send_response("init completed");
}

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

function selectsvg(svgid) {
	"use strict";
	if (svgid == null || G.svg_parent[svgid] == undefined) {
		// alert('Invalid svg level ' + svgid + ' selected.');
		return;
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

	console.log("calc svg size: " + self.innerWidth + " x " + self.innerHeight + "; " + self.outerWidth + " x "
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