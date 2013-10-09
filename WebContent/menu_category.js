function category_open() {
	"use strict";
	G.menu_current = 'category';
	document.getElementById('category').style.display = 'block';

	category_display();
}

function category_close() {
	"use strict";
	G.menu_current = null;
	document.getElementById('category').style.display = 'none';
}

function category_add() {
	"use strcit";

	var cname = prompt('Please enter the name of the new category',
			'new category');
	if (cname != null && cname != '' && cname != 'new category') {
		new Category(Category_container.getUnusedId(), cname);

		category_display();
	}
}

function category_delete() {
	"use strcit";

	var categorylist = Category_container.getAll();
	for ( var i = 0, c = categorylist[i]; i < categorylist.length; c = categorylist[++i]) {
		var div = document.getElementById('category_' + c.getId());

		if (div.checked) {
			c.remove();
		}
	}

	category_display();
}

function category_display() {
	"use strict";

	var categorylist = Category_container.getAll();
	var htmlstring = "";
	for ( var i = 0, c = categorylist[i]; i < categorylist.length; c = categorylist[++i]) {
		htmlstring += '<input id=\'category_' + c.getId()
				+ '\' type=\'checkbox\' >' + c.getName()
				+ '   <a href="javascript:category_changeName(' + c.getId()
				+ ');">change name</a> <br>';
	}
	document.getElementById('category_current').innerHTML = htmlstring;

	if (Category_container.getAll().length == 0) {
		document.getElementById('category_delete').style.display = 'none';
	} else {
		document.getElementById('category_delete').style.display = 'block';
	}
}

function category_changeName(categoryid) {
	"use strict";

	var category = Category_container.get(categoryid);

	var name = prompt('Please enter the new name for the new category',
			category.getName());
	if (name != null && name != '' && name != 'new category'
			&& name != category.getName()) {
		category.setName(name);

		category_display();
	}
}