function BorderLine(newID, newSvgid, newBp1, newBp2) {
	"use strict";
	var id = newID;
	var svgid = newSvgid;
	var bp1 = newBp1;
	var bp2 = newBp2;
	var used = 1;

	this.getId = function() {
		"use strict";
		return id;
	};

	this.getSvgid = function() {
		"use strict";
		return svgid;
	};

	this.getBp1 = function() {
		"use strict";
		return bp1;
	};

	this.getBp2 = function() {
		"use strict";
		return bp2;
	};

	this.getUsed = function() {
		"use strict";
		return used;
	};

	this.getShape = function() {
		"use strict";
		return G.svg_element[svgid].getElementById('borderline' + this.getId());
	};

	this.color = function() {
		"use strict";
		this.getShape().setAttribute('style', G.border_lineStyle);
	};

	this.color_active = function() {
		"use strict";
		this.getShape().setAttribute('style', G.border_lineStyleActive);
	};

	this.createShape = function() {
		"use strict";
		var shape = document.createElementNS('http://www.w3.org/2000/svg',
				'line');

		shape.setAttribute('id', 'borderline' + this.getId());
		shape.setAttribute('stroke-width', G.border_lineWidth);

		var x1 = bp1.getX();
		var y1 = bp1.getY();
		var x2 = bp2.getX();
		var y2 = bp2.getY();

		// draw the line only to the margin of the borderpoint
		var line_sub = G.border_lineDiff;
		var alpha = Math.atan2(y2 - y1, x2 - x1);
		var newX1 = line_sub * Math.cos(alpha) + x1;
		var newY1 = line_sub * Math.sin(alpha) + y1;
		var newX2 = x2 - line_sub * Math.cos(alpha);
		var newY2 = y2 - line_sub * Math.sin(alpha);

		shape.setAttribute('x1', newX1);
		shape.setAttribute('y1', newY1);
		shape.setAttribute('x2', newX2);
		shape.setAttribute('y2', newY2);

		G.svg_unit_borderline[svgid].appendChild(shape);

		this.color();
	};

	this.use = function() {
		"use strict";
		used++;
	};

	this.remove = function() {
		"use strict";
		if (used > 1) {
			used--;
			this.color();
		} else {
			bp1.deleteBorderLine(this);
			bp2.deleteBorderLine(this);
			G.svg_unit_borderline[svgid].removeChild(this.getShape());
			Affiliation_borderline_container.remove(this.getId());
		}
	};

	if (Affiliation_borderline_container.add(this) != null) {
		this.createShape();
		bp1.addBorderLine(this);
		bp2.addBorderLine(this);
	} else {
		G.log('Can not create borderline, because id is used already.');
	}
}