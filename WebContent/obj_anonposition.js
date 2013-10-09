function AnonPosition(newID, newSvgid, x_pos, y_pos) {
	"use strict";
	var id = newID;
	var svgid = newSvgid;
	var x = x_pos;
	var y = y_pos;
	var weight = 1;
	var anonColor = [ 'rgb(0,0,0)', 'rgb(0,0,205)', 'rgb(0,255,255)',
			'rgb(0,100,0)', 'rgb(0,255,127)', 'rgb(34,139,34)',
			'rgb(255,255,0)', 'rgb(184,134,11)', 'rgb(178,34,34)',
			'rgb(255,165,0)' ];

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

	this.setXY = function(newX, newY) {
		"use strict";
		x = newX;
		this.getShape().setAttribute('cx', x);
		y = newY;
		this.getShape().setAttribute('cy', y);
	};

	this.getWeight = function() {
		"use strict";
		return weight;
	};

	this.getShape = function() {
		"use strict";
		return G.svg_element[svgid].getElementById('anonid' + this.getId());
	};

	this.paint_collision = function() {
		"use strict";

		this.getShape().setAttribute('stroke', 'red');
		this.getShape().setAttribute('stroke-width', weight - 1);

		this.getShape().setAttribute('fill', 'green');
	};

	this.paint_anonid = function(anonid) {
		"use strict";

		var newAnonid = anonid % anonColor.length;

		this.getShape().setAttribute('fill', anonColor[newAnonid]);
	};

	this.createShape = function() {
		"use strict";
		var shape = document.createElementNS('http://www.w3.org/2000/svg',
				'circle');

		shape.setAttribute('id', 'anonid' + this.getId());
		shape.setAttribute('cx', this.getX());
		shape.setAttribute('cy', this.getY());
		shape.setAttribute('r', Anonposition_radius);

		G.svg_unit_tuhh[svgid].appendChild(shape);
	};

	this.collision = function() {
		"use strict";
		weight = weight + 1;
		this.paint_collision();
	};

	this.remove = function() {
		"use strict";

		G.svg_unit_tuhh[svgid].removeChild(this.getShape());
		Anonposition_container.remove(this.getId());
	};

	// no effect. why?
	this.hide = function() {
		"use strict";

		x = 0;
		y = 0;
		weight = 1;
		this.paint();
	};

	if (Anonposition_container.add(this) != null) {
		this.createShape();
	} else {
		debug('Can not create vertex, because id is used already.');
	}
}