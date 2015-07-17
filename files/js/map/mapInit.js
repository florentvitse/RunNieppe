/* GLOBALES VARIABLES */
var map = null;
var clickHandlerId;
var firstDelete = false;
var totalDistance = 0;
var routepoints = new Array();
var buckledUp = false;
var currentLocation = null;

/* FUNCTIONS */

// Add the method toRad() to the JS Class Number
Number.prototype.toRad = function() { return this * (Math.PI / 180); };

function getMap()
{
	var mapOptions = {
						credentials: "AsA8oS2mP9AjL-xXtE6TK_oDzrrzZV9_5IB4-8cWYfis6CrFTCwukZia0lT-3CZ0",
						center: new Microsoft.Maps.Location(50.69752, 2.86048),
                        mapTypeId: Microsoft.Maps.MapTypeId.aerial,
                        zoom: 15,
                        showDashboard: false,
                        enableSearchLogo: false
                     }

	map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), mapOptions);

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

    // Add a handler to function that add a pushpin when click
    clickHandlerId = Microsoft.Maps.Events.addHandler(map, 'click', 
        function(e) {
            if (e.targetType == "map") {
                var point = new Microsoft.Maps.Point(e.getX(), e.getY());
                var loc = e.target.tryPixelToLocation(point) ;
                map.getCredentials(function(credentials) { callRestService(credentials, loc); } ); 
            }
        }
    );

    // Add a handler to function that will change 
    // other pins in the collection when a new one is added
    Microsoft.Maps.Events.addHandler(map.entities, 'entityadded', changePins);

    // Add a handler to function that will restore 
    // a default pin for the one before last when the last is removed
    Microsoft.Maps.Events.addHandler(map.entities, 'entityremoved', changeLastPin);
}

function addPushpin(param) 
{
    pushpinOpt = {text: (map.entities.getLength() + 1).toString() };
    if(buckledUp) { pushpinOpt['visible'] = false; }
    // Add the pin to the map
    var pin = new Microsoft.Maps.Pushpin(param, pushpinOpt); 
    Microsoft.Maps.Events.addHandler(pin, 'rightclick', deletePushpin);
    map.entities.push(pin);
    // Center the map on the location
    map.setView({center: param});
}

