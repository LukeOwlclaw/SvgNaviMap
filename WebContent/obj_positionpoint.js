function PositionPoint(svg_id, x_pos, y_pos) {
	"use strict";
	var svgid = svg_id;
	var x = x_pos;
	var y = y_pos;

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

	this.setPosition = function(newSvgid, newX, newY) {
		"use strict";
		if (svgid != newSvgid) {
			var shape = this.getShape();
			// renew animation also, so that chrome starts it
			G.svg_unit_tuhh[svgid].removeChild(shape);
			svgid = newSvgid;
			G.svg_unit_tuhh[svgid].appendChild(shape);
			this.refreshChrome();
		}

		x = newX;
		this.getShape().setAttribute('cx', newX);
		y = newY;
		this.getShape().setAttribute('cy', newY);
	};

	this.getShape = function() {
		"use strict";
		var shape = G.svg_element[svgid].getElementById('positionpoint');
		if (shape == null)
			this.createShape();
		return G.svg_element[svgid].getElementById('positionpoint');
	};

	this.getAnimation = function() {
		"use strict";
		return G.svg_element[svgid].getElementById('positionpointBlink');
	};

	this.getNewAnimation = function() {
		"use strict";
		// animation
		// <animate attributeName="r" attributeType="XML"
		// dur="1.5s" from="3" to="7" fill="freeze" repeatCount="indefinite"/>
		var animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
		animation.setAttribute('id', 'positionpointBlink');
		animation.setAttribute('attributeName', 'r');
		animation.setAttribute('attributeType', 'XML');
		animation.setAttribute('dur', G.positionpoint_duration);
		animation.setAttribute('from', G.positionpoint_radius_min);
		animation.setAttribute('to', G.positionpoint_radius_max);
		animation.setAttribute('fill', 'freeze');
		animation.setAttribute('repeatCount', 'indefinite');

		return animation;
	};

	this.createShape = function() {
		"use strict";
		var shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

		shape.setAttribute('id', 'positionpoint');
		shape.setAttribute('cx', this.getX());
		shape.setAttribute('cy', this.getY());
		shape.setAttribute('r', G.vertex_hereami_radius);
		shape.setAttribute('fill', 'red');
		shape.setAttribute('stroke', 'black');
		shape.setAttribute('stroke-width', G.positionpoint_radius_edging);

		shape.appendChild(this.getNewAnimation());

		G.svg_unit_tuhh[svgid].appendChild(shape);
	};

	this.refreshChrome = function() {
		"use strict";
		var shape = this.getShape();
		shape.removeChild(this.getAnimation());
		shape.appendChild(this.getNewAnimation());
	};

	this.remove = function() {
		"use strict";
		G.svg_unit_tuhh[svgid].removeChild(this.getShape());
	};

	// create shape on init
	this.createShape();
}