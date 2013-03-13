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

