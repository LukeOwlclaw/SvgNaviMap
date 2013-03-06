function edge_open() {
	"use strict";
	G.menu_current = 'edge';
	Edge_clickedID = null;
	Edge_current = null;
	Edge_firstvertex = null;
	Stepmarker_backup1_x = null;
	Stepmarker_backup1_y = null;
	Stepmarker_backup2_x = null;
	Stepmarker_backup2_y = null;
	document.getElementById('edge').style.display = 'block';
	document.getElementById('edge_default').style.display = 'block';

	// handle clicking
	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_document[i].addEventListener('click', edge_click, false);
	}
}

function edge_click(evt) {
	"use strict";
	// if currently edge is selected , do nothing
	if (Edge_current != null) {
		Edge_clickedID = null;
		Vertex_clickedID = null;
		return;
	}

	// add edge if no edge selected and not clicked on edge
	if (Vertex_clickedID != null) {
		// first vertex
		if (Edge_firstvertex == null) {
			Edge_firstvertex = Vertex_container.get(Vertex_clickedID);
			document.getElementById('edge_default').style.display = 'none';
			document.getElementById('edge_add').style.display = 'block';
			// mark firstvertex
			Edge_firstvertex.paint_active();
		} else {// second vertex
			// test for edge loop
			if (Vertex_clickedID == Edge_firstvertex.getId()) {
				alert('Loop edges are not allowed!');
				Edge_clickedID = null;
				Vertex_clickedID = null;
				return;
			}
			// test if there is already an edge between this vertexes
			var edgelist = Edge_firstvertex.getEdgelist();
			for ( var i = 0, e = edgelist[i]; i < edgelist.length; e = edgelist[++i]) {
				if (e.getVertex1().getId() == Vertex_clickedID
						|| e.getVertex2().getId() == Vertex_clickedID) {
					alert('It exists allready an edge between this vertexes!');
					Edge_clickedID = null;
					Vertex_clickedID = null;
					return;
				}
			}

			var edge_id = Edge_container.getUnusedId();
			var edge = new Edge(edge_id, Edge_firstvertex, Vertex_container
					.get(Vertex_clickedID), true, true);
			// unmark first vertex and second vertex
			Edge_firstvertex.paint();
			Vertex_container.get(Vertex_clickedID).paint();
			Edge_firstvertex = null;
			Edge_current = edge;
			document.getElementById('edge_add').style.display = 'none';

			// if ctrl and alt pressed, start new edge with last vertex
			// of current edge
			if (evt.ctrlKey && evt.altKey) {
				Edge_current = null;
				Edge_firstvertex = Vertex_container.get(Vertex_clickedID);
				document.getElementById('edge_add').style.display = 'block';
				// mark firstvertex
				Edge_firstvertex.paint_active();
			} else if (evt.ctrlKey) { // if ctrl pressed do not show edge
				// details
				Edge_current = null;
				document.getElementById('edge_default').style.display = 'block';
			} else {
				// set details
				edge_select(Edge_current);
			}
		}
	} else if (Edge_clickedID != null && Edge_firstvertex == null) {
		// select edge if clicked on edge and no first vertex was selected
		edge_select(Edge_container.get(Edge_clickedID));
	}
	Edge_clickedID = null;
	Vertex_clickedID = null;
}

function edge_movemarker_mousedown(evt) {
	"use strict";
	// G.log('down');
	if (Stepmarker_clickedID != null) {
		G.svg_element[Edge_current.getVertex1().getSvgid()]
				.removeEventListener('mousemove', MZP.mouseMove);
		G.svg_element[Edge_current.getVertex2().getSvgid()]
				.removeEventListener('mousemove', MZP.mouseMove);
		G.svg_document[Edge_current.getVertex1().getSvgid()].addEventListener(
				'mousemove', edge_movemarker_mousemove, false);
		G.svg_document[Edge_current.getVertex2().getSvgid()].addEventListener(
				'mousemove', edge_movemarker_mousemove, false);
	}
}

function edge_movemarker_mousemove(evt) {
	"use strict";
	// G.log('move');
	Stepmarker_container.get(Stepmarker_clickedID).setPosition(
			MZP.translateX(evt), MZP.translateY(evt));
}

function edge_movemarker_mouseup(evt) {
	"use strict";
	// G.log('up');
	G.svg_document[Edge_current.getVertex1().getSvgid()].removeEventListener(
			'mousemove', edge_movemarker_mousemove, false);
	G.svg_document[Edge_current.getVertex2().getSvgid()].removeEventListener(
			'mousemove', edge_movemarker_mousemove, false);
	G.svg_element[Edge_current.getVertex1().getSvgid()].addEventListener(
			'mousemove', MZP.mouseMove);
	G.svg_element[Edge_current.getVertex2().getSvgid()].addEventListener(
			'mousemove', MZP.mouseMove);
	Stepmarker_clickedID = null;
}

