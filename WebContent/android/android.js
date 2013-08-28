//called on page load
function init_custom() {
	"use strict";

	G.log("init_custom");

	G.log("time " + (log_time.length + 1) + " - SvgNaviMap init completed. Start loading SVG.");
	log_time.push(Date.now());

	showButtonsForSvg = false;

	// automatically, always start new cycle:
	if (localStorage.started == "false")
		localStorage.run = "NaN";

	localStorage.firstrun = 13;
	localStorage.lastrun = 13;
	// if lastrun >= minHistory, we are collecting history data. SVGs and not
	// rendered, XML not parsed. only big-date is served.
	localStorage.minHistory = 50;

	if (localStorage.run == undefined || localStorage.run == "NaN") {
		localStorage.run = localStorage.firstrun;
		localStorage.started = "true";
	}

	// default:
	var xmlfile = "minimal-data.xml";
	switch (localStorage.run) {
	case "1":
		xmlfile = "minimal-data.xml";
		break;
	case "2":
		xmlfile = "big-data.xml";
		break;

	case "3":
	case "4":
	case "5":
	case "6":
	case "7":
	case "8":
	case "9":
	case "10":
	case "11":
	case "12":
		xmlfile = "minimal-data.xml";
		break;

	case "13":
	case "14":
	case "15":
	case "16":
	case "17":
	case "18":
	case "19":
	case "20":
	case "21":
	case "22":
		xmlfile = "big-data.xml";
		break;
	}
	if (parseInt(localStorage.lastrun) >= parseInt(localStorage.minHistory))
		xmlfile = "big-data.xml";

	load_from_server_xml(overlay_init_completed, xmlfile);

}

