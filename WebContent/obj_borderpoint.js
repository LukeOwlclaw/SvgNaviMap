function BorderPoint(newID, newSvgid, x_pos, y_pos) {
	"use strict";
	var id = newID;
	var svgid = newSvgid;
	var x = x_pos;
	var y = y_pos;
	var used = 0;
	var BorderLines = new Array();

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

	this.getUsed = function() {
		"use strict";
		return used;
	};

	this.getBorderLines_count = function() {
		"use strict";
		return BorderLines.length;
	};

	this.getBorderLines = function() {
		"use strict";
		return BorderLines;
	};

	this.addBorderLine = function(newBorderLine) {
		"use strict";
		BorderLines.push(newBorderLine);
	};

	this.deleteBorderLine = function(deleteBorderLine) {
		"use strict";
		var found = false;
		for ( var i = 0, b = BorderLines[i]; i < BorderLines.length; b = BorderLines[++i]) {
			if (b.getId() == deleteBorderLine.getId()) {
				found = true;
				break;
			}
		}
		if (found)
			BorderLines.splice(i, 1);
		else
			alert('not found id ' + deleteBorderLine.getId()
					+ ' in borderlinelist of borderpoint ' + this.getId());
	};

	this.getShape = function() {
		"use strict";
		return G.svg_element[svgid]
				.getElementById('borderpoint' + this.getId());
	};

	this.paint = function() {
		"use strict";
		this.getShape().setAttribute('stroke', 'none');
		this.getShape().setAttribute('stroke-width', '0');
	};

	this.paint_active = function() {
		"use strict";
		this.getShape().setAttribute('stroke', 'red');
		this.getShape().setAttribute('stroke-width', G.border_edging);
	};

	this.color = function() {
		"use strict";
		this.getShape().setAttribute('fill', '#999999');
	};

	this.color_active = function() {
		"use strict";
		this.getShape().setAttribute('fill', '#333333');
	};

	this.createShape = function() {
		"use strict";
		var shape = document.createElementNS('http://www.w3.org/2000/svg',
				'circle');
		shape.onclick = function(evt) {
			"use strict";
			Affiliation_borderPointClickedID = id;
			// G.log('borderpoint ' + id + ' clicked.');
		};

		shape.onmouseover = function(evt) {
			"use strict";
			// do not paint, if not in affiliation menu
			if (G.menu_current != 'affiliation')
				return;

			var tmp_idstr = evt.target.getAttribute('id');
			// 11, because of borderpoint
			var tmp_id = tmp_idstr.substring(11, tmp_idstr.length);
			Affiliation_borderpoint_container.get(tmp_id).paint_active();
		};

		shape.onmouseout = function(evt) {
			"use strict";
			var tmp_idstr = evt.target.getAttribute('id');
			// 11, because of borderpoint
			var tmp_id = tmp_idstr.substring(11, tmp_idstr.length);
			Affiliation_borderpoint_container.get(tmp_id).paint();
		};

		shape.setAttribute('id', 'borderpoint' + this.getId());
		shape.setAttribute('cx', this.getX());
		shape.setAttribute('cy', this.getY());
		shape.setAttribute('r', G.border_radius);

		// G.log('borderpoint ' + id + ' created.');
		// if(G.svg_unit_borderpoint[svgid]!=null)
		G.svg_unit_borderpoint[svgid].appendChild(shape);
		//G.log('G.svg_unit_borderpoint[svgid] is null. svgid=' + svgid);

		this.color();
		this.paint();
	};

	this.use = function() {
		"use strict";
		used++;
	};

	this.remove = function() {
		"use strict";
		if (used != 1) {
			if (used > 1) {
				used--;
				this.color();
			} else {
				alert('deleteing borderpoint, with used < 1');
			}
		} else {
			if (BorderLines.length != 0)
				alert('find borderlines, while deleting borderpoint (should already be deleted)');
			G.svg_unit_borderpoint[svgid].removeChild(this.getShape());
			Affiliation_borderpoint_container.remove(this.getId());
		}
	};

	if (Affiliation_borderpoint_container.add(this) != null) {
		this.createShape();
	} else {
		G.log('Can not create borderpoint, because id is used already.');
	}
}
