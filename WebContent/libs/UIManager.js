function UIManager() {
	"use strict";
	// var privateVariable = 0;
	// this.publicVariable = 1;
}

/**
 * Sets the visibility of a box. The second parameter says if the box has to be
 * hidden or shown. If this parameter is omitted the old value will be restored.
 * 
 * @param box
 *            The box for which the visibility has to be changed.
 * @param visible
 *            The new visibility. Omit this parameter to set to the last value.
 */
UIManager.setVisibility = function(id, action) {

	var e = document.getElementById(id);

	G.log((action));

	// construct the keys for the storage
	var keyVisi = id + '-visible';

	visible = true;
	if (typeof (action) != "string")
		action = "load";

	switch (action) {
	case "show":
		visible = true;
		break;
	case "hide":
		visible = true;
		break;
	case "toggle":
		visible = (e.style.display == "none") ? true : false;
		break;
	case "load":
		visible = localStorage.getItem(keyVisi) || true;
		break;
	default:
		G.log("Unknown action: " + action);
	}

	// and set the values for the visibility
	if (visible == true) {
		// remove the display property so that it will be taken from the CSS file
		e.style.display = "";
	} else {
		// hide the body by setting the display property to none
		e.style.display = "none";
	}

	//store visibility
	localStorage.setItem(keyVisi, visible);
}