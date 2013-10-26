//  Set of functions for project management
function open_project_menu(){
	"use strict";
	G.menu_current = 'new_project';
	document.getElementById('new_project').style.display = 'block';
	//document.getElementById('files').addEventListener('change', load_from_client_xml, false);
}

function close_project_menu(){
	"use strict";
	G.menu_current = null;
	document.getElementById('new_project').style.display = 'none';
	//document.getElementById('files').removeEventListener('change', load_from_client_xml, false);
}

function create_project(){
	"use strict";
	alert(document.getElementById('files').value);
	G.getAvailableXmlFiles(add_project);
}

function add_project(availableXmlFiles){
	"use strict";
	var tmp = document.getElementById('fname').value
	availableXmlFiles.push(tmp + ".xml");
	G.putAvailableXmlFiles(availableXmlFiles);
}

function save_xml(){
	"use strict";
	var file_content=get_xml_data();
	var xml_path_url='./data/' + G.getXmlFilename();
	jQuery.ajax({
				url:xml_path_url,
				type: 'PUT',
				dataType: 'text',
				data: file_content,
				success: function(response) {
						alert(response);
						},
				error: function(xhr, status, error) {
					alert(xhr.responseText);
					}
				});
}