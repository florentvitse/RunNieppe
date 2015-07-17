/* GLOBALES VARIABLES */
var map = null;
var clickHandlerId;
var totalDistance = 0;
var distance = 0;
var routepoints = new Array();
var buckledUp = false;
var currentLocation = null;

/* FUNCTIONS */

// Add the method toRad() to the JS Class Number
Number.prototype.toRad = function() { return this * (Math.PI / 180); };

function getMap()
{
	var _mapOptions = {
						credentials: "AsA8oS2mP9AjL-xXtE6TK_oDzrrzZV9_5IB4-8cWYfis6CrFTCwukZia0lT-3CZ0",
						center: new Microsoft.Maps.Location(50.69752, 2.86048),
                        mapTypeId: Microsoft.Maps.MapTypeId.aerial,
                        zoom: 15,
                        showDashboard: false,
                        enableSearchLogo: false
                     }

	map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), _mapOptions);

    /* WORKS, A TESTER SUR ORDI PERSO */
    /*if(map != null)
    {
        getCurrentLocation();
        map.setView({ center: currentLocation, zoom: 15 });
    }*/

    /* EVENTS */

    // Deactivation of double click for zooming
    Microsoft.Maps.Events.addHandler(map, 'dblclick', 
            function(e) {
                e.handled = true;
            }
    );

    addClickHandler();

    // Add a handler to function that will change 
    // other pins in the collection when a new one is added
    Microsoft.Maps.Events.addHandler(map.entities, 'entityadded', changePins);

    // Add a handler to function that will restore 
    // a default pin for the one before last when the last is removed
    Microsoft.Maps.Events.addHandler(map.entities, 'entityremoved', changeLastPin);
}

function addClickHandler()
{
    clickHandlerId = Microsoft.Maps.Events.addHandler(map, 'click', 
        function(e) {
            if (e.targetType == "map") {
                var _point = new Microsoft.Maps.Point(e.getX(), e.getY());
                var _loc = e.target.tryPixelToLocation(_point) ;
                map.getCredentials(function(credentials) { callRestService(credentials, _loc); } ); 
            }
        }
    );
}

function addPushpin(param) 
{
    _pushpinOpt = {text: (map.entities.getLength() + 1).toString() };
    if(buckledUp) { 
        _pushpinOpt['visible'] = false; 
    }
    // Add the pin to the map
    var _pin = new Microsoft.Maps.Pushpin(param, _pushpinOpt); 
    Microsoft.Maps.Events.addHandler(_pin, 'rightclick', deletePushpin);
    map.entities.push(_pin);
    // Center the map on the location
    map.setView({center: param});
}

function deletePushpin(e)
{
    var _nbPush = map.entities.getLength() - 1;
    if(parseInt(e.target.getText()) == _nbPush)
    {
        // We gonna start a new line
        map.entities.removeAt(_nbPush); 
        map.entities.removeAt(_nbPush - 1); 
        _nbPush--;

        if(_nbPush > 1) {
            deleteAutoService();
        } else { 
            // Center the view on the previous pushpin
            if(_nbPush === 1) {
                routepoints = new Array();
                map.entities.get(0).setOptions({ icon: "images/default_pushpin.png" });

                // Center the view on the previous pushpin
                var _loc = map.entities.get(0).getLocation();
                map.setView({center: new Microsoft.Maps.Location(_loc.latitude, _loc.longitude) }); 
            }
            totalDistance = 0; 
            removeHTMLPushpin(map.entities.getLength());
        } 
    } else {
        if(_nbPush === 0)
        {
            map.entities.clear();
        }
    }
}

function changePins(e)
{
    var _lastEntityString = map.entities.get(map.entities.getLength() - 1).toString();
    if(_lastEntityString === "[Pushpin]") {
        var _nbPush = map.entities.getLength();
        if(_nbPush > 1) {
            for (i = 0; i < _nbPush - 1; i++) 
            {
                map.entities.get(i).setOptions({ icon: "images/blue_pushpin.png" });                      
            }
        }
    }
}

function changeLastPin()
{
    //alert("changeLastPin : " + map.entities.getLength());
    var _nbPush = map.entities.getLength();
    if(_nbPush > 1) {
        map.entities.get(_nbPush - 1).setOptions({ icon: "images/default_pushpin.png" });
    } 
}

/********* RECUPERATION ITINERAIRE ENTRE DEUX POINTS PLACÉS **********/

