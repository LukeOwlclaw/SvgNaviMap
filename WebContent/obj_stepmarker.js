function Stepmarker(newId, svg_id, x_pos, y_pos, newEdge) {
	"use strict";
	var id = newId;
	var svgid = svg_id;
	var x = x_pos;
	var y = y_pos;
	var edge = newEdge;

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

	this.getEdge = function() {
		"use strict";
		return egde;
	};

	this.setPosition = function(newX, newY) {
		"use strict";
		x = newX;
		this.getShape().setAttribute('x', x - G.stepmarker_length / 2);
		y = newY;
		this.getShape().setAttribute('y', y - G.stepmarker_length / 2);
		edge.drawLine();
	};

	this.getShape = function() {
		"use strict";
		return G.svg_element[svgid].getElementById('stepmarker' + id);
	};

	this.createShape = function() {
		"use strict";
		var shape = document.createElementNS('http://www.w3.org/2000/svg',
				'rect');
		shape.onmousedown = function(evt) {
			"use strict";
			Stepmarker_clickedID = id;
			Edge_clickedID = edge.getId();
			// G.log('stepmarker ' + id + ' clicked.');
		};

		shape.setAttribute('id', 'stepmarker' + id);
		shape.setAttribute('x', x - G.stepmarker_length / 2);
		shape.setAttribute('y', y - G.stepmarker_length / 2);
		shape.setAttribute('width', G.stepmarker_length);
		shape.setAttribute('height', G.stepmarker_length);
		shape.setAttribute('fill', 'green');
		shape.setAttribute('stroke', 'black');
		shape.setAttribute('stroke-width', G.stepmarker_stroke);

		G.svg_unit_stepmarker[svgid].appendChild(shape);

	};

	this.remove = function() {
		"use strict";
		G.svg_unit_stepmarker[svgid].removeChild(this.getShape());
		Stepmarker_container.remove(this.getId());
	};

	if (Stepmarker_container.add(this) != null) {
		this.createShape();
	} else {
		G.log('Can not create stepmarker, because id is used already.');
	}
}