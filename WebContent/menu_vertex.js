function vertex_open() {
	"use strict";
	G.menu_current = 'vertex';
	document.getElementById('vertex').style.display = 'block';
	document.getElementById('vertex_default').style.display = 'block';

	for ( var i = 0; i < G.svg_element.length; i++) {
		// show debug
		G.svg_element[i].addEventListener('mousemove', vertex_mousemove, false);
		// handle clicking
		G.svg_element[i].addEventListener('click', vertex_click, false);
    // handle keys
		G.svg_element[i].addEventListener('keydown', vertex_keypress, false);
	}
  addEventListener('keydown', vertex_keypress, false);
}

function vertex_keypress(event) {
  
  switch(event.keyCode)
  {
    case KeyEvent.DOM_VK_RETURN : 
              vertex_save();
              break;
    case KeyEvent.DOM_VK_ESCAPE :
              if(Vertex_current != null)
                vertex_deselect();
              else
                vertex_close();
              break;
    case KeyEvent.DOM_VK_M : 
              if(document.getElementById('vertex_move_on').style.display == 'none')
                vertex_move_off();
              else
                vertex_move_on();
              break;
    case KeyEvent.DOM_VK_P : 
              document.getElementById('vertex_poi').checked = !document.getElementById('vertex_poi').checked;
              vertex_color();
              break;
    case KeyEvent.DOM_VK_DELETE :
              vertex_delete();
              break;
    default:
              break;
  }
}


function vertex_mousemove(evt) {
	"use strict";
	var id = G.getSvgId(evt);

	var zoom = G.svg_parent[id].clientWidth / G.svg_element[id].widthUnzoomed;
	var zoom2 = G.svg_element[id].viewBox.baseVal.width
			/ G.svg_element[id].widthUnzoomed;
	zoom = zoom / zoom2;

	var offsetX = G.svg_element[id].viewBox.baseVal.x;
	var offsetY = G.svg_element[id].viewBox.baseVal.y;

	G.debug("X=" + ((evt.clientX / zoom) - offsetX) + " Y="
			+ ((evt.clientY / zoom) - offsetY) + " zoom=" + zoom
			+ ';<br> X-org= ' + MZP.translateX(evt) + ' Y-org= '
			+ MZP.translateY(evt) + '<br>svg-id: ' + id + '<br>vertex-id: '
			+ Vertex_hoover);
}

function vertex_click(evt) {
	"use strict";
	var posX = MZP.translateX(evt);
	var posY = MZP.translateY(evt);
	var svgid = G.getSvgId(evt);

	// add, if no vertex yet selected
	if (Vertex_clickedID == null && Vertex_current == null) {
		// check for too close vertices
		var vertexarray = Vertex_container.getAll();
		for ( var i = 0, v = vertexarray[i]; i < vertexarray.length; v = vertexarray[++i]) {
			// only check in same level
			if (v.getSvgid() != svgid)
				continue;

			var distance = parseInt(Math.sqrt(Math.pow(v.getX() - posX, 2)
					+ Math.pow(v.getY() - posY, 2)), 10);
			if (distance < G.vertex_minDistance) {
				alert('This site is too near to an existing vertex!');
				Vertex_clickedID = null;
				return;
			}
		}

		var vertex_id = Vertex_container.getUnusedId();
		var vertex = new Vertex(vertex_id, svgid, posX, posY);
		Vertex_current = vertex;
		// if pressed ctrl, do not show details and set navigation vertex
		if (evt.ctrlKey) {
			Vertex_current.setPoi(false);
			Vertex_current = null;
		} else {
			// set details
			vertex_select(Vertex_current);
		}
	} else {
		if (Vertex_move_enabled) { // move vertex
			// check for same svg id
			if (svgid != Vertex_current.getSvgid()) {
				alert('You must not move a vertex to a different svg image.');
				Vertex_clickedID = null;
				return;
			}
			// check for too close vertices
			var vertexarray = Vertex_container.getAll();
			for ( var i = 0, v = vertexarray[i]; i < vertexarray.length; v = vertexarray[++i]) {
				// only check in same level
				if (v.getSvgid() != Vertex_current.getSvgid())
					continue;

				// ignore vertex itselfe
				if (v.getId() == Vertex_current.getId())
					continue;

				var distance = parseInt(Math.sqrt(Math.pow(v.getX() - posX, 2)
						+ Math.pow(v.getY() - posY, 2)), 10);
				if (distance < G.vertex_minDistance) {
					alert('This site is too near to an existing vertex!');
					Vertex_clickedID = null;
					return;
				}
			}
			Vertex_current.setXY(posX, posY);
		} else { // select vertex
			if (document.getElementById('vertex_details').style.display != 'block') {
				// update details
				vertex_select(Vertex_container.get(Vertex_clickedID));
			}
		}
	}
	Vertex_clickedID = null;
}