function callRestService(credentials, param) 
{   
    var _nbPush = map.entities.getLength();
    if(_nbPush != 0) {
        if(_nbPush > 1) {
            // Removal of the Polyline of Map's entities
            map.entities.removeAt(_nbPush - 1); 
            _nbPush--;
        }

        var _routeRequest = "http://dev.virtualearth.net/REST/v1/Routes/Walking?wp.0=";

        // Add the waypoints for the route, lastPushpin present on the map and where we just clicked
        var _loc = map.entities.get((_nbPush - 1)).getLocation();
        _routeRequest += _loc.latitude + ',' + _loc.longitude + "&wp.1=";   
        _routeRequest += parseFloat(param.latitude.toFixed(6)) + ',' + parseFloat(param.longitude.toFixed(6));   

        _routeRequest += "&routePathOutput=Points&output=json&jsonp=RouteCallback&key=" + credentials;

        // Add the script to the page for evaluation
        var _script = document.createElement("script");
        _script.setAttribute("type", "text/javascript");
        _script.setAttribute("src", _routeRequest);
        document.body.appendChild(_script);
        _script.remove();
    } else {
        addPushpin(new Microsoft.Maps.Location( parseFloat(param.latitude.toFixed(6)), parseFloat(param.longitude.toFixed(6)) ) );
    }
}

// Evaluate the script and fetching data
function RouteCallback(result) {
                          
    if (result &&
        result.resourceSets &&
        result.resourceSets.length > 0 &&
        result.resourceSets[0].resources &&
        result.resourceSets[0].resources.length > 0) {

        // Add the new points on the route
        var _routeline = result.resourceSets[0].resources[0].routePath.line;
        // It's the first line that we draw
        
        if(map.entities.getLength() == 1) {
            map.entities.clear();
            var _locFirstPoint = new Microsoft.Maps.Location(_routeline.coordinates[0][0], _routeline.coordinates[0][1]);
            addPushpin(_locFirstPoint); 
            routepoints.push(_locFirstPoint);    
        }

        var i;
        // Add of each calculated points 
        // (The first is the last end point from the previous track so we do nothing)
        for (i = 1; i < _routeline.coordinates.length; i++) {
            routepoints.push(new Microsoft.Maps.Location(_routeline.coordinates[i][0], _routeline.coordinates[i][1]));
        }
         
        // Add of the Pushpin
        distance = result.resourceSets[0].resources[0].travelDistance * 1000;
        addPushpin(new Microsoft.Maps.Location(_routeline.coordinates[i - 1][0], _routeline.coordinates[i - 1][1])); 
        totalDistance += distance;
        addHTMLPushpin(map.entities.getLength(), distance, buckledUp);

        // Re-Add of the Polyline on the Map
        map.entities.push( new Microsoft.Maps.Polyline(routepoints, {strokeColor: new Microsoft.Maps.Color(200, 0, 0, 200)} ) );     
     }
}

function deleteAutoService()
{
    var _nb = routepoints.length;
    var _loc = map.entities.get(map.entities.getLength() - 1).getLocation();
    // We remove all the points backward to the next to last
    while(!Microsoft.Maps.Location.areEqual(routepoints[_nb - 1], _loc))
    {
        routepoints.pop();
        _nb--;
    }

    // Redraw the full route on the map
    totalDistance -= distance;
    map.entities.push( new Microsoft.Maps.Polyline(routepoints, {strokeColor:new Microsoft.Maps.Color(200, 0, 0, 200)} ) );  

    removeHTMLPushpin(map.entities.getLength());

    map.setView({center: _loc });   
}

function buckleTrack()
{
    buckledUp = true;
    Microsoft.Maps.Events.removeHandler(clickHandlerId);
    var _loc = map.entities.get(0).getLocation();
    map.getCredentials(function(credentials) { callRestService(credentials, _loc); } ); 
}

function unBuckleTrack()
{
    buckledUp = false;
    var _nbPush = map.entities.getLength() - 1;
    // We gonna start a new line
    map.entities.removeAt(_nbPush); 
    map.entities.removeAt(_nbPush - 1); 

    deleteAutoService();

    addClickHandler();
}

/* HAVERSINE FORMULA */

/*function calculateBirdDistance(locationStart, locationEnd)
{
    if(locationStart != null) {
        // Earth Radius
        var earthRadius = 6378100; // in meters
        var dLat = (locationEnd.latitude - locationStart.latitude).toRad();
        var dLon = (locationEnd.longitude - locationStart.longitude).toRad();

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(locationStart.latitude.toRad()) * Math.cos(locationEnd.latitude.toRad()); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = earthRadius * c;
        
        totalDistance += d;
        return d;
    } else {
        return 0;
    }
}*/