function Polygon() {
	"use strict";
	var isClosed = false;
	var BorderPoint_array = new Array();
	var BorderLine_array = new Array();
	var minX = null;
	var maxX = null;
	var minY = null;
	var maxY = null;

	this.getMinX = function() {
		"use strict";
		return minX;
	};

	this.getMaxX = function() {
		"use strict";
		return maxX;
	};

	this.getMinY = function() {
		"use strict";
		return minY;
	};

	this.getMaxY = function() {
		"use strict";
		return maxY;
	};

	this.getBorderPoints = function() {
		"use strict";
		return BorderPoint_array;
	};

	this.isClosed = function() {
		"use strict";
		return isClosed;
	};

	this.add_pos = function(xPos, yPos, svgid) {
		"use strict";
		var bp;
		if (Affiliation_borderPointClickedID == null) { // no border point
			// clicked
			var bp_id = Affiliation_borderpoint_container.getUnusedId();
			bp = new BorderPoint(bp_id, svgid, xPos, yPos);
		} else { // border point clicked
			bp = Affiliation_borderpoint_container
					.get(Affiliation_borderPointClickedID);
			Affiliation_borderPointClickedID = null;
		}

		this.add(bp);
	};

	this.add = function(bp) {
		"use strict";
		// test for being already closed
		if (isClosed) {
			G.log('Polygon already closed');
			return;
		}
		
		if(bp.getShape == null || bp.getShape() == null)
		{
			G.log("Cannot add borderpoint to shape with borderpoint.getShape==null");
			return;
		}

		// test for closing
		if (BorderPoint_array.length != 0
				&& bp.getId() == BorderPoint_array[0].getId()) {
			if (BorderPoint_array.length < 3) {
				alert('You need at least 3 points.');
				return;
			}

			isClosed = true;
			this.paintAdd();
			return;
		}

		// test for intern loop
		for ( var i = 1, b = BorderPoint_array[i]; i < BorderPoint_array.length; b = BorderPoint_array[++i]) {
			if (bp.getId() == b.getId()) {
				alert('You may not create an internal loop.');
				return;
			}
		}

		// finally add border point on clicked point position
		BorderPoint_array.push(bp);

		bp.use();
		bp.color_active();

		// refresh rectangle
		if (bp.getX() < minX || minX == null)
			minX = bp.getX();
		if (bp.getX() > maxX || maxX == null)
			maxX = bp.getX();
		if (bp.getY() < minY || minY == null)
			minY = bp.getY();
		if (bp.getY() > maxY || maxY == null)
			maxY = bp.getY();

		if (BorderPoint_array.length > 1)
			this.paintAdd();
	};

	this.paintAdd = function() {
		"use strict";
		var bp1;
		var bp2;
		if (this.isClosed()) {
			bp1 = BorderPoint_array[BorderPoint_array.length - 1];
			bp2 = BorderPoint_array[0];
		} else {
			bp1 = BorderPoint_array[BorderPoint_array.length - 2];
			bp2 = BorderPoint_array[BorderPoint_array.length - 1];
		}

		if (bp1.getSvgid() != bp2.getSvgid()) {
			G.log('borderpoints not in same svg level');
			return;
		}

		// test whether both borderpoints are already used
		if (bp1.getUsed() > 1 && bp2.getUsed() > 1) {
			var BL1_array = bp1.getBorderLines();
			var BL1_count = bp1.getBorderLines_count();
			var BL2_array = bp2.getBorderLines();
			var BL2_count = bp2.getBorderLines_count();
			var line = null;

			for ( var i = 0; i < BL1_count; i++) {
				for ( var j = 0; j < BL2_count; j++) {
					if (BL1_array[i].getId() == BL2_array[j].getId()) {
						line = BL1_array[i];
						break;
					}
				}
			}
			if (line == null) {
				var bl_id = Affiliation_borderline_container.getUnusedId();
				var bl = new BorderLine(bl_id, bp1.getSvgid(), bp1, bp2);
				BorderLine_array.push(bl);
				bl.color_active();

			} else {
				line.use();
				line.color_active();
				BorderLine_array.push(line);
			}

		} else {
			var bl_id = Affiliation_borderline_container.getUnusedId();
			var bl = new BorderLine(bl_id, bp1.getSvgid(), bp1, bp2);
			BorderLine_array.push(bl);
			bl.color_active();
		}
	};

	this.color_active = function() {
		"use strict";
		for ( var i = 0, b = BorderPoint_array[i]; i < BorderPoint_array.length; b = BorderPoint_array[++i]) {
			b.color_active();
		}
		for ( var i = 0, b = BorderLine_array[i]; i < BorderLine_array.length; b = BorderLine_array[++i]) {
			b.color_active();
		}
	};

	this.color = function() {
		"use strict";
		for ( var i = 0, b = BorderPoint_array[i]; i < BorderPoint_array.length; b = BorderPoint_array[++i]) {
			b.color();
		}
		for ( var i = 0, b = BorderLine_array[i]; i < BorderLine_array.length; b = BorderLine_array[++i]) {
			b.color();
		}
	};

	this.remove = function() {
		"use strict";
		// remove borderlines
		for ( var i = 0, bl = BorderLine_array[i]; i < BorderLine_array.length; bl = BorderLine_array[++i]) {
			bl.remove();
		}
		// remove borderpoints
		for ( var i = 0, bp = BorderPoint_array[i]; i < BorderPoint_array.length; bp = BorderPoint_array[++i]) {
			bp.remove();
		}
	};
}