function deletePushpin(e)
{
    var nbPush = map.entities.getLength() - 1;
    if(parseInt(e.target.getText()) == nbPush)
    {
        // We gonna start a new line
        map.entities.removeAt(nbPush); 
        map.entities.removeAt(nbPush - 1); 
        nbPush--;
        routepoints = new Array();

        if(nbPush > 1) {
            map.getCredentials(callDeleteRestService); 
        } else { 
            // Center the view on the previous pushpin
            if(nbPush === 1) {
                // Center the view on the previous pushpin
                map.entities.get(0).setOptions({ icon: "images/default_pushpin.png" });
                var loc = map.entities.get(0).getLocation();
                map.setView({center: new Microsoft.Maps.Location(loc.latitude, loc.longitude) }); 
            }
            totalDistance = 0; 
            removeHTMLPushpin(map.entities.getLength());
        } 
    } else {
        if(nbPush === 0)
        {
            map.entities.clear();
        }
    }
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

function changePins(e)
{
    var lastEntityString = map.entities.get(map.entities.getLength() - 1).toString();
    if(lastEntityString === "[Pushpin]") {
        var nbPush = map.entities.getLength();
        if(nbPush > 1) {
            for (i = 0; i < nbPush - 1; i++) 
            {
                map.entities.get(i).setOptions({ icon: "images/blue_pushpin.png" });                      
            }
        }
    }
}

function changeLastPin()
{
    //alert("changeLastPin : " + map.entities.getLength());
    var nbPush = map.entities.getLength();
    if(nbPush > 1) {
        map.entities.get(nbPush - 1).setOptions({ icon: "images/default_pushpin.png" });
    } 
}

/********* RECUPERATION ITINERAIRE ENTRE DEUX POINTS PLACÉS **********/

function callRestService(credentials, param) 
{   
    var nbPush = map.entities.getLength();
    if(nbPush != 0) {
        if(nbPush > 1) {
            // Removal of the Polyline of Map's entities
            map.entities.removeAt(nbPush - 1); 
            nbPush = map.entities.getLength();
        }

        var routeRequest = "http://dev.virtualearth.net/REST/v1/Routes/Walking?wp.0=";

        // Add the waypoints for the route, lastPushpin present on the map and where we just clicked
        var loc = map.entities.get((nbPush - 1)).getLocation();
        routeRequest += loc.latitude + ',' + loc.longitude + "&wp.1=";   
        routeRequest += parseFloat(param.latitude.toFixed(6)) + ',' + parseFloat(param.longitude.toFixed(6));   

        routeRequest += "&routePathOutput=Points&output=json&jsonp=RouteCallback&key=" + credentials;

        // Add the script to the page for evaluation
        var script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", routeRequest);
        document.body.appendChild(script);
        script.remove();
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
        var routeline = result.resourceSets[0].resources[0].routePath.line;
        // It's the first line that we draw
        
        if(map.entities.getLength() == 1) {
            map.entities.clear();
            var locFirstPoint = new Microsoft.Maps.Location(routeline.coordinates[0][0], routeline.coordinates[0][1]);
            addPushpin(locFirstPoint); 
            routepoints.push(locFirstPoint);    
        }

        var i;
        // Add of each calculated points 
        // (The first is the last end point from the previous track so we do nothing)
        for (i = 1; i < routeline.coordinates.length; i++) {
            routepoints.push(new Microsoft.Maps.Location(routeline.coordinates[i][0], routeline.coordinates[i][1]));
        }
         
        // Redraw the full route on the map
        var routeshape = new Microsoft.Maps.Polyline(routepoints, {strokeColor: new Microsoft.Maps.Color(200, 0, 0, 200)} );

        // Add of the Pushpin
        var distance = result.resourceSets[0].resources[0].travelDistance * 1000;
        addPushpin(new Microsoft.Maps.Location(routeline.coordinates[i - 1][0], routeline.coordinates[i - 1][1])); 
        totalDistance += distance;
        addHTMLPushpin(map.entities.getLength(), distance, buckledUp);

        // Re-Add of the Polyline on the Map
        map.entities.push(routeshape);     
     }
}

function callDeleteRestService(credentials) 
{   
    var routeRequest = "http://dev.virtualearth.net/REST/v1/Routes/Walking?";

    // Add all the waypoints (ndlr. Pushpins on the Map) on route
    for (i = 0; i < map.entities.getLength(); i++) 
    {
        loc = map.entities.get(i).getLocation();
        routeRequest += "wp." + i + '=' + loc.latitude + ',' + loc.longitude + '&';                 
    }
    routeRequest += "routePathOutput=Points&output=json&jsonp=DeleteRouteCallback&key=" + credentials;

    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", routeRequest);
    document.body.appendChild(script);
    script.remove();
}

function DeleteRouteCallback(result) {
                          
    if (result &&
        result.resourceSets &&
        result.resourceSets.length > 0 &&
        result.resourceSets[0].resources &&
        result.resourceSets[0].resources.length > 0) {

        // Add the new points on the route
        var routeline = result.resourceSets[0].resources[0].routePath.line;

        var i = 0;
        // Add of each calculated points
        for (i = 0; i < routeline.coordinates.length; i++) {
            routepoints.push( new Microsoft.Maps.Location(routeline.coordinates[i][0], routeline.coordinates[i][1]) );
        }
         
        // Redraw the full route on the map
        totalDistance = result.resourceSets[0].resources[0].travelDistance * 1000;
        var routeshape = new Microsoft.Maps.Polyline(routepoints, {strokeColor:new Microsoft.Maps.Color(200, 0, 0, 200)} );
        map.entities.push(routeshape);  

        removeHTMLPushpin(map.entities.getLength());

        map.setView({center: new Microsoft.Maps.Location(routeline.coordinates[i - 1][0], routeline.coordinates[i - 1][1]) });   
     }
}

function getCurrentLocation()
{
    var geoLocationProvider = new Microsoft.Maps.GeoLocationProvider(map);  

    geoLocationProvider.getCurrentPosition({ successCallback: 
        function(e) {
            geoLocationProvider.removeAccuracyCircle()
            currentLocation = e.center
            //alert("Localiser aux coordonées suivantes\nLat : " + currentLocation.latitude + "\nLong : " + currentLocation.longitude);
      }, enableHighAccuracy: true, maximumAge: 0 
    }); 
}

function buckleTrack()
{
    Microsoft.Maps.Events.removeHandler(clickHandlerId);
    var loc = map.entities.get(0).getLocation();
    buckledUp = true;
    map.getCredentials(function(credentials) { callRestService(credentials, loc); } ); 
}

function unBuckleTrack()
{
    var nbPush = map.entities.getLength();
    buckledUp = false;
    // We gonna start a new line
    map.entities.removeAt(nbPush); 
    map.entities.removeAt(nbPush - 1); 
    routepoints = new Array();

    map.getCredentials(callDeleteRestService); 
    // Re-Add a handler to function that add a pushpin when click
    clickHandlerId = Microsoft.Maps.Events.addHandler(map, 'click', 
            function(e) {
              if (e.targetType == "map") {
                    var point = new Microsoft.Maps.Point(e.getX(), e.getY());
                    var loc = e.target.tryPixelToLocation(point) ;
                    map.getCredentials(function(credentials) { callRestService(credentials, loc); } ); 
              }
            }
    );
}