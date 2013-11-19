# SvgNaviMap

Connect an SVG map with navigational information to allow routing. Intended for indoor navigation based on existing maps.

------------------------

## Licensing

### Free Software

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.

### Licensing options

If you are planning to integrate SvgNaviMap into a commercial product, please contact us for licensing options.

------------------------

## Usage

### Webserver
* Windows users run startserver.cmd.
* On other systems, make sure you've installed nodejs, then execute ``node webserver.js``.

### Edit
* Go to http://localhost:8888/editorsView.html
* Import XML from server
* Edit using GUI
* Use the save button in the main menu to save it directly to the server
* Use the new project menu to create new projects (svg must be already created)
* Alternately, export and save to data/svgmap-data.xml (add entry to global.js to be able to load project later)

### View

#### Browser
* Go to http://localhost:8888/usersView.html

#### Android
* At first start, scan the qrcode at http://localhost:8888/ to update the html and js files (top right button in the app).
* You can now load your project by scanning the qrcode in the export tab of the project inside editor.

------------------------

## Issues


This software is currently a proof of concept. It certainly needs improvement.

------------------------

## Other

The German Federal Ministry of Education and Research, under funding code 03CL26B, supported the research of this project.