function routing_open() {
	"use strict";
	G.menu_current = 'routing';
	Vertex_clickedID = null;

	document.getElementById('routing').style.display = 'block';
	routing_refresh_menu();
}

function routing_close() {
	"use strict";
	G.menu_current = null;
	routing_purge();

	document.getElementById('routing').style.display = 'none';

	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].removeEventListener('click', routing_click, false);
	}
	Client_event_clickRouting = false;
}

function routing_purge() {
	"use strict";
	routing_remove();

	if (Routing_destination != null) {
		Routing_destination.paint();
		Routing_destination = null;
		Routing_disabledAdapted = null;
	}

	if (currLocation != null) {
		for ( var i = 0; i < G.svg_element.length; i++) {
			G.svg_element[i].addEventListener('click', routing_click, false);
		}
		Client_event_clickRouting = true;
	}
}

function routing_remove() {
	"use strict";
	document.getElementById('routing_current').style.display = 'none';
	document.getElementById('routing_default').style.display = 'block';

	while (DijkstraArrows.length > 0) {
		(DijkstraArrows.shift()).remove();
	}
}

function routing_click(evt) {
	"use strict";
	if (Vertex_clickedID == null)
		return;
	// TODO match aff areas

	Routing_destination = Vertex_container.get(Vertex_clickedID);
	Vertex_clickedID = null;
	Routing_destination.paint_destination();

	routing_refresh();

	// hide vertices
	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].getElementById('unit_vertex').setAttribute('visibility', 'hidden');
	}
}

function routing_refresh_menu() {
	"use strict";
	// G.log('refresh routing menu: ' + currPositionPoint + ' : '
	// + currLocation);
	if (currPositionPoint == null) {
		document.getElementById('routing_default').innerHTML = 'Please set your position first.';
	} else if (currLocation == null) {
		document.getElementById('routing_default').innerHTML = 'Please set your position to a known location.';
	} else {
		document.getElementById('routing_default').innerHTML = 'Please click on your destination.';

		// make vertices visible
		for ( var i = 0; i < G.svg_element.length; i++) {
			G.svg_element[i].getElementById('unit_vertex').setAttribute('visibility', 'visible');
		}
		for ( var i = 0; i < G.svg_element.length; i++) {
			G.svg_element[i].addEventListener('click', routing_click, false);
		}
		Client_event_clickRouting = true;
	}
}

function routing_refresh() {
	"use strict";
	if (G.menu_current != 'routing')
		return;

	routing_remove();
	routing_refresh_menu();

	if (Routing_destination == null || currLocation == null) {
		return;
	}

	G.log('Refresh route to ' + Routing_destination.getId());

	var route_da = document.getElementById('routing_disabledAdapted').checked;

	if (try_preRouting(currLocation, Routing_destination, route_da)
			|| dijkstra_reverse(currLocation, Routing_destination, route_da, true)) {

		Routing_disabledAdapted = route_da;
		document.getElementById('routing_default').style.display = 'none';
		document.getElementById('routing_current').style.display = 'block';
		for ( var i = 0; i < G.svg_element.length; i++) {
			G.svg_element[i].removeEventListener('click', routing_click, false);
		}
		Client_event_clickRouting = false;

		client_selectsvg(currLocation.getSvgid());
	}
}
