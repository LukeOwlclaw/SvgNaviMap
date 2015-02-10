# SvgNaviMap

Connect an SVG map with navigational information to allow routing. Intended for indoor navigation based on existing maps.

### What is it?

SvgNaviMap is an SVG-based map technology for indoor localization and navigation.
Using the SvgNaviMap editor new maps can be created. All that is needed are SVG files from a building - one per level.
Afterwards, a routing graph can be created on top of the map. The graph is stored in an XML, the SVG files stay untouched.
The routing graph consists of vertices (one or more per room) and edges indicating passageways. Edges can be added with parameters, e.g., one-way-only or marking it as wheelchair-accessible.
Based on the graph directions between any two vertices can be calculated and visualized.
Further, affiliation areas can be set up - usually one per room. When a position inside this room is detected, the position (for routing) is projected to the affiliated vertex in that room.
Last, GPS markers are used to map the SVG map onto GPS coordinates.

After a map is created it can be exported to the provided Android app. With it a wifi fingerprint database can be created which is used localization. (details see Usage)
For localization the machine learning algorithm Random Forest is used. The app uses internally Weka (http://sourceforge.net/projects/weka/); wifi fingerprints are thus stored in a Weka-readable file format, named ARFF. Localization is thus performed offline without any additional server.

All software provided here is known to be in a bad shaped, ill-structured, and massively buggy. It thus comes without any warranty or support. It is rarely meant as proof of concept and starting point for new projects.

### Licensing

#### Free Software

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.

#### Licensing options

If you are planning to integrate SvgNaviMap (or parts of it) into a commercial product, please contact us for licensing options.


### Usage

#### Webserver
* Windows users run startserver.cmd.
* On other systems, make sure you've installed nodejs, then execute ``node webserver.js``.
* Missing packages are installed using: npm install <package_name>

#### Edit
* Go to http://localhost:8888/editorsView.html
* Import XML from server
* Edit using GUI
* Use the save button in the main menu to save it directly to the server
* Use the new project menu to create new projects (svg must be already created)
* Alternately, export and save to data/svgmap-data.xml (add entry to global.js to be able to load project later)

#### View

##### Browser
* Go to http://localhost:8888/usersView.html

##### Android
* At first start, scan the qrcode at http://localhost:8888/ to update the html and js files (top right button in the app).
* You can now load your project by scanning the qrcode in the export tab of the project inside editor.
* To enable learning mode for wifi fingerprints, click the crosshair with the question mark. Now go into a room and click on the corresponding vertex on the map. Each time you click a wifi fingerprint is recorded.
* Next, disable learning mode (click crosshair again) and enable localization mode by clicking the compass needle (top left). Then use the position marker symbol (between needle and crosshair) to perform a new localization while you walk through the rooms that were previously learned.
* To upload the fingerprint database (in ARFF format), make sure you are connected to the webserver, and click "Upload wifi scans (arff)". It is stored in SvgNaviMap\WebContent\data\.

### Issues


This software is currently a proof of concept. It certainly needs improvement.


### Other

The German Federal Ministry of Education and Research, under funding code 03CL26B, supported the research of this project.