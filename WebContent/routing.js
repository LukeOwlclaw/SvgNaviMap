function dijkstra_reverse(start_node, destination_node, disabledAdapted,
		drawArrows) {
	"use strict";
	// G.log('START Dijkstra for destination node ' + destination_node.getId());

	if (start_node.getId() == destination_node.getId()) {
		return true;
	}

	// initialize vertices and edges
	var vertexarray = Vertex_container.getAll();
	for ( var i = 0, v = vertexarray[i]; i < vertexarray.length; v = vertexarray[++i]) {
		v.setDijkstraDistance(null);
		v.setDijkstraNextVertex(null);
		v.setDijkstraUsed(false);
	}

	var dijkstraEdgeList = new DijkstraEdgeList();

	destination_node.setDijkstraDistance(0);
	destination_node.setDijkstraNextVertex('destination');
	destination_node.setDijkstraUsed(true);
	dijkstraEdgeList.add_sort(destination_node, null);

	var destination_reached = false;
	var destination_distance = null;

	while (!dijkstraEdgeList.isEmpty()) {
		var edge = dijkstraEdgeList.get();
		// G.log('use edge ' + edge_id);

		if (disabledAdapted && !edge.getDisabledAdapted())
			continue;

		if (!edge.getVertex1().getDijkstraUsed()) {
			if (!edge.getVertex2_reachable())
				continue;

			// edge to a new vertex
			var newVertex = edge.getVertex1();

			var distance = edge.getVertex2().getDijkstraDistance()
					+ edge.getDistance() * edge.getDistanceFactor();

			if (destination_reached && distance > destination_distance) {
				// G.log('do not add edges of vertex ' +
				// newVertex.getId());
				continue;
			}
			// G.log('visit vertex ' + newVertex.getId());
			var vertex_used = newVertex.setDijkstraUsed();

			newVertex.setDijkstraNextVertex(edge.getVertex2());
			newVertex.setDijkstraDistance(distance);
			newVertex.setDijkstraUsed(true);

			if (newVertex.getId() == destination_node.getId()) {
				destination_reached = true;
				destination_distance = distance;
			}

			if (vertex_used)
				dijkstraEdgeList.add_sort(newVertex, null);
			else
				dijkstraEdgeList.add_sort(newVertex, edge);
		}

		else if (!edge.getVertex2().getDijkstraUsed()) {
			if (!edge.getVertex1_reachable())
				continue;

			// edge to a new vertex
			var newVertex = edge.getVertex2();

			var distance = edge.getVertex1().getDijkstraDistance()
					+ edge.getDistance() * edge.getDistanceFactor();

			if (destination_reached && distance > destination_distance) {
				// G.log('do not add edges of vertex ' +
				// newVertex.getId());
				continue;
			}
			// G.log('visit vertex ' + newVertex.getId());
			var vertex_used = newVertex.setDijkstraUsed();

			newVertex.setDijkstraNextVertex(edge.getVertex1());
			newVertex.setDijkstraDistance(distance);
			newVertex.setDijkstraUsed(true);

			if (newVertex.getId() == destination_node.getId()) {
				destination_reached = true;
				destination_distance = distance;
			}

			if (vertex_used)
				dijkstraEdgeList.add_sort(newVertex, null);
			else
				dijkstraEdgeList.add_sort(newVertex, edge);

		} else {
			// edge between two visited vertices
			var p1 = edge.getVertex1();
			var p2 = edge.getVertex2();
			// G.log('visit edge between ' + p1-getId() + ' and ' +
			// p2.getId());

			if (edge.getVertex2_reachable()
					&& p1.getDijkstraDistance() > p2.getDijkstraDistance()
							+ edge.getDistance() * edge.getDistanceFactor()) {
				p1.setDijkstraNextVertex(p2);
				p1.setDijkstraDistance(p2.getDijkstraDistance()
						+ edge.getDistance() * edge.getDistanceFactor());
				dijkstraEdgeList.add_sort(p1, edge);

			} else if (edge.getVertex1_reachable()
					&& p2.getDijkstraDistance() > p1.getDijkstraDistance()
							+ edge.getDistance() * edge.getDistanceFactor()) {
				p2.setDijkstraNextVertex(p1);
				p2.setDijkstraDistance(p1.getDijkstraDistance()
						+ edge.getDistance() * edge.getDistanceFactor());
				dijkstraEdgeList.add_sort(p2, edge);

			}
		}

	}

	var route = new Array();
	// G.log(id_destination);
	var next_node = start_node;

	do {
		route.push(next_node);
		next_node = next_node.getDijkstraNextVertex();
		// G.log(' -> ' + prev_node.getId());
	} while (next_node != 'destination' && next_node != null);

	if (next_node == null) {
		if (typeof (svgapp) == "undefined")
			alert('no route found.');
		return false;
	}

	// G.log('route found');
	// G.log(route);

	if (drawArrows) {
		for ( var i = 1; i < route.length; i++) {
			DijkstraArrows
					.push(new DijkstraArrow(i - 1, route[i - 1], route[i]));
		}
	}

	return true;

	// G.log('END Dijkstra');
}

