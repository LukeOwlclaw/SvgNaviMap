function DemoWalk() {
	"use strict";

	if (currLocation == null) {
		G.log("currLocation == null");
		return;
	}
	if (currLocation.getDijkstraNextVertex() == null) {
		G.log("currLocation.getDijkstraNextVertex() == null");
		return;
	}

	if (currLocation.getId() == Routing_destination.getId()) {
		Interface.dodemowalk = false;
		G.log("DemoWalk: destination already reached");
		return;
	}

	DemoWalk_Iteration(currLocation.getDijkstraNextVertex().getId());
}

function DemoWalk_Iteration(nextVertex_id) {
	"use strict";

	if (!Interface.dodemowalk) {
		G.log("!Interface.dodemowalk");
		return;
	}

	if (DijkstraArrows.length == 0
			&& nextVertex_id != Routing_destination.getId()) {
		G.log("DijkstraArrows.length == 0");
		Interface.dodemowalk = false;
		return;
	}
	if (currPositionPoint == null) {
		G.log("currPositionPoint == null");
		Interface.dodemowalk = false;
		return;
	}
	if (Routing_destination == null) {
		G.log("Routing_destination == null");
		Interface.dodemowalk = false;
		return;
	}
	var nextVertex = Vertex_container.get(nextVertex_id);
	if (nextVertex == null) {
		G.log("nextVertex == null");
		Interface.dodemowalk = false;
		return;
	}

	// if next vertex is in the same level
	if (nextVertex.getSvgid() == currPositionPoint.getSvgid()) {
		var deltaX = Math.abs(nextVertex.getX() - currPositionPoint.getX());
		var deltaY = Math.abs(nextVertex.getY() - currPositionPoint.getY());

		// if near next vertex
		if (deltaX < 5 && deltaY < 5) {
			DemoWalk_Refresh(nextVertex.getSvgid(), nextVertex.getX(),
					nextVertex.getY());

			if (nextVertex_id == Routing_destination.getId()) {
				Interface.dodemowalk = false;
				G.log("DemoWalk: destination reached");
				// Interface.route_delete();
			} else {
				if (nextVertex.getDijkstraNextVertex() == null) {
					G.log("nextVertex.getDijkstraNextVertex() == null");
					Interface.dodemowalk = false;
					return;
				}
				var nid = nextVertex.getDijkstraNextVertex().getId();
				window.setTimeout("DemoWalk_Iteration(" + nid + ")", 800);
			}
		} else {// if not near
			var line_sub = 3;
			var x1 = currPositionPoint.getX();
			var y1 = currPositionPoint.getY();
			var x2 = nextVertex.getX();
			var y2 = nextVertex.getY();
			var alpha = Math.atan2(y2 - y1, x2 - x1);
			var newX1 = line_sub * Math.cos(alpha) + x1;
			var newY1 = line_sub * Math.sin(alpha) + y1;
			DemoWalk_Refresh(nextVertex.getSvgid(), newX1, newY1);

			window.setTimeout("DemoWalk_Iteration(" + nextVertex_id + ")", 800);
		}
	} else {
		if (currLocation == null) {
			G.log("currLocation == null");
			Interface.dodemowalk = false;
			return;
		}
		// get edge
		var edges = nextVertex.getEdgelist();
		var edge = null;
		var stepmarker = null;
		var stepmarker_next = null;
		for ( var i = 0, e = edges[i]; i < edges.length; e = edges[++i]) {
			if (e.getVertex1().getId() == currLocation.getId()) {
				edge = e;
				stepmarker = e.getVertex1_stepmarker();
				stepmarker_next = e.getVertex2_stepmarker();
				break;
			}
			if (e.getVertex2().getId() == currLocation.getId()) {
				edge = e;
				stepmarker = e.getVertex2_stepmarker();
				stepmarker_next = e.getVertex1_stepmarker();
				break;
			}
		}
		if (edge == null) {
			G.log("edge == null");
			Interface.dodemowalk = false;
			return;
		}

		var deltaX = Math.abs(stepmarker.getX() - currPositionPoint.getX());
		var deltaY = Math.abs(stepmarker.getY() - currPositionPoint.getY());
		// if near next stepmarker
		if (deltaX < 3 && deltaY < 3) {
			var newSvgid = parseInt(nextVertex.getSvgid(), 10);
			selectsvg(newSvgid);
			Interface.currentsvg = newSvgid;
			DemoWalk_Refresh(newSvgid, stepmarker_next.getX(), stepmarker_next
					.getY());

			window.setTimeout("DemoWalk_Iteration(" + nextVertex_id + ")", 800);

		} else {// if not near
			var line_sub = 3;
			var x1 = currPositionPoint.getX();
			var y1 = currPositionPoint.getY();
			var x2 = stepmarker.getX();
			var y2 = stepmarker.getY();
			var alpha = Math.atan2(y2 - y1, x2 - x1);
			var newX1 = line_sub * Math.cos(alpha) + x1;
			var newY1 = line_sub * Math.sin(alpha) + y1;
			DemoWalk_Refresh(currPositionPoint.getSvgid(), newX1, newY1);

			window.setTimeout("DemoWalk_Iteration(" + nextVertex_id + ")", 800);
		}
	}

}

function DemoWalk_Refresh(svgid, xPos, yPos) {
	Interface.position_setSVG(xPos, yPos, svgid);
}