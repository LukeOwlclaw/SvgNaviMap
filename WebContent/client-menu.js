function menu(id) {
	"use strict";
	if (G.menu_current != null) {
		// if (G.menu_current != id) {
		// alert('You have to close the current menu before!');
		// }
		// close old menu
		switch (G.menu_current) {
		case 'routing':
			routing_close();
			break;
		case 'import':
			import_close();
			break;

		default:
			alert('default menu close');
			break;
		}
	}

	switch (id) {
	case 'routing':
		routing_open();
		break;
	case 'import':
		import_open();
		break;

	default:
		alert('default menu open');
		break;
	}
}

function client_init() {
	"use strict";

	refresh_location();

	for ( var i = 0; i < G.svg_element.length; i++) {
		if (G.svg_element[i] == undefined || G.svg_element[i] == null) {
			G.log("client_init() failed. svg_element " + i + " not ready yet");
			return;
		}

		G.svg_element[i].getElementById('unit_edge').setAttribute('visibility',
				'hidden');

		G.svg_element[i].getElementById('unit_borderpoint').setAttribute(
				'visibility', 'hidden');

		G.svg_element[i].getElementById('unit_borderline').setAttribute(
				'visibility', 'hidden');

		G.svg_element[i].getElementById('unit_stepmarker').setAttribute(
				'visibility', 'hidden');

		G.svg_element[i].getElementById('unit_gpsmarker').setAttribute(
				'visibility', 'hidden');
	}

	client_selectsvg(0);

	load_from_server_xml(null);
}

function client_selectsvg(svgid) {
	"use strict";
	if (svgid == null || G.svg_parent[svgid] == undefined) {
		alert('Invalid svg level ' + svgid + ' selected.');
		return;
	}

	var radios = document.getElementById('svgselection').getElementsByTagName(
			'input');

	for ( var i = 0; i < G.svg_parent.length; i++) {
		if (i == svgid) {
			G.svg_parent[i].style.display = 'block';
			radios[i].checked = true;
			document.getElementById('map' + i + '_rescale').style.display = 'block';
		} else {
			G.svg_parent[i].style.display = 'none';
			radios[i].checked = false;
			document.getElementById('map' + i + '_rescale').style.display = 'none';
		}
	}

}
