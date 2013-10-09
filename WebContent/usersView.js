//svg_init_custom() is called after SVG are loaded completely.
function svg_init_custom() {
	G.loadMapSelectors();
	client_selectsvg(0);
}

// called on load of page
function init_custom() {
	"use strict";

	refresh_location();

	for ( var i = 0; i < G.svg_element.length; i++) {
		if (G.svg_element[i] == undefined || G.svg_element[i] == null) {
			G.log("client_init() failed. svg_element " + i + " not ready yet");
			return;
		}

		G.svg_element[i].getElementById('unit_edge').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_borderpoint').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_borderline').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_stepmarker').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_gpsmarker').setAttribute('visibility', 'hidden');
	}

	showButtonsForSvg = false;
	load_from_server_xml(null);
}

function client_selectsvg(svgid) {
	"use strict";
	if (svgid == null || G.svg_parent[svgid] == undefined) {
		alert('Invalid svg level ' + svgid + ' selected.');
		return;
	}

	var radios = document.getElementById('svgselection').getElementsByTagName('input');

	for ( var i = 0; i < G.svg_parent.length; i++) {
		if (i == svgid) {
			G.svg_parent[i].parentNode.style.display = '';
			radios[i].checked = true;
		} else {
			G.svg_parent[i].parentNode.style.display = 'none';
			radios[i].checked = false;
		}
	}

}