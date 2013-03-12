function menu(id) {
	"use strict";
	if (G.menu_current != null) {
		// if (G.menu_current != id) {
		// alert('You have to close the current menu before!');
		// }
		// close old menu
		switch (G.menu_current) {
		case 'vertex':
			vertex_close();
			break;
		case 'edge':
			edge_close();
			break;
		case 'export':
			export_close();
			break;
		case 'import':
			import_close();
			break;
		case 'load_from_server':
			load_from_server();
			break;
		case 'affiliation':
			affiliation_close();
			break;
		case 'category':
			category_close();
			break;
		case 'gpsmarker':
			gpsmarker_close();
			break;
		case 'level':
			level_close();
			break;

		default:
			alert('default menu close');
			break;
		}
	}

	switch (id) {
	case 'vertex':
		vertex_open();
		break;
	case 'edge':
		edge_open();
		break;
	case 'export':
		export_open();
		break;
	case 'import':
		import_open();
		break;
	case 'affiliation':
		affiliation_open();
		break;
	case 'category':
		category_open();
		break;
	case 'gpsmarker':
		gpsmarker_open();
		break;
	case 'level':
		level_open();
		break;

	default:
		alert('default menu open');
		break;
	}
}