function edge_select(edge) {
	"use strict";
	Edge_current = edge;
	if (Edge_current.getVertex1_stepmarker() != null) {
		Stepmarker_backup1_x = Edge_current.getVertex1_stepmarker().getX();
		Stepmarker_backup1_y = Edge_current.getVertex1_stepmarker().getY();
	}
	if (Edge_current.getVertex2_stepmarker() != null) {
		Stepmarker_backup2_x = Edge_current.getVertex2_stepmarker().getX();
		Stepmarker_backup2_y = Edge_current.getVertex2_stepmarker().getY();
	}
	document.getElementById('edge_default').style.display = 'none';
	document.getElementById('edge_details').style.display = 'block';
	document.getElementById('edge_route1').checked = edge
			.getVertex1_reachable();
	document.getElementById('edge_route2').checked = edge
			.getVertex2_reachable();
	document.getElementById('edge_distancefactor').value = edge
			.getDistanceFactor();
	document.getElementById('edge_disabledAdapted').checked = edge
			.getDisabledAdapted();
	edge.paint_active();

	// handle clicking
	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_document[i].removeEventListener('click', edge_click, false);
	}

	// activate stepmarker moving
	G.svg_document[Edge_current.getVertex1().getSvgid()].addEventListener(
			'mousedown', edge_movemarker_mousedown, false);
	G.svg_document[Edge_current.getVertex1().getSvgid()].addEventListener(
			'mouseup', edge_movemarker_mouseup, false);
	G.svg_document[Edge_current.getVertex2().getSvgid()].addEventListener(
			'mousedown', edge_movemarker_mousedown, false);
	G.svg_document[Edge_current.getVertex2().getSvgid()].addEventListener(
			'mouseup', edge_movemarker_mouseup, false);
}

function edge_close() {
	"use strict";
	edge_resetAdd();
	edge_deselect();
	G.menu_current = null;
	document.getElementById('edge_default').style.display = 'none';
	document.getElementById('edge').style.display = 'none';

	// handle clicking
	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_document[i].removeEventListener('click', edge_click, false);
	}
}

function edge_save() {
	"use strict";
	// do not save edge, if no route enabled
	if (!document.getElementById('edge_route1').checked
			&& !document.getElementById('edge_route2').checked) {
		alert('You must enabled at least one route for a edge!');
		return;
	}

	Stepmarker_backup1_x = null;
	Stepmarker_backup1_y = null;
	Stepmarker_backup2_x = null;
	Stepmarker_backup2_y = null;

	Edge_current
			.setVertex1_reachable(document.getElementById('edge_route1').checked);
	Edge_current
			.setVertex2_reachable(document.getElementById('edge_route2').checked);

	var distanceFactor = document.getElementById('edge_distancefactor').value;
	distanceFactor = parseFloat(distanceFactor);
	if (!isNaN(distanceFactor)) {
		Edge_current.setDistanceFactor(distanceFactor);
	}
	Edge_current.setDisabledAdapted(document
			.getElementById('edge_disabledAdapted').checked);
	edge_deselect();
}

function edge_deselect() {
	"use strict";
	if (Stepmarker_backup1_x != null && Stepmarker_backup1_y != null) {
    if(Edge_current != null)
      Edge_current.getVertex1_stepmarker().setPosition(Stepmarker_backup1_x,
          Stepmarker_backup1_y);
		Stepmarker_backup1_x = null;
		Stepmarker_backup1_y = null;

	}
	if (Stepmarker_backup2_x != null && Stepmarker_backup2_y != null) {
    if(Edge_current != null)
      Edge_current.getVertex2_stepmarker().setPosition(Stepmarker_backup2_x,
          Stepmarker_backup2_y);
		Stepmarker_backup2_x = null;
		Stepmarker_backup2_y = null;
	}
	if (Edge_current != null) {
		Edge_current.paint();
		Edge_current.drawMarkers(Edge_current.getVertex1_reachable(),
				Edge_current.getVertex2_reachable());
		Edge_current.drawDisabledAdapted(Edge_current.getDisabledAdapted());
	}
	Edge_current = null;
	document.getElementById('edge_details').style.display = 'none';
	document.getElementById('edge_default').style.display = 'block';

	// handle clicking
	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_document[i].addEventListener('click', edge_click, false);
		// activate stepmarker moving
		G.svg_document[i].removeEventListener('mousedown',
				edge_movemarker_mousedown, false);
		G.svg_document[i].removeEventListener('mousemove',
				edge_movemarker_mousemove, false);
		G.svg_document[i].removeEventListener('mouseup',
				edge_movemarker_mouseup, false);
	}
}
function edge_delete() {
	"use strict";
	Edge_current.remove();
	Edge_current = null;
	edge_deselect();
}
function edge_changeRoute() {
	"use strict";
	Edge_current.drawMarkers(document.getElementById('edge_route1').checked,
			document.getElementById('edge_route2').checked);
}
function edge_resetAdd() {
	"use strict";
	document.getElementById('edge_add').style.display = 'none';
	document.getElementById('edge_default').style.display = 'block';
	if (Edge_firstvertex != null) {
		Edge_firstvertex.paint();
		Edge_firstvertex = null;
	}
}

function edge_changeDisabledAdapted() {
	"use strict";
	Edge_current.drawDisabledAdapted(document
			.getElementById('edge_disabledAdapted').checked);
}