function overlay_init_completed() {
	G.log("time " + (log_time.length + 1) + " - overlay completely rendered and shown.");
	log_time.push(Date.now());

	G.log("overlay_init_completed");

	/*
	 * var a = new Array(); var length = log_time.length; for ( var i = 1; i <
	 * length; i++) { first = log_time[i - 1]; second = log_time[i]; var text =
	 * (i) + " - " + (i + 1) + ";" + (second - first) + ""; text = (second -
	 * first); G.log(text);
	 * 
	 * var _div = document.createElement('div'); var _text =
	 * document.createTextNode(text) _div.appendChild(_text); a.push(_div); }
	 * 
	 * var length = a.length; for ( var i = length - 1; i >= 0; i--) { var _body =
	 * document.getElementsByTagName('body')[0]; _body.insertBefore(a[i],
	 * _body.firstChild); }
	 */

	G.timeEnd("everything");
	// G.timeEnd("fromParseXmlToEverythingEnd");

	G.log2("file:" + G.getXmlFilename());

	var ua = navigator.userAgent;
	var regex = /^[(\d+)\.]*/;

	var browser = "unknownBrowser";
	if (ua.indexOf("Android") >= 0) {
		var androidversion = regex.exec(ua.slice(ua.indexOf("Android") + 8))[0];
		// insert space in version field to avoid excel conversion to number
		// (4.1.1 --> 04.01.2001)
		G.log2("Version: " + androidversion);
		G.log2("OS:Android");
		browser = "Android";
	} else if (ua.indexOf("Chrome") >= 0) {
		var androidversion = regex.exec(ua.slice(ua.indexOf("Chrome") + 7))[0];
		G.log2("Version:" + androidversion);
		G.log2("OS:Chrome");
		browser = "Chrome";
	} else if (ua.indexOf("Firefox") >= 0) {
		var androidversion = regex.exec(ua.slice(ua.indexOf("Firefox") + 8))[0];
		G.log2("Version:" + androidversion);
		G.log2("OS:Firefox");
		browser = "Firefox";
	}

	var model = ua.substr(0, ua.indexOf("Build"));
	model = model.substr(model.lastIndexOf(";") + 1);
	model = model.replace(/^\s+|\s+$/g, '');

	model = model.replace(/[ ]+/g, '-');
	model = model.replace(/[_]+/g, '');

	if (model.length == 0)
		model = browser;

	if (parseInt(localStorage.lastrun) >= parseInt(localStorage.minHistory))
		model = "History" + model;

	G.log2("model:" + model);
	G.log2("appVersion:" + navigator.appVersion);
	G.log2("userAgent:" + navigator.userAgent);

	localStorage["log" + localStorage.run] = JSON.stringify(G.logObject);

	if (parseInt(localStorage.run) < parseInt(localStorage.lastrun)) {
		localStorage.run = parseInt(localStorage.run) + 1;
		window.location.reload();
	} else {

		var buttonnode = document.createElement('input');
		buttonnode.setAttribute('type', 'button');
		buttonnode.setAttribute('name', 'reset');
		buttonnode.setAttribute('value', 'clear localstorage');
		buttonnode.setAttribute('OnClick', "localStorage.clear();");
		if (document.body != null) {
			document.body.appendChild(buttonnode);
		}

		if (localStorage.started == "true") {
			localStorage.started = "false";
			var post = [];
			for ( var i = localStorage.firstrun; i <= localStorage.lastrun; i++) {
				var json = localStorage["log" + i];
				if (json == undefined)
					break;

				post.push(JSON.parse(json));

			}
			console.log("POST::" + JSON.stringify(post));
			var asyncXMLRequest = new XMLHttpRequest();
			asyncXMLRequest.open('POST', "/" + capitaliseFirstLetter(model) + ""
					+ capitaliseFirstLetter(G.compression == "deflate" ? "defl" : G.compression) + ".csv", false);
			asyncXMLRequest.setRequestHeader("Cache-Control", "no-cache");
			var data = new FormData();
			data.append('data', JSON.stringify(post));
			asyncXMLRequest.send(data);

			// if (window.location.href.indexOf("http://ohrt.org:3389") == 0)
			// setTimeout('window.location =
			// "http://ohrt.org:5222/android.html"', 5000);
			// else {
			// document.getElementById('location').innerHTML = "Test successful.
			// Data sent to server. Thanks for participating. Building SVG
			// overlay took in last run "
			// + JSON.parse(localStorage["log" +
			// localStorage.lastrun]).parseXmlAndBuildOverlay + " ms.";
			// }
			document.getElementById('location').innerHTML = "Test successful. Data sent to server. Thanks for participating. Building SVG overlay took in last run "
					+ JSON.parse(localStorage["log" + localStorage.lastrun]).parseXmlAndBuildOverlay + " ms.";

		}

	}
	// if (G.getXmlFilename() != "big-data.xml")
	// load_from_server_xml(overlay_init_completed, "big-data.xml");
}

function capitaliseFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// to be called after svg finished loading
// setting view for user. hiding unneeded fields, scaling SVG etc. Pretty quick.
function svg_init_custom() {

	// set visibilities
	for ( var i = 0; i < G.svg_element.length; i++) {
		if (G.svg_element[i] == undefined || G.svg_element[i] == null) {
			G.log("init_custom() failed. svg_element " + i + " not ready yet");
			return;
		}

		G.svg_element[i].getElementById('unit_edge').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_borderpoint').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_borderline').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_stepmarker').setAttribute('visibility', 'hidden');

		G.svg_element[i].getElementById('unit_gpsmarker').setAttribute('visibility', 'hidden');
	}

	// set size of svg images
	calcSvgSize();

	// set default level
	selectsvg(0);

	send_response("init completed");

	G.log("time " + (log_time.length + 1) + " SVG loaded and rendered.");
	log_time.push(Date.now());

}

