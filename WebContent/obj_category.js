function Category(newId, newName) {
	"use strict";
	var id = newId;
	var cname = newName;
	var vertexlist = new Array();

	this.getId = function() {
		"use strict";
		return id;
	};

	this.getName = function() {
		"use strict";
		return cname;
	};

	this.setName = function(newName2) {
		"use strict";
		cname = newName2;
	};

	this.getVertexlist = function() {
		"use strict";
		return vertexlist;
	};

	this.addVertex = function(vertex) {
		"use strict";
		vertexlist.push(vertex);
	};

	this.removeVertex = function(vertex) {
		"use strcit";
		var found = false;
		for ( var i = 0, v = vertexlist[i]; i < vertexlist.length; v = vertexlist[++i]) {
			if (v.getId() == vertex.getId()) {
				found = true;
				break;
			}
		}
		if (found)
			vertexlist.splice(i, 1);
		else
			alert('not found id ' + vertex.getId()
					+ ' in vertexlist of category ' + this.getId());
	};

	this.remove = function() {
		"use strict";
		if (vertexlist.length != 0) {
			for ( var i = 0, v = vertexlist[i]; i < vertexlist.length; v = vertexlist[++i]) {
				v.setCategory(null);
			}
			G
					.log('Removing a not empty category. Vertex categories are set to null');
		}
		Category_container.remove(this.getId());
	};

	if (Category_container.add(this) == null) {
		G.log('Can not create category, because id is used already.');
	}
}