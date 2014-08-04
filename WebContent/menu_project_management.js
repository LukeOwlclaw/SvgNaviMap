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
	var project_name = document.getElementById('fname').value;
	
	if(!isAlphanumeric(project_name)){
		alert("Invalid project name! Use only 0-9 a-z A-Z");
		return;
	}
	
;	var level = new Array();
	var minHeight = new Array();
	var maxHeight = new Array()
	var levelName = new Array()
	
	for(var i =0;  document.getElementById("levelname"+i)!=null; i++){
		level.push(i);
		var tmp=document.getElementById("levelname"+i).value;
		levelName.push(tmp);
		tmp=document.getElementById("min"+i).value;
		if(!isNumeric(tmp)){
			alert("Invalid minHeight! Numeric entry only!")
			return;
		}
		minHeight.push(tmp);
		tmp=document.getElementById("max"+i).value;
		if(!isNumeric(tmp)){
			alert("Invalid maxHeight! Numeric entry only!")
			return;
		}
		maxHeight.push(tmp);
	}
	
	var xml_file = generate_xml_base(project_name.concat(".xml"),files,level,levelName,minHeight,maxHeight);
	// G.log("level:"+level + " min:" +minHeight +" max:" +maxHeight);
	
	jQuery.ajax({
		url:'/projects/new/'+project_name.concat(".xml"),
		type: 'PUT',
		data: xml_file,
		dataType: 'application/xml',
		error: function(response) {
			G.log("Error: " + response);
		}
	 });
	 
	for(var i=0; i<files.length ;i++){
		upload_svg(project_name, files[i]);
	}
	
	G.getAvailableXmlFiles(add_project);
}

function add_project(availableXmlFiles){
	"use strict";
	var tmp = document.getElementById('fname').value;
	availableXmlFiles.push(tmp + ".xml");
	close_project_menu();
	import_open();
	//G.putAvailableXmlFiles(availableXmlFiles);
	
	

}

function handleFileSelect(evt) {

    var files = evt.target.files; // FileList object
	var msg="";
	var error
	for (var i = 0, f2; f2 = files[i]; i++) {
	
		if(f2.type != "image/svg+xml"){
			msg = msg.concat(escape(f2.name) +" is not an svg file!\r\n");
			error=true;
		}
	}
	if (error){
		alert(msg);				
		document.getElementById("files_input").value='';
		document.getElementById("display_svg").innerHTML=null;
		return;
	}
	
    // files is a FileList of File objects. List some properties.
    var output = [];
	

    for (var i = 0, f; f = files[i]; i++) {

		output.push('Level: ','<b>',i,'</b><br>',
					'LevelName: ','<input id="levelname',i,'"><br>',
					' Min height: ','<input type="number" id="min',i,'" size="2"><br>',
					' Max height: ','<input type="number" id="max',i,'" size="2"><br>',	
					'<strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
					f.size, ' bytes, last modified: ',
					f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
					'<br><br>');
    }
    document.getElementById("display_svg").innerHTML = '<ul>' + output.join('') + '</ul>';
  }

function save_xml(){
	//save using old format which can be loaded.
	save_xml_internal(false, true);
	//additionally save in new format which BlissSvgNaviMap expects.
	save_xml_internal(true, true);
}  
 
/**
useRedundantBorderpointFormat: set to true to use old format. if set to false, xml file is saved as .xml.new
useLongXmlTags: using short XML tags reduces file size to ~1/3
*/ 
function save_xml_internal(useRedundantBorderpointFormat, useLongXmlTags){
	"use strict";
	
	var fileExtension = ".xml";
	if(useRedundantBorderpointFormat == false) {
		fileExtension = ".xml.new";
	}
	
	var file_content=get_xml_data(useRedundantBorderpointFormat, useLongXmlTags);
	var project_name = G.getXmlFilename().substr(0, G.getXmlFilename().lastIndexOf('.'));
	
	var xml_path_url='/projects/'+project_name+'/upload/'+ project_name + fileExtension;
	jQuery.ajax({
		url: xml_path_url,
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

function generate_xml_base(file_name,files,level,levelname,minheight,maxheight){

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
		file_content = file_content.concat('\t\t\t<name>' + levelname[i] + '</name>\r\n');
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

function upload_svg(project_name, file) {

	var filename = "/projects/"+project_name+"/upload/"+file.name;
	var r = new FileReader();
	r.onload = function(e) { 
		var contents = e.target.result;
			jQuery.ajax({
				url: filename,
				type: 'PUT',
				data: contents,
				dataType: 'image/svg+xml',
				error: function(response) {
					G.log("Error: " + response);
				}
			});	
	}
	r.readAsText(file);
}

function isNumeric(number){
	var numericExpression = /^[0-9]+$/;
	if(number.match(numericExpression)){
		return true;
	}else{
		return false;
	}
}
function isAlphanumeric(string){
	var alphaExp = /^[0-9a-zA-Z]+$/;
	if(string.match(alphaExp)){
		return true;
	}else{
		return false;
	}
}