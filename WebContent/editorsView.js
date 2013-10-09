//each view using SvgNaviMap must implement function svg_init()
//it is called after SVG are loaded completely.
function svg_init_custom() {
	"use strict";

	G.log("svg_init_custom");

	// set visibilities
	visibility_vertex();
	visibility_edge();
	visibility_edgemarker();
	visibility_borderpoint();
	visibility_borderline();

	// init google map
	if_gmap_init();

}

// called on load of page
function init_custom() {
	// open import menu
	import_open();
}