function isPositionInPolygon(xPos, yPos, polygon) {
	"use strict";
	if (isNaN(xPos)) {
		G.log('Not a valid xPos given: ' + xPos);
		return false;
	}
	if (isNaN(yPos)) {
		G.log('Not a valid yPos given: ' + yPos);
		return false;
	}
	if (!Polygon.prototype.isPrototypeOf(polygon)) {
		G.log('Not a polygon given: ' + polygon);
		return false;
	}
	if (!polygon.isClosed()) {
		G.log('Polygon is not closed.');
		return false;
	}
	if (polygon.getBorderPoints().length < 3) {
		G.log('Polygon has less than 3 points.');
		return false;
	}

	// testing rectangle
	if (xPos < polygon.getMinX() || xPos > polygon.getMaxX()
			|| yPos < polygon.getMinY() || yPos > polygon.getMaxY())
		return false;

	var nvert = polygon.getBorderPoints().length;
	var c = false;

	var points = polygon.getBorderPoints();
	var pointsX = new Array();
	var pointsY = new Array();
	for ( var i = 0; i < nvert; i++) {
		pointsX[i] = points[i].getX();
		pointsY[i] = points[i].getY();
	}

	// code from
	// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
	for ( var i = 0, j = nvert - 1; i < nvert; j = i++) {
		if (((pointsY[i] > yPos) != (pointsY[j] > yPos))
				&& (xPos < (pointsX[j] - pointsX[i]) * (yPos - pointsY[i])
						/ (pointsY[j] - pointsY[i]) + pointsX[i]))
			c = !c;
	}
	return c;
}

function getVertexByCoordinates(xPos, yPos, svgid) {
	"use strict";

	var vertexarray = Vertex_container.getAll();
	for ( var i = 0, v = vertexarray[i]; i < vertexarray.length; v = vertexarray[++i]) {
		if (v.getPolygon() == null)
			continue;
		if (v.getSvgid() != svgid)
			continue;

		if (isPositionInPolygon(xPos, yPos, v.getPolygon())) {
			return v;
		}
	}

	return null;
}