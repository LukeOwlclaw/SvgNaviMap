function Vertex(newID, newSvgid, x_pos, y_pos) {
	"use strict";
	var id = newID;
	var svgid = newSvgid;
	var x = x_pos;
	var y = y_pos;
	var poi = true;
	var shortDesc = '';
	var longDesc = '';
	var polygon = null;
	var edgelist = new Array();
	var category = null;

	var dijkstra_nextVertex = null;
	var dijkstra_distance = null;
	var dijkstra_used = false;

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

	this.getPoi = function() {
		"use strict";
		return poi;
	};

	this.getShortDesc = function() {
		"use strict";
		return shortDesc;
	};

	this.getLongDesc = function() {
		"use strict";
		return longDesc;
	};

	this.getPolygon = function() {
		"use strict";
		return polygon;
	};

	this.getDijkstraNextVertex = function() {
		"use strict";
		return dijkstra_nextVertex;
	};

	this.setDijkstraNextVertex = function(newDijkstraNextVertex) {
		"use strict";
		dijkstra_nextVertex = newDijkstraNextVertex;
	};

	this.getDijkstraDistance = function() {
		"use strict";
		return dijkstra_distance;
	};

	this.setDijkstraDistance = function(newDijkstraDistance) {
		"use strict";
		dijkstra_distance = newDijkstraDistance;
	};

	this.getDijkstraUsed = function() {
		"use strict";
		return dijkstra_used;
	};

	this.setDijkstraUsed = function(newDijkstraUsed) {
		"use strict";
		dijkstra_used = newDijkstraUsed;
	};

	this.setXY = function(newX, newY) {
		"use strict";
		x = newX;
		this.getShape().setAttribute('cx', x);
		y = newY;
		this.getShape().setAttribute('cy', y);
		// move edges
		for ( var i = 0, e = edgelist[i]; i < edgelist.length; e = edgelist[++i]) {
			e.vertexMoved();
		}

		if (polygon != null) {
			// check if still inside affiliation area
			if (!isPositionInPolygon(this.getX(), this.getY(), polygon)) {
				alert('This vertex is not longer within it\'s affiliation area.');
			}
		}
	};

	this.setPoi = function(newPoi) {
		"use strict";
		poi = newPoi;
		this.paint();
	};

	this.setShortDesc = function(newShortDesc) {
		"use strict";
		shortDesc = newShortDesc;
	};

	this.setLongDesc = function(newLongDesc) {
		"use strict";
		longDesc = newLongDesc;
	};

	this.setPolygon = function(newPolygon) {
		"use strict";
		polygon = newPolygon;
	};

	this.getShape = function() {
		"use strict";
		return G.svg_element[svgid].getElementById('vertex' + this.getId());
	};

	this.getEdgelist = function() {
		"use strict";
		return edgelist;
	};

	this.addEdge = function(newEdge) {
		"use strict";
		edgelist.push(newEdge);
	};

	this.deleteEdge = function(deleteEdge) {
		"use strict";
		var found = false;
		for ( var i = 0, e = edgelist[i]; i < edgelist.length; e = edgelist[++i]) {
			if (e.getId() == deleteEdge.getId()) {
				found = true;
				break;
			}
		}
		if (found)
			edgelist.splice(i, 1);
		else
			alert('not found id ' + deleteEdge.getId()
					+ ' in edgelist of vertex ' + this.getId());
	};

	this.setCategory = function(newCategory) {
		"use strict";
		if (category != null) {
			category.removeVertex(this);
		}
		category = newCategory;
		if (category != null) {
			category.addVertex(this);
		}
	};

	this.getCategory = function() {
		"use strict";
		return category;
	};

	this.paint = function() {
		"use strict";
		var test = G.svg_element[svgid].getElementById('destination_marker');
		if (test != undefined)
			G.svg_unit_vertex[svgid].removeChild(test);

		if (this.getPoi()) {
			this.getShape().setAttribute('fill', 'black');
		} else {
			this.getShape().setAttribute('fill', 'grey');
		}
		this.getShape().setAttribute('stroke', 'none');
		this.getShape().setAttribute('stroke-width', '0');
		this.getShape().setAttribute('marker-mid', 'none');
		Vertex_hoover = null;
	};

	this.refreshChrome = function() {
		var shape = this.getShape();
		shape.onclick = function(evt) {
			"use strict";
			Vertex_clickedID = id;
			// G.log('vertex ' + id + ' clicked.');
		};

		shape.onmouseover = function(evt) {
			"use strict";
			// do not paint, if not in a menu
			if (G.menu_current == null)
				return;

			// do not paint, if in gpsmarker menu
			if (G.menu_current == 'gpsmarker')
				return;

			// do not paint, if vertex is selected
			if (Vertex_current != null)
				return;

			// do not paint, if an edge is selected
			if (Edge_current != null)
				return;

			// do not paint if route displayed
			if (DijkstraArrows.length != 0)
				return;

			Vertex_container.get(id).paint_active();
		};

		shape.onmouseout = function(evt) {
			"use strict";
			// do not unpaint, if vertex is selected
			if (Vertex_current != null)
				return;

			// do not unpaint, if firstvertex of an edge
			if (Edge_firstvertex != null && Edge_firstvertex.getId() == id)
				return;

			// do not unpaint, if currLocation
			if (currLocation != null && currLocation.getId() == id)
				return;

			// do not unpaint, if routing destination
			if (Routing_destination != null
					&& Routing_destination.getId() == id)
				return;

			Vertex_container.get(id).paint();
		};
	};

	this.createShape = function() {
		"use strict";
		var shape = document.createElementNS('http://www.w3.org/2000/svg',
				'circle');

		shape.setAttribute('id', 'vertex' + this.getId());
		shape.setAttribute('cx', this.getX());
		shape.setAttribute('cy', this.getY());
		shape.setAttribute('r', G.vertex_radius);

		G.svg_unit_vertex[svgid].appendChild(shape);

		this.refreshChrome();

		this.paint();
	};

	this.paint_active = function() {
		"use strict";
		this.paint();
		this.getShape().setAttribute('stroke', 'red');
		this.getShape().setAttribute('stroke-width', G.vertex_edging);
		this.getShape().setAttribute('marker-mid', 'none');
		Vertex_hoover = this.getId();
	};

	this.paint_destination = function() {
		"use strict";
		this.paint_active();

		var test = G.svg_element[svgid].getElementById('destination_marker');
		if (test != undefined)
			G.svg_unit_vertex[svgid].removeChild(test);

		var path = document.createElementNS('http://www.w3.org/2000/svg',
				'path');
		path.setAttribute('id', 'destination_marker');
		path.setAttribute('d', 'M ' + (x - G.destinationmarker_dim) + ' '
				+ (y - 4 * G.destinationmarker_dim) + ' L ' + x + ' ' + y
				+ ' L ' + (x + G.destinationmarker_dim) + ' '
				+ (y - 4 * G.destinationmarker_dim) + ' z');
		path.setAttribute('fill', 'rgb(50,204,50)');
		path.setAttribute('style', 'stroke:rgb(0,0,0)');
		path.setAttribute('stroke-width', '0.9');
		G.svg_unit_vertex[svgid].appendChild(path);
	};

	this.remove = function() {
		"use strict";
		// remove polygon
		if (polygon != null) {
			polygon.remove();
			polygon = null;
		}

		// remove edges
		while (edgelist.length != 0) {
			edgelist[0].remove();
		}

		// remove from category
		if (category != null) {
			category.removeVertex(this);
			category = null;
		}

		G.svg_unit_vertex[svgid].removeChild(this.getShape());
		Vertex_container.remove(this.getId());
	};

	if (Vertex_container.add(this) != null) {
		this.createShape();
	} else {
		G.log('Can not create vertex, because id is used already.');
	}
}