function DijkstraEdgeList() {
	"use strict";
	var list = new Array();

	this.add_sort = function(node, ignore_edge) {
		var edge_list = node.getEdgelist();

		for ( var i = 0, e = edge_list[i]; i < edge_list.length; e = edge_list[++i]) {
			if (ignore_edge != null && e.getId() == ignore_edge.getId())
				continue;

			list = sortPush_dijkstraEdgeList(list, e);
		}
	};

	this.get = function() {
		return list.splice(0, 1)[0];
	};

	this.isEmpty = function() {
		return (list.length == 0);
	};

}

function sortPush_dijkstraEdgeList(array, element) {
	"use strict";
	if (array.length == 0) {
		var ret = new Array();
		ret.push(element);
		return ret;
	}
	if (array.length == 1) {
		if ((element.getDistance() * element.getDistanceFactor()) <= (array[0]
				.getDistance() * array[0].getDistanceFactor())) {
			array.unshift(element);
			return array;
		}

		array.push(element);
		return array;
	}

	var pivot = Math.ceil(array.length / 2);
	var lhs = array.slice(0, pivot);
	var rhs = array.slice(pivot);

	if ((element.getDistance() * element.getDistanceFactor()) <= (array[pivot]
			.getDistance() * array[pivot].getDistanceFactor()))
		return sortPush_dijkstraEdgeList(lhs, element).concat(rhs);

	return lhs.concat(sortPush_dijkstraEdgeList(rhs, element));
}

