function Gpsmarker(newID, newSvgid, x_pos, y_pos) {
	"use strict";
	var id = newID;
	var svgid = newSvgid;
	var x = x_pos;
	var y = y_pos;
	var latitude = '';
	var longitude = '';

	this.getId = function() {
		"use strict";
		return id;
	};

	this.getSvgid = function() {
		"use strict";
		return svgid;
	};

	this.getX = function() {
		"use strict";
		return x;
	};

	this.getY = function() {
		"use strict";
		return y;
	};

	this.getLatitude = function() {
		"use strict";
		return latitude;
	};

	this.getLongitude = function() {
		"use strict";
		return longitude;
	};

	this.setXY = function(newX, newY) {
		"use strict";
		x = newX;
		this.getShape().setAttribute('x', x - G.vertex_radius / 2);
		y = newY;
		this.getShape().setAttribute('y', y - G.vertex_radius / 2);
	};

	this.setLatitude = function(newLatitude) {
		"use strict";
		latitude = newLatitude;
	};

	this.setLongitude = function(newLongitude) {
		"use strict";
		longitude = newLongitude;
	};

	this.getShape = function() {
		"use strict";
		return G.svg_element[svgid].getElementById('gpsmarker' + this.getId());
	};

	this.paint = function() {
		"use strict";

		this.getShape().setAttribute('fill', 'black');
		this.getShape().setAttribute('stroke', 'blue');
		this.getShape().setAttribute('stroke-width', G.vertex_edging);
	};

	this.refreshChrome = function() {
		var shape = this.getShape();
		shape.onclick = function(evt) {
			"use strict";
			Gpsmarker_clickedID = id;
			// G.log('gpsmarker ' + id + ' clicked.');
		};

		shape.onmouseover = function(evt) {
			"use strict";
			// do only paint in gpsmarker menu
			if (G.menu_current != 'gpsmarker')
				return;

			// do not paint if already one marker selected
			if (Gpsmarker_current != null)
				return;

			Gpsmarker_container.get(id).paint_active();
		};

		shape.onmouseout = function(evt) {
			"use strict";
			// do not unpaint, if gpsmarker is selected
			if (Gpsmarker_current != null && Gpsmarker_current == id)
				return;

			Gpsmarker_container.get(id).paint();
		};
	};

	this.createShape = function() {
		"use strict";
		var shape = document.createElementNS('http://www.w3.org/2000/svg',
				'rect');

		shape.setAttribute('id', 'gpsmarker' + this.getId());
		shape.setAttribute('x', this.getX() - G.vertex_radius / 2);
		shape.setAttribute('y', this.getY() - G.vertex_radius / 2);
		shape.setAttribute('width', G.vertex_radius);
		shape.setAttribute('height', G.vertex_radius);

		G.svg_unit_gpsmarker[svgid].appendChild(shape);

		this.refreshChrome();

		this.paint();
	};

	this.paint_active = function() {
		"use strict";
		this.paint();
		this.getShape().setAttribute('stroke', 'red');
		this.getShape().setAttribute('stroke-width', G.vertex_edging);
	};

	this.remove = function() {
		"use strict";

		G.svg_unit_gpsmarker[svgid].removeChild(this.getShape());
		Gpsmarker_container.remove(this.getId());
	};

	if (Gpsmarker_container.add(this) != null) {
		this.createShape();
	} else {
		G.log('Can not create gpsmarker, because id is used already.');
	}
}