function level_open() {
	"use strict";
	G.menu_current = 'level';
	document.getElementById('level').style.display = 'block';

	level_display();
}

function level_close() {
	"use strict";
	G.menu_current = null;
	document.getElementById('level').style.display = 'none';
}

function level_save() {
	"use strict";

	for ( var i = 0; i < G.svg_element.length; i++) {
		G.Level_min_altitude[i] = parseInt(document
				.getElementById('G.Level_min_altitude_' + i).value, 10);
		G.Level_max_altitude[i] = parseInt(document
				.getElementById('G.Level_max_altitude_' + i).value, 10);
	}

	var check = level_check();
	if (check != '') {
		alert(check);
	}
}

function level_display() {
	"use strict";

	var htmlstring = "";

	for ( var i = 0; i < G.svg_element.length; i++) {
		var min = G.Level_min_altitude[i];
		var max = G.Level_max_altitude[i];
		htmlstring += 'Level ' + i
				+ ':<br>Bottom <input id=\'G.Level_min_altitude_' + i
				+ '\' maxlength=\'4\' size=\'4\' value=\'' + min
				+ '\'><br>Top     <input id=\'G.Level_max_altitude_' + i
				+ '\' maxlength=\'4\' size=\'4\' value=\'' + max
				+ '\'><br><br>';
	}

	document.getElementById('level_details').innerHTML = htmlstring;

}

function level_check() {
	"use strict";
	var ret = '';

	for ( var i = 0; i < G.svg_element.length; i++) {
		var min = G.Level_min_altitude[i];
		var max = G.Level_max_altitude[i];
		if (isNaN(min) || isNaN(max) || min >= max) {
			return 'level ' + i + ': invalid min/max value(s).';
		}

		for ( var j = 0; j < G.svg_element.length; j++) {
			if (j == i)
				continue;

			var min2 = G.Level_min_altitude[j];
			var max2 = G.Level_max_altitude[j];

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