function DijkstraArrow(new_id, new_vertex_start, new_vertex_end) {
	"use strict";
	var id = new_id;
	var vertex_start = new_vertex_start;
	var vertex_end = new_vertex_end;

	// calc edge
	var edge = null;
	var edgelist1 = vertex_start.getEdgelist();
	var edgelist2 = vertex_end.getEdgelist();
	for ( var i = 0, e1 = edgelist1[i]; i < edgelist1.length; e1 = edgelist1[++i]) {
		for ( var j = 0, e2 = edgelist2[j]; j < edgelist2.length; e2 = edgelist2[++j]) {
			if (e1.getId() == e2.getId()) {
				edge = e1;
				break;
			}
		}
		if (edge != null)
			break;
	}

	if (edge == null) {
		alert('no edge between vertices found, but should');
		return;
	}

	this.getShape = function() {
		"use strict";
		var ret = new Array();

		if (vertex_start.getSvgid() == vertex_end.getSvgid())
			ret[0] = G.svg_element[vertex_start.getSvgid()]
					.getElementById('dijkstra' + id);
		else {
			ret[0] = G.svg_element[vertex_start.getSvgid()]
					.getElementById('dijkstra' + id + '_'
							+ vertex_start.getSvgid());
			ret[1] = G.svg_element[vertex_end.getSvgid()]
					.getElementById('dijkstra' + id + '_'
							+ vertex_end.getSvgid());
		}
		return ret;
	};

	this.drawLine = function() {
		"use strict";
		var shape = this.getShape();

		if (shape.length == 1) {
			// draw the line a little bit shorter, so that the edge markers do
			// not
			// overlap the vertices
			var line_sub = G.edge_vertexDistance;
			var x1 = vertex_start.getX();
			var y1 = vertex_start.getY();
			var x2 = vertex_end.getX();
			var y2 = vertex_end.getY();
			var alpha = Math.atan2(y2 - y1, x2 - x1);
			var newX1 = line_sub * Math.cos(alpha) + x1;
			var newY1 = line_sub * Math.sin(alpha) + y1;
			var newX2 = x2 - line_sub * Math.cos(alpha);
			var newY2 = y2 - line_sub * Math.sin(alpha);

			shape[0].setAttribute('x1', newX1);
			shape[0].setAttribute('y1', newY1);
			shape[0].setAttribute('x2', newX2);
			shape[0].setAttribute('y2', newY2);
			shape[0].setAttribute('marker-end', 'url(#Triangle-end)');
		} else {
			// draw the line a little bit shorter, so that the edge markers do
			// not
			// overlap the vertices
			var stepmarker_start = null;
			var stepmarker_end = null;
			if (edge.getVertex1().getId() == vertex_start.getId()) {
				stepmarker_start = edge.getVertex1_stepmarker();
				stepmarker_end = edge.getVertex2_stepmarker();
			} else {
				stepmarker_start = edge.getVertex2_stepmarker();
				stepmarker_end = edge.getVertex1_stepmarker();
			}

			var line_sub = G.edge_vertexDistance;

			var x1_0 = vertex_start.getX();
			var y1_0 = vertex_start.getY();
			var x2_0 = stepmarker_start.getX();
			var y2_0 = stepmarker_start.getY();
			var alpha_0 = Math.atan2(y2_0 - y1_0, x2_0 - x1_0);
			var newX1_0 = line_sub * Math.cos(alpha_0) + x1_0;
			var newY1_0 = line_sub * Math.sin(alpha_0) + y1_0;
			shape[0].setAttribute('x1', newX1_0);
			shape[0].setAttribute('y1', newY1_0);
			shape[0].setAttribute('x2', x2_0);
			shape[0].setAttribute('y2', y2_0);

			var x1_1 = stepmarker_end.getX();
			var y1_1 = stepmarker_end.getY();
			var x2_1 = vertex_end.getX();
			var y2_1 = vertex_end.getY();
			var alpha_1 = Math.atan2(y2_1 - y1_1, x2_1 - x1_1);
			var newX2_1 = x2_1 - line_sub * Math.cos(alpha_1);
			var newY2_1 = y2_1 - line_sub * Math.sin(alpha_1);
			shape[1].setAttribute('x1', x1_1);
			shape[1].setAttribute('y1', y1_1);
			shape[1].setAttribute('x2', newX2_1);
			shape[1].setAttribute('y2', newY2_1);

			shape[0].setAttribute('marker-end', 'url(#Triangle-switch)');
			shape[1].setAttribute('marker-start', 'url(#Triangle-switch)');
			shape[1].setAttribute('marker-end', 'url(#Triangle-end)');
		}
	};

	this.createShape = function() {
		"use strict";
		if (vertex_start.getSvgid() == vertex_end.getSvgid()) {
			var shape = document.createElementNS('http://www.w3.org/2000/svg',
					'line');

			shape.setAttribute('id', 'dijkstra' + id);
			shape.setAttribute('style', G.routingEdgeStyle);
			shape.setAttribute('stroke-width', G.edge_lineWidth);

			G.svg_unit_dijkstra[vertex_start.getSvgid()].appendChild(shape);
		} else {
			var shape0 = document.createElementNS('http://www.w3.org/2000/svg',
					'line');
			var shape1 = document.createElementNS('http://www.w3.org/2000/svg',
					'line');

			shape0.setAttribute('id', 'dijkstra' + id + '_'
					+ vertex_start.getSvgid());
			shape0.setAttribute('style', G.routingEdgeStyle);
			shape0.setAttribute('stroke-width', G.edge_lineWidth);
			G.svg_unit_dijkstra[vertex_start.getSvgid()].appendChild(shape0);

			shape1.setAttribute('id', 'dijkstra' + id + '_'
					+ vertex_end.getSvgid());
			shape1.setAttribute('style', G.routingEdgeStyle);
			shape1.setAttribute('stroke-width', G.edge_lineWidth);
			G.svg_unit_dijkstra[vertex_end.getSvgid()].appendChild(shape1);
		}

		this.drawLine();
	};

	this.remove = function() {
		"use strict";
		var shape = this.getShape();
		if (shape.length == 1)
			G.svg_unit_dijkstra[vertex_start.getSvgid()].removeChild(shape[0]);
		else {
			G.svg_unit_dijkstra[vertex_start.getSvgid()].removeChild(shape[0]);
			G.svg_unit_dijkstra[vertex_end.getSvgid()].removeChild(shape[1]);
		}
	};

	this.getId = function() {
		"use strict";

		return id;
	};

	this.getVertexStart = function() {
		"use strict";

		return vertex_start;
	};

	this.getVertexEnd = function() {
		"use strict";

		return vertex_end;
	};

	// create shape on init
	this.createShape();
}

function try_preRouting(start_node, destination_node, disabledAdapted) {
	"use strict";
	// G.log('start prerouting');

	if (start_node.getId() == destination_node.getId()) {
		return true;
	}

	if (disabledAdapted != Routing_disabledAdapted) {
		// G.log('different disabledAdapted value from last dijkstra.');
		return false;
	}

	if (destination_node.getDijkstraNextVertex() != 'destination') {
		// G.log('different destination from last dijkstra.');
		return false;
	}

	var route = new Array();
	var next_node = start_node;

	do {
		route.push(next_node);
		next_node = next_node.getDijkstraNextVertex();
		// G.log(' -> ' + prev_node.getId());
	} while (next_node != "destination" && next_node != null);

	if (next_node == null) {
		// G.log('no preroute found.');
		return false;
	}

	// G.log('preroute found');

	for ( var i = 1; i < route.length; i++) {
		DijkstraArrows.push(new DijkstraArrow(i - 1, route[i - 1], route[i]));
	}

	return true;
}
