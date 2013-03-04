function levelaltitude_open() {
	"use strict";
	G.menu_current = 'levelaltitude';
	document.getElementById('levelaltitude').style.display = 'block';

	levelaltitude_display();
}

function levelaltitude_close() {
	"use strict";
	G.menu_current = null;
	document.getElementById('levelaltitude').style.display = 'none';
}

function levelaltitude_save() {
	"use strict";

	for ( var i = 0; i < G.svg_element.length; i++) {
		LevelAltitude_min[i] = parseInt(document
				.getElementById('levelaltitude_min_' + i).value, 10);
		LevelAltitude_max[i] = parseInt(document
				.getElementById('levelaltitude_max_' + i).value, 10);
	}

	var check = levelaltitude_check();
	if (check != '') {
		alert(check);
	}
}

function levelaltitude_display() {
	"use strict";

	var htmlstring = "";

	for ( var i = 0; i < G.svg_element.length; i++) {
		var min = LevelAltitude_min[i];
		var max = LevelAltitude_max[i];
		htmlstring += 'Level ' + i
				+ ':<br>Bottom <input id=\'levelaltitude_min_' + i
				+ '\' maxlength=\'4\' size=\'4\' value=\'' + min
				+ '\'><br>Top     <input id=\'levelaltitude_max_' + i
				+ '\' maxlength=\'4\' size=\'4\' value=\'' + max
				+ '\'><br><br>';
	}

	document.getElementById('levelaltitude_details').innerHTML = htmlstring;

}

function levelaltitude_check() {
	"use strict";
	var ret = '';

	for ( var i = 0; i < G.svg_element.length; i++) {
		var min = LevelAltitude_min[i];
		var max = LevelAltitude_max[i];
		if (isNaN(min) || isNaN(max) || min >= max) {
			return 'level ' + i + ': invalid min/max value(s).';
		}

		for ( var j = 0; j < G.svg_element.length; j++) {
			if (j == i)
				continue;

			var min2 = LevelAltitude_min[j];
			var max2 = LevelAltitude_max[j];

			if (min2 === undefined || max2 === undefined) {
				continue;
			}

			if ((min2 < max && max < max2) || (min2 < min && min < max2)) {
				ret += 'level ' + i + ': conflicts with level ' + j + '.';
			}
		}

	}

	return ret;
}
