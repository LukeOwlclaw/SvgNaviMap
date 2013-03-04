function affiliation_open() {
	"use strict";
	G.menu_current = 'affiliation';
	document.getElementById('affiliation').style.display = 'block';
	document.getElementById('affiliation_default').style.display = 'block';

	// handle clicking
	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].addEventListener('click', affiliation_click, false);
	}
}

function affiliation_click(evt) {
	"use strict";
	if (Vertex_current == null) { // no vertex selected yet

		if (Vertex_clickedID == null) { // not clicked on a vertex
			// alert('Please select a vertex.');
			// or do nothing
		} else { // clicked on a vertex
			affiliation_select(Vertex_clickedID);
		}
	} else { // a vertex is already selected
		// do nothing
	}

	Vertex_clickedID = null;
}

function affiliation_select(id) {
	"use strict";
	Vertex_current = Vertex_container.get(id);
	Vertex_current.paint_active();
	document.getElementById('affiliation_default').style.display = 'none';
	// load polygon
	Affiliation_currentPolygon = Vertex_current.getPolygon();

	if (Affiliation_currentPolygon == null) { // show add menu
		document.getElementById('affiliation_details_add').style.display = 'block';
	} else { // show edit menu
		document.getElementById('affiliation_details_renew').style.display = 'block';
		Affiliation_currentPolygon.color_active();
	}
}

function affiliation_deselect() {
	"use strict";
	if (Vertex_current != null) {
		Vertex_current.paint();
		if (Affiliation_currentPolygon != null) {
			Affiliation_currentPolygon.color();
			Affiliation_currentPolygon = null;
		}
		Vertex_current = null;
	}

	document.getElementById('affiliation_details_add').style.display = 'none';
	document.getElementById('affiliation_details_renew').style.display = 'none';
	document.getElementById('affiliation_default').style.display = 'block';
}

function affiliation_delete() {
	"use strict";
	Vertex_current.getPolygon().remove();
	Vertex_current.setPolygon(null);
}

function affiliation_close() {
	"use strict";
	affiliation_area_normalize();
	affiliation_resetAdd();
	affiliation_deselect();

	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].removeEventListener('click', affiliation_click, false);
	}

	document.getElementById('affiliation_default').style.display = 'none';
	document.getElementById('affiliation').style.display = 'none';
	G.menu_current = null;
}

function affiliation_add() {
	"use strict";
	document.getElementById('affiliation_add').style.display = 'block';
	document.getElementById('affiliation_details_add').style.display = 'none';

	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].removeEventListener('click', affiliation_click, false);
	}
	G.svg_element[Vertex_current.getSvgid()].addEventListener('click',
			affiliation_addClick, false);
	Affiliation_borderPointClickedID = null;
}

function affiliation_renew() {
	"use strict";
	// delete old allitiation area
	Affiliation_currentPolygon.remove();
	Affiliation_currentPolygon = null;
	Vertex_current.setPolygon(null);

	document.getElementById('affiliation_add').style.display = 'block';
	document.getElementById('affiliation_details_renew').style.display = 'none';

	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].removeEventListener('click', affiliation_click, false);
	}
	G.svg_element[Vertex_current.getSvgid()].addEventListener('click',
			affiliation_addClick, false);
	Affiliation_borderPointClickedID = null;
}

function affiliation_resetAdd() {
	"use strict";
	document.getElementById('affiliation_add').style.display = 'none';

	if (Vertex_current != null)
		G.svg_element[Vertex_current.getSvgid()].removeEventListener('click',
				affiliation_addClick, false);

	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].addEventListener('click', affiliation_click, false);
	}

	if (Affiliation_currentPolygon != null
			&& !Affiliation_currentPolygon.isClosed()) {
		Affiliation_currentPolygon.remove();
		Affiliation_currentPolygon = null;
		Vertex_current.setPolygon(null);
	}
	if (Affiliation_currentPolygon == null) {
		document.getElementById('affiliation_details_add').style.display = 'block';
	} else {
		document.getElementById('affiliation_details_renew').style.display = 'block';
	}
}

function affiliation_addClick(evt) {
	"use strict";
	var posX = MZP.translateX(evt);
	var posY = MZP.translateY(evt);
	var svgid = G.getSvgId(evt);

	if (Affiliation_currentPolygon == null)
		Affiliation_currentPolygon = new Polygon();
	Affiliation_currentPolygon.add_pos(posX, posY, svgid);
	if (Affiliation_currentPolygon.isClosed()) {
		alert('polygon closed.');
		document.getElementById('affiliation_add').style.display = 'none';
		document.getElementById('affiliation_details_renew').style.display = 'block';

		G.svg_element[Vertex_current.getSvgid()].removeEventListener('click',
				affiliation_addClick, false);

		for ( var i = 0; i < G.svg_element.length; i++) {
			G.svg_element[i]
					.addEventListener('click', affiliation_click, false);
		}

		Vertex_current.setPolygon(Affiliation_currentPolygon);

		// test if vertex is in affiliation area
		if (!isPositionInPolygon(Vertex_current.getX(), Vertex_current.getY(),
				Affiliation_currentPolygon))
			alert('Your affiliation area does not contain your selected vertex.');

	}
}

function affiliation_test() {
	"use strict";
	if (document.getElementById('affiliation_test').innerHTML == "Test affiliation areas")
		affiliation_area_highlight();
	else
		affiliation_area_normalize();

}

function affiliation_area_highlight() {
	"use strict";
	for ( var i = 0; i < G.svg_element.length; i++) {
		var unit_affiliation_area = document.createElementNS(
				'http://www.w3.org/2000/svg', 'g');
		unit_affiliation_area.setAttribute('id', 'unit_affiliation_area');
		G.svg_unit_tuhh[i].appendChild(unit_affiliation_area);
		G.svg_unit_affiliation_area[i] = G.svg_element[i]
				.getElementById('unit_affiliation_area');
	}

	var vertexarray = Vertex_container.getAll();
	for ( var i = 0; i < vertexarray.length; i++) {
		var v = vertexarray[i];
		var p = v.getPolygon();
		if (p == null)
			continue;

		var points = "";

		var borderpoints = p.getBorderPoints();
		for ( var j = 0, bp = borderpoints[j]; j < borderpoints.length; bp = borderpoints[++j]) {
			points += bp.getX() + ',' + bp.getY() + ' ';
		}

		// <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
		// <polygon points="200,10 250,190 160,210"
		// style="fill:lime;stroke:purple;stroke-width:1"/>
		// </svg>
		var shape = document.createElementNS('http://www.w3.org/2000/svg',
				'polygon');
		shape.setAttribute('id', 'affiliation_area' + i);
		shape.setAttribute('points', points);

		G.svg_unit_affiliation_area[v.getSvgid()].appendChild(shape);
	}

	document.getElementById('affiliation_test').innerHTML = "End test";
}

function affiliation_area_normalize() {
	"use strict";
	for ( var i = 0; i < G.svg_element.length; i++) {
		if (G.svg_unit_affiliation_area[i] != null) {
			G.svg_unit_tuhh[i].removeChild(G.svg_unit_affiliation_area[i]);
			G.svg_unit_affiliation_area[i] = null;
		}
	}

	document.getElementById('affiliation_test').innerHTML = "Test affiliation areas";
}