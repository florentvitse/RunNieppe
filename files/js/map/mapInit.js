/* GLOBALES VARIABLES */
var map = null;
var nbPushpins = 0;
var totalDistance = 0;
var routepoints = new Array();

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

    /* A TESTER SUR ORDI PERSO */
    //getCurrentLocation();

    /* EVENTS */

    // Desactivation of double click for zooming
    Microsoft.Maps.Events.addHandler(map, 'dblclick', 
            function(e) {
                e.handled = true;
            }
    );

    // Add a handler to function that add a pushpin when click
    Microsoft.Maps.Events.addHandler(map, 'click', 
            function(e) {
              if (e.targetType == "map") {
                    var point = new Microsoft.Maps.Point(e.getX(), e.getY());
                    var loc = e.target.tryPixelToLocation(point) ;
                    //addHTMLPushpin(calculateDistance(lastPushpinLocation, loc));
                    //addPushpin(loc);

                    map.getCredentials(function(credentials) { callRestService(credentials, loc); } ); 
              }
            }
    );

    // Add a handler to function that will change 
    // other pins in the collection when a new one is added
    Microsoft.Maps.Events.addHandler(map.entities, 'entityadded', changePins);

    // Add a handler to function that will restore 
    // a default pin when a new one is removed in the collection 
    Microsoft.Maps.Events.addHandler(map.entities, 'entityremoved', changeLastPin);
}

function addPushpin(param) 
{
    nbPushpins++;
    // Add the pin to the map
    var pin = new Microsoft.Maps.Pushpin(param, {text: nbPushpins.toString()}); 
    Microsoft.Maps.Events.addHandler(pin, 'rightclick', deletePushpin);
    map.entities.push(pin);
    // Center the map on the location
    map.setView({center: param});
}

function deletePushpin(e)
{
    if(parseInt(e.target.getText()) === nbPushpins)
    {
        if(nbPushpins === 1) {
            map.entities.clear();
            nbPushpins = 0;
            totalDistance = 0;
        } else {
            // We gonna start a new line
            if(nbPushpins === 2) { 
                routepoints = new Array();
            }
            map.entities.removeAt(nbPushpins); 
            map.entities.removeAt(nbPushpins - 1); 
            nbPushpins--;
            // Still more than two pushpins, we continue
            if(nbPushpins > 1) {
                map.getCredentials(callDeleteRestService);
            }
        }

        //removeHTMLPushpin();
    }
}

/* HAVERSINE FORMULA */

function calculateBirdDistance(locationStart, locationEnd)
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
}

function changePins(e)
{
    for (i = 0; i < nbPushpins - 1; i++) 
    {
        pin = e.collection.get(i);
        pin.setOptions({ icon: "images/blue_pushpin.png" });                      
    }
}

function changeLastPin()
{
    if(nbPushpins > 1) {
        map.entities.get(nbPushpins - 2).setOptions({ icon: "images/default_pushpin.png" });
    }
}


/********* RECUPERATION ITINERAIRE ENTRE DEUX POINTS PLACÉS **********/

function callRestService(credentials, param) 
{   
    if(nbPushpins != 0) {
        if(nbPushpins > 1) {
            map.entities.removeAt(nbPushpins); 
        }

        var routeRequest = "http://dev.virtualearth.net/REST/v1/Routes?wp.0=";

        var loc = map.entities.get((nbPushpins - 1)).getLocation();
        routeRequest += loc.latitude + "," + loc.longitude + "&wp.1=";   
        routeRequest += param.latitude + "," + param.longitude;   

        routeRequest += "&routePathOutput=Points&output=json&jsonp=RouteCallback&key=AsA8oS2mP9AjL-xXtE6TK_oDzrrzZV9_5IB4-8cWYfis6CrFTCwukZia0lT-3CZ0";

        var script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", routeRequest);
        document.body.appendChild(script);
    } else {
        addPushpin(param);
    }
}

function RouteCallback(result) {
                          
    if (result &&
        result.resourceSets &&
        result.resourceSets.length > 0 &&
        result.resourceSets[0].resources &&
        result.resourceSets[0].resources.length > 0) {

        // Add the new points on the route
        var routeline = result.resourceSets[0].resources[0].routePath.line;
        // It's the first line that we draw
        if(nbPushpins === 1) { 
            routepoints.push( new Microsoft.Maps.Location(routeline.coordinates[0][0], routeline.coordinates[0][1]) );
        }
        // Add of each calculated points
        for (i = 1; i < routeline.coordinates.length; i++) {
            routepoints.push( new Microsoft.Maps.Location(routeline.coordinates[i][0], routeline.coordinates[i][1]) );
        }
         
        // Redraw the full route on the map
        var routeshape = new Microsoft.Maps.Polyline(routepoints, {strokeColor:new Microsoft.Maps.Color(200, 0, 0, 200)} );

        // AJOUT PUSHPIN
        totalDistance += result.resourceSets[0].resources[0].travelDistance;
        alert( result.resourceSets[0].resources[0].travelDistance );
        addPushpin(new Microsoft.Maps.Location(routeline.coordinates[i - 1][0], routeline.coordinates[i - 1][1])); 
        map.entities.push(routeshape);     
     }
}

function callDeleteRestService(credentials) 
{   
    var routeRequest = "http://dev.virtualearth.net/REST/v1/Routes?wp.0=";

    var loc = map.entities.get(0).getLocation();
    routeRequest += loc.latitude + "," + loc.longitude + "&wp.1="; 
    var loc = map.entities.get(nbPushpins - 1).getLocation();  
    routeRequest += loc.latitude + "," + loc.longitude;   

    routeRequest += "&routePathOutput=Points&output=json&jsonp=DeleteRouteCallback&key=AsA8oS2mP9AjL-xXtE6TK_oDzrrzZV9_5IB4-8cWYfis6CrFTCwukZia0lT-3CZ0";

    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", routeRequest);
    document.body.appendChild(script);
}

function DeleteRouteCallback(result) {
                          
    if (result &&
        result.resourceSets &&
        result.resourceSets.length > 0 &&
        result.resourceSets[0].resources &&
        result.resourceSets[0].resources.length > 0) {

        // Add the new points on the route
        var routeline = result.resourceSets[0].resources[0].routePath.line;

        routepoints = new Array();
        // Add of each calculated points
        for (i = 0; i < routeline.coordinates.length; i++) {
            routepoints.push( new Microsoft.Maps.Location(routeline.coordinates[i][0], routeline.coordinates[i][1]) );
        }
         
        // Redraw the full route on the map
        totalDistance = result.resourceSets[0].resources[0].travelDistance;
        alert( result.resourceSets[0].resources[0].travelDistance );
        var routeshape = new Microsoft.Maps.Polyline(routepoints, {strokeColor:new Microsoft.Maps.Color(200, 0, 0, 200)} );
        map.entities.push(routeshape);  

        map.setView({center: new Microsoft.Maps.Location(routeline.coordinates[i][0], routeline.coordinates[i][1]) });   
     }
}


/**************** À TESTER ***********************/

function getCurrentLocation()
{
    var geoLocationProvider = new Microsoft.Maps.GeoLocationProvider(map);  

    geoLocationProvider.getCurrentPosition({ successCallback: 
        function(e) {
            geoLocationProvider.removeAccuracyCircle()
            currentLocation = e.center
            alert('Localisation ' + e.center);
            map.setView({zoom: 16})
      } 
    }); 
}