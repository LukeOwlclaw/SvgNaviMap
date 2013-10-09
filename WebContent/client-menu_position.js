function position_menuRefresh() {
	"use strict";
	if (document.getElementById('position_set_add').innerHTML == 'Set position') {
		document.getElementById('position_set_add').innerHTML = 'Abort';
		document.getElementById('position_set_reset').innerHTML = 'Abort';

		if (Client_event_clickRouting)
			for ( var i = 0; i < G.svg_element.length; i++) {
				G.svg_element[i].removeEventListener('click', routing_click,
						false);
			}

		for ( var i = 0; i < G.svg_element.length; i++) {
			G.svg_element[i].addEventListener('click', position_click, false);
		}
	} else {
		document.getElementById('position_set_add').innerHTML = 'Set position';
		document.getElementById('position_set_reset').innerHTML = 'Set position';

		for ( var i = 0; i < G.svg_element.length; i++) {
			G.svg_element[i]
					.removeEventListener('click', position_click, false);
		}

		if (Client_event_clickRouting)
			for ( var i = 0; i < G.svg_element.length; i++) {
				G.svg_element[i]
						.addEventListener('click', routing_click, false);
			}
	}

}

function position_delete() {
	"use strict";
	if (currPositionPoint != null) {
		currPositionPoint.remove();
		currPositionPoint = null;
		refresh_location();
		if (typeof (svgapp) == "undefined") {
			document.getElementById('position_NOTexists').style.display = 'block';
			document.getElementById('position_exists').style.display = 'none';
		}
	}
}

function position_set(svgid, posX, posY)
{
	if (currPositionPoint == null) {
		currPositionPoint = new PositionPoint(svgid, posX, posY);
		if (typeof (svgapp) == "undefined") {
			document.getElementById('position_NOTexists').style.display = 'none';
			document.getElementById('position_exists').style.display = '';
		}
	} else
		currPositionPoint.setPosition(svgid, posX, posY);

	if (typeof (svgapp) != "undefined") {
		svgapp.instruct('position_is_set');
		var position = Interface
				.position_translate_svg_gps(currPositionPoint.getX(),
						currPositionPoint.getY(), currPositionPoint.getSvgid());
		send_returnvalue("position", "{ \"xpos\": \"" + position[0]
				+ "\", \"ypos\": \"" + position[1] + "\", \"svgid\": \""
				+ position[2] + "\"}");

	} else
		position_menuRefresh();

	refresh_location();
}

function position_click(evt) {
	"use strict";
	var posX = MZP.translateX(evt);
	var posY = MZP.translateY(evt);
	var svgid = G.getSvgId(evt);
	position_set(svgid, posX, posY)
}

function refresh_location() {
	"use strict";
	if (currLocation != null)
		currLocation.paint();

	var htmlHeader = '<b>Location</b>:<br><br>';
	if (currPositionPoint == null) {
		if (typeof (svgapp) != "undefined")
			svgapp.instruct('position_please_set');
		else
			document.getElementById('location').innerHTML = htmlHeader
					+ 'Please set your position.';

		currLocation = null;
		routing_refresh();
		return;
	}

	var vertexarray = Vertex_container.getAll();
	for ( var i = 0, v = vertexarray[i]; i < vertexarray.length; v = vertexarray[++i]) {
		if (v.getPolygon() == null)
			continue;
		if (v.getSvgid() != currPositionPoint.getSvgid())
			continue;

		if (isPositionInPolygon(currPositionPoint.getX(), currPositionPoint
				.getY(), v.getPolygon())) {

			// do not create a new route, if stayed at same location
			var new_route = false;
			if (currLocation == null || v.getId() != currLocation.getId())
				new_route = true;

			currLocation = v;
			currLocation.paint_active();
			if (typeof (svgapp) != "undefined")
				svgapp.instruct('position:' + v.getShortDesc() + ':'
						+ v.getLongDesc());
			else
				document.getElementById('location').innerHTML = htmlHeader
						+ 'You are at \'' + v.getShortDesc()
						+ '\'.<br>Details: ' + v.getLongDesc() + '<br>Id: '
						+ v.getId() + '.<br><br>Svgid: ' + v.getSvgid() + '.';

			if (new_route)
				routing_refresh();

			return;
		}
	}

	if (typeof (svgapp) == "undefined")
		document.getElementById('location').innerHTML = htmlHeader
				+ 'unknown location<br><br>Svgid: '
				+ currPositionPoint.getSvgid() + '.';

	currLocation = null;
	routing_refresh();
}