function navigate(event) {
	"use strict";

	// repaint old routing destination
	if (Routing_destination != null) {
		Routing_destination.paint();
		Routing_destination = null;
	}

	if (Vertex_clickedID == null) {
		if (event == null) {
			G.log('navigate: event and Vertex_clickedID is null');
			return;
		}
		var posX = MZP.translateX(event);
		var posY = MZP.translateY(event);
		var svgid = G.getSvgId(event);
		var vertexarray = Vertex_container.getAll();
		for ( var i = 0, v = vertexarray[i]; i < vertexarray.length; v = vertexarray[++i]) {
			if (v.getPolygon() == null)
				continue;
			if (v.getSvgid() != svgid)
				continue;

			if (isPositionInPolygon(posX, posY, v.getPolygon())) {
				Routing_destination = v;
				break;
			}
		}
	} else {
		Routing_destination = Vertex_container.get(Vertex_clickedID);
	}

	if (Routing_destination == null) {
		G.log('navigate: no Routing_destination found');
		return;
	}

	Vertex_clickedID = null;
	Routing_destination.paint_destination();

	while (DijkstraArrows.length > 0) {
		(DijkstraArrows.shift()).remove();
	}

	for ( var i = 0; i < G.svg_element.length; i++) {
		G.svg_element[i].removeEventListener('click', navigate, false);
	}

	if (currLocation == null) {
		G.log('navigate: currLocation is null');
		return;
	}

	if (try_preRouting(currLocation, Routing_destination, Interface.disabledAdapted)
			|| dijkstra_reverse(currLocation, Routing_destination, Interface.disabledAdapted, true)) {

		Routing_disabledAdapted = Interface.disabledAdapted;

		// Interface.position_focus();

		send_response("route_success");
	} else {
		send_response("route_failed");
		Routing_destination.paint();
	}
}

function selectsvg(svgid) {
	"use strict";
	if (svgid == null || G.svg_parent[svgid] == undefined) {
		alert('Invalid svg level ' + svgid + ' selected. G.svg_parent[svgid]==' + G.svg_parent[svgid]);
		return;
	}

	for ( var i = 0; i < G.svg_parent.length; i++) {
		if (i == svgid) {
			if (G.svg_parent[i].style.display != "")
				G.svg_parent[i].style.display = '';
		} else {
			if (G.svg_parent[i].style.display != "none")
				G.svg_parent[i].style.display = 'none';
		}
	}
}

function calcSvgSize() {
	var ViewX = "0";
	var ViewY = "0";
	if (self.innerHeight && self.outerHeight) {
		if (self.innerHeight > self.outerHeight) {
			ViewX = self.innerWidth;
			ViewY = self.innerHeight;
		} else {
			ViewX = self.outerWidth;
			ViewY = self.outerHeight;
		}
	} else if (self.outerHeight) {
		ViewX = self.outerWidth;
		ViewY = self.outerHeight;
	} else if (self.innerHeight) {
		ViewX = self.innerWidth;
		ViewY = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) {
		ViewX = document.documentElement.clientWidth;
		ViewY = document.documentElement.clientHeight;
	} else if (document.body) {
		ViewX = document.body.clientWidth;
		ViewY = document.body.clientHeight;
	} else {
		alert('Can not estimate screen resolution!');
		ViewX = null;
		ViewY = null;
	}

	// console.log("calc svg size: " + self.innerWidth + " x " +
	// self.innerHeight + "; " + self.outerWidth + " x "
	// + self.outerHeight + "; " + document.documentElement.clientWidth + " x "
	// + document.documentElement.clientHeight + "; " +
	// document.body.clientWidth + " x "
	// + document.body.clientHeight + "; " + screen.width + " x " +
	// screen.height + "; "
	// + document.body.offsetWidth + " x " + document.body.offsetHeight + "; " +
	// document.body.scrollwidth + " x "
	// + document.body.scrollheight + "; ");

	if (ViewX != null && ViewY != null) {
		for ( var i = 0; i < G.svg_parent.length; i++) {
			// console.log('would set size of id ' + i);
			G.svg_parent[i].style.width = ViewX * 97 / 100 + "px";
			G.svg_parent[i].style.height = ViewY * 97 / 100 + "px";
		}
	}
}

function mlog(s) {
	"use strict";

	if (document.getElementById('log')) {
		document.getElementById('log').innerHTML = s + "<br>" + document.getElementById('log').innerHTML;
	}
}

function clearlog() {
	"use strict";

	if (document.getElementById('log'))
		document.getElementById('log').innerHTML = "log20";
}