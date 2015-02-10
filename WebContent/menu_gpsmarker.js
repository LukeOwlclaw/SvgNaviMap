function gpsmarker_open() {
	"use strict";
	G.menu_current = 'gpsmarker';
	document.getElementById('gpsmarker').style.display = 'block';
	document.getElementById('gpsmarker_default').style.display = 'block';

	for ( var i = 0; i < G.svg_element.length; i++) {
		// handle clicking
		G.svg_element[i].addEventListener('click', gpsmarker_click, false);
	}
}

function gpsmarker_click(evt) {
	"use strict";
	var posX = MZP.translateX(evt);
	var posY = MZP.translateY(evt);
	var svgid = G.getSvgId(evt);

	// add, if no gpsmarker yet selected
	if (Gpsmarker_clickedID == null && Gpsmarker_current == null) {
		// check for too close gpsmarkers
		var gpsmarkerarray = Gpsmarker_container.getAll();
		for ( var i = 0, g = gpsmarkerarray[i]; i < gpsmarkerarray.length; g = gpsmarkerarray[++i]) {
			// only check in same level
			if (g.getSvgid() != svgid)
				continue;

			var distance = parseInt(Math.sqrt(Math.pow(g.getX() - posX, 2)
					+ Math.pow(g.getY() - posY, 2)), 10);
			if (distance < G.vertex_minDistance) {
				alert('This site is too near to an existing gpsmarker!');
				Gpsmarker_clickedID = null;
				return;
			}
		}

		var gpsmarker_id = Gpsmarker_container.getUnusedId();
		var gpsmarker = new Gpsmarker(gpsmarker_id, svgid, posX, posY);
		Gpsmarker_current = gpsmarker;

		// set details
		gpsmarker_select(Gpsmarker_current);

	} else {
		if (Gpsmarker_move_enabled) { // move gpsmarker
			// check for same svg id
			if (svgid != Gpsmarker_current.getSvgid()) {
				alert('You must not move a gpsmarker to a different svg image.');
				Gpsmarker_clickedID = null;
				return;
			}
			// check for too close gpsmarkers
			var gpsmarkerarray = Gpsmarker_container.getAll();
			for ( var i = 0, g = gpsmarkerarray[i]; i < gpsmarkerarray.length; g = gpsmarkerarray[++i]) {
				// only check in same level
				if (g.getSvgid() != Gpsmarker_current.getSvgid())
					continue;

				// ignore gpsmarker itselfe
				if (g.getId() == Gpsmarker_current.getId())
					continue;

				var distance = parseInt(Math.sqrt(Math.pow(g.getX() - posX, 2)
						+ Math.pow(g.getY() - posY, 2)), 10);
				if (distance < G.vertex_minDistance) {
					alert('This site is too near to an existing gpsmarker!');
					Gpsmarker_clickedID = null;
					return;
				}
			}
			Gpsmarker_current.setXY(posX, posY);
		} else { // select gpsmarker
			if (document.getElementById('gpsmarker_details').style.display != 'block') {
				// update details
				gpsmarker_select(Gpsmarker_container.get(Gpsmarker_clickedID));
			}
		}
	}
	Gpsmarker_clickedID = null;
}

function gpsmarker_save() {
	"use strict";
	Gpsmarker_current.setLatitude(parseFloat(document
			.getElementById('gpsmarker_latitude').value));
	Gpsmarker_current.setLongitude(parseFloat(document
			.getElementById('gpsmarker_longitude').value));
	gpsmarker_deselect();
}

function gpsmarker_select(gpsmarker) {
	"use strict";
	Gpsmarker_current = gpsmarker;
	document.getElementById('gpsmarker_default').style.display = 'none';
	document.getElementById('gpsmarker_details').style.display = 'block';
	document.getElementById('gpsmarker_latitude').value = Gpsmarker_current
			.getLatitude();
	document.getElementById('gpsmarker_longitude').value = Gpsmarker_current
			.getLongitude();
	Gpsmarker_current.paint_active();

	if (typeof (document.getElementById("mapitems")) !== 'undefined') {
		if_map_setCoordinate(Gpsmarker_current.getLatitude(), Gpsmarker_current
				.getLongitude());
	} else {
		G.log("mapitems undefined!");
	}
}

function gpsmarker_deselect() {
	"use strict";
	gpsmarker_move_off();
	if (Gpsmarker_current != null) {
		Gpsmarker_current.paint();
		Gpsmarker_current = null;
	}

	document.getElementById('gpsmarker_details').style.display = 'none';
	document.getElementById('gpsmarker_default').style.display = 'block';
}

function gpsmarker_delete() {
	"use strict";
	Gpsmarker_current.remove();
	Gpsmarker_current = null;
	gpsmarker_deselect();
}

function gpsmarker_close() {
	"use strict";
	gpsmarker_deselect();
	G.menu_current = null;

	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].removeEventListener('click', gpsmarker_click, false);
	}

	document.getElementById('gpsmarker_default').style.display = 'none';
	document.getElementById('gpsmarker').style.display = 'none';
}

function gpsmarker_color() {
	"use strict";
	if (Gpsmarker_current != null) {
		Gpsmarker_current.getShape().setAttribute('fill', 'black');
	}
}

function gpsmarker_move_on() {
	"use strict";
	Gpsmarker_move_enabled = true;
	document.getElementById('gpsmarker_move_on').style.display = 'none';
	document.getElementById('gpsmarker_move_off').style.display = 'block';
}

function gpsmarker_move_off() {
	"use strict";
	Gpsmarker_move_enabled = false;
	document.getElementById('gpsmarker_move_on').style.display = 'block';
	document.getElementById('gpsmarker_move_off').style.display = 'none';
}

function gpsmarker_hideshowmap() {
	var map = document.getElementById("mapitems");
	if (typeof map !== 'undefined') {
		if (map.style.visibility == "visible") {
			map.style.position = "relative" //hidden with absolute suddenly just hides overlay icons
			map.style.visibility = "hidden";
		} else {
			map.style.position = "absolute"
			map.style.visibility = "visible";
		}
	} else
		G.log("mapitems undefined!");
}
