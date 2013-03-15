//svg_init_custom() is called after SVG are loaded completely.
function svg_init_custom() {
	G.loadMapSelectors();
	client_selectsvg(0);
}

//called on load of page
function init_custom() {
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

	showButtonsForSvg = false;
	load_from_server_xml(null, "minimal-data.xml");
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
			G.svg_parent[i].parentNode.style.display = '';
			radios[i].checked = true;
		} else {
			G.svg_parent[i].parentNode.style.display = 'none';
			radios[i].checked = false;
		}
	}

}

function hideShowControls() {

	var map = document.getElementById("sideLeft");
	var container = document.getElementById("content");

	if (typeof map !== 'undefined') {
		if (map.style.visibility != "hidden") {
			map.style.visibility = "hidden";
			container.style.paddingLeft = 0;

			var elements = document.getElementsByClassName('mapdiv');
			for ( var i in elements) {
				if (elements.hasOwnProperty(i)) {
					if (elements[i].style != undefined) {
						elements[i].style.width = '85%';
						elements[i].style.height = '900px';
					}
				}
			}

		} else {
			map.style.visibility = "";
			container.style.paddingLeft = "300px"
			var elements = document.getElementsByClassName('mapdiv');
			for ( var i in elements) {
				if (elements.hasOwnProperty(i)) {
					if (elements[i].style != undefined) {
						elements[i].style.width = '95%';
						elements[i].style.height = '';
					}
				}
			}
		}
	} else
		G.log("sideLeft undefined!");

}