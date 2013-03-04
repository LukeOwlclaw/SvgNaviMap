function IDSet() {
	"use strict";
	var array = new Array();
	var nextid = 0;

	this.get = function(id) {
		"use strict";
		var left = 0;
		var right = array.length - 1;

		while (left <= right) {
			var pivot = left + Math.ceil((right - left) / 2);

			if (array[pivot].getId() == id)
				return array[pivot];
			else if (array[pivot].getId() < id)
				left = pivot + 1;
			else
				right = pivot - 1;
		}

		return null;

	};

	this.remove = function(id) {
		"use strict";
		var left = 0;
		var right = array.length - 1;

		while (left <= right) {
			var pivot = left + Math.ceil((right - left) / 2);

			if (array[pivot].getId() == id) {
				var ret = array[pivot];
				array.splice(pivot, 1);

				if (pivot < nextid)
					nextid = pivot;

				return ret;
			} else if (array[pivot].getId() < id)
				left = pivot + 1;
			else
				right = pivot - 1;
		}

		return null;
	};

	this.add = function(element) {
		"use strict";
		if (this.isEmpty()) {
			array.push(element);
			return element;
		}

		var left = 0;
		var right = array.length - 1;

		while ((right - left) > 1) {
			var pivot = left + Math.ceil((right - left) / 2);
			if (array[pivot].getId() == element.getId()) {
				G.log('Can not save two entries with the same id '
						+ element.getId() + '.');
				return null;
			}

			if (array[pivot].getId() < element.getId()) {
				left = pivot;
			} else {
				right = pivot;
			}
		}

		var insert = null;

		if (array[left].getId() > element.getId()) {
			insert = left;
		} else if (array[right].getId() < element.getId()) {
			insert = right + 1;
		} else {
			insert = right;
		}

		var lhs = array.slice(0, insert);
		var rhs = array.slice(insert);
		lhs.push(element);
		array = lhs.concat(rhs);

		return element;
	};

	this.getAll = function() {
		"use strict";
		return array;
	};

	this.isEmpty = function() {
		"use strict";
		return (array.length == 0);
	};

	this.getUnusedId = function() {
		"use strict";
		var i = nextid;
		while (i < array.length && array[i].getId() == i)
			i++;

		nextid = i;
		return i;
	};
}