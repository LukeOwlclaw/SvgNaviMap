/**
 * IDSet contains any kind of elements identified by this.getId = function() which is an integer.
 * getUnusedId() returns the next free ID.
 */
function IDSet() {
	"use strict";
	var array = new Array();
	
	this.get = function(id) {
		var element = array[id];
		if(element == undefined)
			return null;
		else
			return element;		
	};

	this.remove = function(id) {
		var from = id;
		var to = id+1;
		var rest = array.slice((to || from) + 1 || array.length);
		array.length = from < 0 ? array.length + from : from;
	  return array.push.apply(array, rest);
		  		  
	};

	this.add = function(element) {
		"use strict";
		
		//array.length only works if index is integer
		if(! (element.getId() > -1))
		{
			G.log('ID must be greater than -1 (thus not a string) instead it is: ' + element.getId());
			return null;
		}
		
		
		if(array[element.getId()] != undefined){
			G.log('Cannot save two entries with the same id '
					+ element.getId() + '.');
			return null;
		}
		
		array[element.getId()] = element;

		return element;
	};

	this.getAll = function() {
		return array;
	};

	this.isEmpty = function() {
		return (array.length == 0);
	};

	this.getUnusedId = function() {
		return array.length;
	};
}