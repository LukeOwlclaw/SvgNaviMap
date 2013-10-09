function Edge(newID, newVertex1, newVertex2, newVertex1_reachable,
		newVertex2_reachable) {
	"use strict";
	var id = newID;
	var vertex1 = newVertex1;
	var vertex2 = newVertex2;
	var vertex1_reachable = newVertex1_reachable;
	var vertex2_reachable = newVertex2_reachable;
	var vertex1_stepmarker = null;
	var vertex2_stepmarker = null;
	var distance = parseInt(Math.sqrt(Math.pow(vertex1.getX() - vertex2.getX(),
			2)
			+ Math.pow(vertex1.getY() - vertex2.getY(), 2)), 10);
	if (vertex1.getSvgid != vertex2.getSvgid()) {
		distance += G.edge_switchWeight;
	}

	var distanceFactor = 1.0;

	var disabledAdapted = true;

	this.getId = function() {
		"use strict";
		return id;
	};

	this.getVertex1 = function() {
		"use strict";
		return vertex1;
	};

	this.getVertex2 = function() {
		"use strict";
		return vertex2;
	};

	this.getVertex1_reachable = function() {
		"use strict";
		return vertex1_reachable;
	};

	this.getVertex2_reachable = function() {
		"use strict";
		return vertex2_reachable;
	};

	this.getVertex1_stepmarker = function() {
		"use strict";
		return vertex1_stepmarker;
	};

	this.getVertex2_stepmarker = function() {
		"use strict";
		return vertex2_stepmarker;
	};

	this.getDistance = function() {
		"use strict";
		return distance;
	};

	this.setDistance = function(newDistance) {
		"use strict";
		distance = newDistance;
	};

	this.getDistanceFactor = function() {
		"use strict";
		return distanceFactor;
	};

	this.setDistanceFactor = function(newDistanceFactor) {
		"use strict";
		distanceFactor = newDistanceFactor;
	};

	this.setVertex1_reachable = function(new_Vertex1_reachable) {
		"use strict";
		vertex1_reachable = new_Vertex1_reachable;
	};

	this.setVertex2_reachable = function(new_Vertex2_reachable) {
		"use strict";
		vertex2_reachable = new_Vertex2_reachable;
	};

	/*
	 * this.setVertex1_stepmarker = function(new_Vertex1_stepmarker) {
	 * vertex1_stepmarker = new_Vertex1_stepmarker; };
	 * 
	 * this.setVertex2_stepmarker = function(new_Vertex2_stepmarker) {
	 * vertex2_stepmarker = new_Vertex2_stepmarker; };
	 */

	this.getDisabledAdapted = function() {
		"use strict";
		return disabledAdapted;
	};

	this.setDisabledAdapted = function(newDisabledAdapted) {
		"use strict";
		disabledAdapted = newDisabledAdapted;
	};

	this.getShape = function() {
		"use strict";
		var ret = new Array();

		if (vertex1.getSvgid() == vertex2.getSvgid())
			ret[0] = G.svg_element[vertex1.getSvgid()].getElementById('edge'
					+ this.getId());
		else {
			ret[0] = G.svg_element[vertex1.getSvgid()].getElementById('edge'
					+ this.getId() + '_' + vertex1.getSvgid());
			ret[1] = G.svg_element[vertex2.getSvgid()].getElementById('edge'
					+ this.getId() + '_' + vertex2.getSvgid());
		}
		return ret;
	};

	this.drawDisabledAdapted = function(drawDisabledAdapted) {
		"use strict";
		var shape = this.getShape();
		if (!drawDisabledAdapted) {
			if (shape.length == 1)
				shape[0].setAttribute('stroke-dasharray', G.edge_strokeColor
						+ ',' + G.edge_strokeNoColor);
			else {
				shape[0].setAttribute('stroke-dasharray', G.edge_strokeColor
						+ ',' + G.edge_strokeNoColor);
				shape[1].setAttribute('stroke-dasharray', G.edge_strokeColor
						+ ',' + G.edge_strokeNoColor);
			}
		}

		else {
			if (shape.length == 1)
				shape[0].setAttribute('stroke-dasharray', 'none');
			else {
				shape[0].setAttribute('stroke-dasharray', 'none');
				shape[1].setAttribute('stroke-dasharray', 'none');
			}
		}
	};

	this.drawLine = function() {
		"use strict";
		var shape = this.getShape();

		if (shape.length == 1) {
			// draw the line a little bit shorter, so that the edge markers do
			// not
			// overlap the vertices
			var line_sub = G.edge_vertexDistance;
			var x1 = vertex1.getX();
			var y1 = vertex1.getY();
			var x2 = vertex2.getX();
			var y2 = vertex2.getY();
			var alpha = Math.atan2(y2 - y1, x2 - x1);
			var newX1 = line_sub * Math.cos(alpha) + x1;
			var newY1 = line_sub * Math.sin(alpha) + y1;
			var newX2 = x2 - line_sub * Math.cos(alpha);
			var newY2 = y2 - line_sub * Math.sin(alpha);

			shape[0].setAttribute('x1', newX1);
			shape[0].setAttribute('y1', newY1);
			shape[0].setAttribute('x2', newX2);
			shape[0].setAttribute('y2', newY2);

		} else {
			// draw the line a little bit shorter, so that the edge markers do
			// not
			// overlap the vertices
			var line_sub = G.edge_vertexDistance;

			var x1_0 = vertex1.getX();
			var y1_0 = vertex1.getY();
			var x2_0 = vertex1_stepmarker.getX();
			var y2_0 = vertex1_stepmarker.getY();
			var alpha_0 = Math.atan2(y2_0 - y1_0, x2_0 - x1_0);
			var newX1_0 = line_sub * Math.cos(alpha_0) + x1_0;
			var newY1_0 = line_sub * Math.sin(alpha_0) + y1_0;
			shape[0].setAttribute('x1', newX1_0);
			shape[0].setAttribute('y1', newY1_0);
			shape[0].setAttribute('x2', x2_0);
			shape[0].setAttribute('y2', y2_0);

			var x1_1 = vertex2_stepmarker.getX();
			var y1_1 = vertex2_stepmarker.getY();
			var x2_1 = vertex2.getX();
			var y2_1 = vertex2.getY();
			var alpha_1 = Math.atan2(y2_1 - y1_1, x2_1 - x1_1);
			var newX2_1 = x2_1 - line_sub * Math.cos(alpha_1);
			var newY2_1 = y2_1 - line_sub * Math.sin(alpha_1);
			shape[1].setAttribute('x1', x1_1);
			shape[1].setAttribute('y1', y1_1);
			shape[1].setAttribute('x2', newX2_1);
			shape[1].setAttribute('y2', newY2_1);

		}

	};

	this.drawMarkers = function(start, end) {
		"use strict";
		var shape = this.getShape();

		if (shape.length == 1) {
			if (start === true) {
				shape[0].setAttribute('marker-start', 'url(#Triangle-start)');
			} else {
				shape[0].setAttribute('marker-start', 'none');
			}

			if (end === true) {
				shape[0].setAttribute('marker-end', 'url(#Triangle-end)');
			} else {
				shape[0].setAttribute('marker-end', 'none');
			}
		} else {
			if (start === true) {
				shape[0].setAttribute('marker-start', 'url(#Triangle-start)');
			} else {
				shape[0].setAttribute('marker-start', 'none');
			}
			// shape[0].setAttribute('marker-end', 'url(#Triangle-switch)');

			// shape[1].setAttribute('marker-start', 'url(#Triangle-switch)');
			if (end === true) {
				shape[1].setAttribute('marker-end', 'url(#Triangle-end)');
			} else {
				shape[1].setAttribute('marker-end', 'none');
			}
		}
	};

	this.createShape = function() {
		"use strict";
		if (vertex1.getSvgid() == vertex2.getSvgid()) {
			var shape = document.createElementNS('http://www.w3.org/2000/svg',
					'line');
			shape.onclick = function(evt) {
				"use strict";
				Edge_clickedID = id;
			};

			shape.onmouseover = function(evt) {
				"use strict";
				// do not paint, if not in a menu
				if (G.menu_current == null)
					return;

				if (Edge_current == null) {
					// do not paint if adding edge
					if (Edge_firstvertex != null)
						return;

					var tmp_idstr = evt.target.getAttribute('id');
					// 4, because of 'e d g e'
					var tmp_id = tmp_idstr.substring(4, tmp_idstr.length);
					Edge_container.get(tmp_id).paint_active();
				}
			};

			shape.onmouseout = function(evt) {
				"use strict";
				if (Edge_current != null)
					return;

				var tmp_idstr = evt.target.getAttribute('id');
				// 4, because of 'e d g e'
				var tmp_id = tmp_idstr.substring(4, tmp_idstr.length);
				Edge_container.get(tmp_id).paint();
			};

			shape.setAttribute('id', 'edge' + this.getId());
			shape.setAttribute('style', 'stroke:rgb(0,0,0)');
			shape.setAttribute('stroke-width', G.edge_lineWidth);

			G.svg_unit_edge[vertex1.getSvgid()].appendChild(shape);
		} else {
			var shape0 = document.createElementNS('http://www.w3.org/2000/svg',
					'line');
			var shape1 = document.createElementNS('http://www.w3.org/2000/svg',
					'line');
			shape0.onclick = function(evt) {
				"use strict";
				Edge_clickedID = id;
			};
			shape1.onclick = function(evt) {
				"use strict";
				Edge_clickedID = id;
			};

			shape0.onmouseover = function(evt) {
				"use strict";
				// do not paint, if not in a menu
				if (G.menu_current == null)
					return;

				if (Edge_current == null) {
					// do not paint if adding edge
					if (Edge_firstvertex != null)
						return;

					Edge_container.get(id).paint_active();
				}
			};
			shape1.onmouseover = function(evt) {
				"use strict";
				// do not paint, if not in a menu
				if (G.menu_current == null)
					return;

				if (Edge_current == null) {
					// do not paint if adding edge
					if (Edge_firstvertex != null)
						return;

					Edge_container.get(id).paint_active();
				}
			};

			shape0.onmouseout = function(evt) {
				"use strict";
				if (Edge_current != null)
					return;

				Edge_container.get(id).paint();
			};
			shape1.onmouseout = function(evt) {
				"use strict";
				if (Edge_current != null)
					return;

				Edge_container.get(id).paint();
			};

			shape0.setAttribute('id', 'edge' + this.getId() + '_'
					+ vertex1.getSvgid());
			shape0.setAttribute('style', 'stroke:rgb(0,0,0)');
			shape0.setAttribute('stroke-width', G.edge_lineWidth);
			G.svg_unit_edge[vertex1.getSvgid()].appendChild(shape0);

			shape1.setAttribute('id', 'edge' + this.getId() + '_'
					+ vertex2.getSvgid());
			shape1.setAttribute('style', 'stroke:rgb(0,0,0)');
			shape1.setAttribute('stroke-width', G.edge_lineWidth);
			G.svg_unit_edge[vertex2.getSvgid()].appendChild(shape1);

			vertex1_stepmarker = new Stepmarker(Stepmarker_container
					.getUnusedId(), vertex1.getSvgid(),
					(vertex1.getX() + vertex2.getX()) / 2,
					(vertex1.getY() + vertex2.getY()) / 2, this);
			vertex2_stepmarker = new Stepmarker(Stepmarker_container
					.getUnusedId(), vertex2.getSvgid(),
					(vertex1.getX() + vertex2.getX()) / 2,
					(vertex1.getY() + vertex2.getY()) / 2, this);
		}

		this.drawLine();
		this.drawDisabledAdapted(disabledAdapted);
		this.drawMarkers(vertex1_reachable, vertex2_reachable);
	};

	this.paint = function() {
		"use strict";
		var shape = this.getShape();

		if (shape.length == 1) {
			shape[0].setAttribute('style', 'stroke:rgb(0,0,0)');
		} else {
			shape[0].setAttribute('style', 'stroke:rgb(0,0,0)');
			shape[1].setAttribute('style', 'stroke:rgb(0,0,0)');
		}
	};

	this.paint_active = function() {
		"use strict";
		this.paint();
		var shape = this.getShape();

		if (shape.length == 1)
			shape[0].setAttribute('style', 'stroke:rgb(0,0,255)');
		else {
			shape[0].setAttribute('style', 'stroke:rgb(0,0,255)');
			shape[1].setAttribute('style', 'stroke:rgb(0,0,255)');
		}
	};

	this.vertexMoved = function() {
		"use strict";

		distance = parseInt(Math.sqrt(Math.pow(vertex1.getX() - vertex2.getX(),
				2)
				+ Math.pow(vertex1.getY() - vertex2.getY(), 2)), 10);
		this.drawLine();
	};

	this.remove = function() {
		"use strict";
		vertex1.deleteEdge(this);
		vertex2.deleteEdge(this);

		if (vertex1_stepmarker != null)
			vertex1_stepmarker.remove();
		if (vertex2_stepmarker != null)
			vertex2_stepmarker.remove();

		var shape = this.getShape();
		if (shape.length == 1)
			G.svg_unit_edge[vertex1.getSvgid()].removeChild(shape[0]);
		else {
			G.svg_unit_edge[vertex1.getSvgid()].removeChild(shape[0]);
			G.svg_unit_edge[vertex2.getSvgid()].removeChild(shape[1]);
		}
		Edge_container.remove(this.getId());
	};

	if (Edge_container.add(this) != null) {
		this.createShape();
		vertex1.addEdge(this);
		vertex2.addEdge(this);
	} else {
		G.log('Can not create edge, because id is used already.');
	}
}