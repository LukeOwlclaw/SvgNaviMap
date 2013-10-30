//  Set of functions for project management
function open_project_menu(){
	"use strict";
	G.menu_current = 'new_project';
	document.getElementById('new_project').style.display = 'block';
	document.getElementById("files_input").addEventListener('change', handleFileSelect, false);
}

function close_project_menu(){
	"use strict";
	G.menu_current = null;
	document.getElementById('new_project').style.display = 'none';
	document.getElementById("files_input").removeEventListener('change', handleFileSelect, false);
	document.getElementById("files_input").value='';
	document.getElementById("display_svg").innerHTML=null;
}

function create_project(){
	"use strict";
	var files = document.getElementById("files_input").files
	var project_name = document.getElementById('fname').value + ".xml";
	var level = new Array();
	var minHeight = new Array();
	var maxHeight = new Array()
	
	for(var i =0;  document.getElementById("level"+i)!=null; i++){
	
		level.push(document.getElementById("level"+i).value);
		minHeight.push(document.getElementById("min"+i).value);
		maxHeight.push(document.getElementById("max"+i).value);
		
	}
	
	var xml_file = generate_xml_base(project_name,files,level,minHeight,maxHeight);
	//G.log("level:"+level + " min:" +minHeight +" max:" +maxHeight);
	
	jQuery.ajax({
		url:'./data/'+project_name,
		type: 'PUT',
		data: xml_file,
		error: function(response) {
			G.log("Error: " + response);
			}
	 });
	 
	for(var i=0; i<files.length ;i++){
		upload_svg(files[i]);
	}
	
	G.getAvailableXmlFiles(add_project);
}

function add_project(availableXmlFiles){
	"use strict";
	var tmp = document.getElementById('fname').value;
	availableXmlFiles.push(tmp + ".xml");
	G.putAvailableXmlFiles(availableXmlFiles);
	
	

}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
      output.push('Level: ','<input type="number" id="level',i,'" size="2">',
					' Min height: ','<input type="number" id="min',i,'" size="2">',
					' Max height: ','<input type="number" id="max',i,'" size="2">',	
					'<br><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
					f.size, ' bytes, last modified: ',
					f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
					'<br>');
    }
    document.getElementById("display_svg").innerHTML = '<ul>' + output.join('') + '</ul>';
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

function generate_xml_base(file_name,files,level,minheight,maxheight){

	var file_content="";
	file_content = file_content.concat('<!-- '+file_name+' -->\r\n');
	file_content = file_content.concat('<svgmap-data>\r\n');
	

	file_content = file_content.concat('\t<levels>\r\n');
	for ( var i = 0; i < files.length; i++) {

		var min = minheight[i];
		var max = maxheight[i];
		var svgpath = files[i].name;

		file_content = file_content.concat('\t\t<level>\r\n');
		file_content = file_content.concat('\t\t\t<id>' + level[i] + '</id>\r\n');
		file_content = file_content.concat('\t\t\t<svgpath>' + svgpath + '</svgpath>\r\n');
		file_content = file_content.concat('\t\t\t<min_altitude>' + min + '</min_altitude>\r\n');
		file_content = file_content.concat('\t\t\t<max_altitude>' + max + '</max_altitude>\r\n');
		file_content = file_content.concat('\t\t</level>\r\n');
	}
	file_content = file_content.concat('\t</levels>\r\n');
	file_content = file_content.concat('</svgmap-data>\r\n');
	file_content = file_content.concat('<!-- EOF -->\r\n');
	return file_content;
}

function upload_svg(file) {

	var filename = "./data/"+file.name;
	var r = new FileReader();
	r.onload = function(e) { 
		var contents = e.target.result;
			jQuery.ajax({
			url:filename,
			type: 'PUT',
			data: contents,
			error: function(response) {
				G.log("Error: " + response);
				}
			});	
	}
	r.readAsText(file);
}