function vertex_save() {
	"use strict";
  if(Vertex_current == null)
    return;
	Vertex_current.setShortDesc(document.getElementById('vertex_sdesc').value);
	Vertex_current.setLongDesc(document.getElementById('vertex_ldesc').value);
	Vertex_current.setPoi(document.getElementById('vertex_poi').checked);
	vertex_deselect();
}

function vertex_select(vertex) {
	"use strict";
	Vertex_current = vertex;
	document.getElementById('vertex_default').style.display = 'none';
	document.getElementById('vertex_details').style.display = 'block';
	document.getElementById('vertex_poi').checked = Vertex_current.getPoi();
	document.getElementById('vertex_ldesc').value = Vertex_current
			.getLongDesc();
	document.getElementById('vertex_sdesc').value = Vertex_current
			.getShortDesc();
	if (Vertex_current.getCategory() != null) {
		document.getElementById('vertex_category').innerHTML = 'Category: '
				+ Vertex_current.getCategory().getName();
		document.getElementById('vertex_delete_category').style.display = 'block';
	} else {
		document.getElementById('vertex_category').innerHTML = 'Category: no';
		document.getElementById('vertex_delete_category').style.display = 'none';
	}
	Vertex_current.paint_active();

	// show category menu
	var p = document.getElementById('vertex_new_category');

	var categorylist = Category_container.getAll();
	if (categorylist.length != 0) {
		var htmlstring = "";
		for ( var i = 0, c = categorylist[i]; i < categorylist.length; c = categorylist[++i]) {
			htmlstring += '<option value=\'' + c.getId() + '\'>' + c.getName()
					+ '</option>';
		}

		p.innerHTML = '<form id=\'vertex_category_form\'><select name=\'category\' size=\'1\' onchange=\'vertex_setCategory2(this.form.category.options[this.form.category.selectedIndex].value)\'>'
				+ htmlstring + '</select></form>';

	} else {
		p.innerHTML = 'No categories available.';
	}
}

function vertex_deselect() {
	"use strict";
	vertex_move_off();
	if (Vertex_current != null) {
		Vertex_current.paint();
		Vertex_current = null;
	}

	document.getElementById('vertex_details').style.display = 'none';
	document.getElementById('vertex_default').style.display = 'block';
}

function vertex_delete() {
	"use strict";
  if(Vertex_current == null)
    return;
	Vertex_current.remove();
	Vertex_current = null;
	vertex_deselect();
}

function vertex_close() {
	"use strict";
	vertex_deselect();
	G.menu_current = null;
  Vertex_current = null;

	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].removeEventListener('mousemove', vertex_mousemove,
				false);
		G.svg_element[i].removeEventListener('click', vertex_click, false);
    removeEventListener('keydown', vertex_keypress, false);
    G.svg_element[i].removeEventListener('keydown', vertex_keypress, false);
	}

	document.getElementById('vertex_default').style.display = 'none';
	document.getElementById('vertex').style.display = 'none';
}

function vertex_color() {
	"use strict";
	if (Vertex_current != null) {
		if (document.getElementById('vertex_poi').checked) {
			Vertex_current.getShape().setAttribute('fill', 'black');
		} else {
			Vertex_current.getShape().setAttribute('fill', 'grey');
		}
	}
}

function vertex_move_on() {
	"use strict";
	Vertex_move_enabled = true;
	document.getElementById('vertex_move_on').style.display = 'none';
	document.getElementById('vertex_move_off').style.display = '';
}

function vertex_move_off() {
	"use strict";
	Vertex_move_enabled = false;
	document.getElementById('vertex_move_on').style.display = '';
	document.getElementById('vertex_move_off').style.display = 'none';
}

function vertex_setCategory() {
	"use strict";
	vertex_setCategory2(document.getElementById('vertex_category_form').category.options[document
			.getElementById('vertex_category_form').category.selectedIndex].value);
}

function vertex_setCategory2(categoryid) {
	"use strict";

	var category = Category_container.get(categoryid);

	Vertex_current.setCategory(category);
	document.getElementById('vertex_category').innerHTML = 'Category: '
			+ Vertex_current.getCategory().getName();

	document.getElementById('vertex_delete_category').style.display = 'block';
}

function vertex_deleteCategory() {
	"use strict";

	Vertex_current.setCategory(null);
	document.getElementById('vertex_category').innerHTML = 'Category: no';
	document.getElementById('vertex_delete_category').style.display = 'none';
}