/* GLOBALES VARIABLES */
var map = null;
var nbPushpins = 0;
var totalDistance = 0;
var pushpinLocation = new Array();
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
                  pushpinLocation.push( e.target.tryPixelToLocation(point) );
                  //addHTMLPushpin(calculateDistance(lastPushpinLocation, loc));
                  addPushpin(pushpinLocation[nbPushpins]);
              }
            }
    );

    // Add a handler to function that will change 
    // other pins in the collection when a new one is added
    //Microsoft.Maps.Events.addHandler(map.entities, 'entityadded', changePins);

    // Add a handler to function that will restore 
    // a default pin when a new one is removed in the collection 
    //Microsoft.Maps.Events.addHandler(map.entities, 'entityremoved', changeLastPin);
}

function addPushpin(param) 
{
	// Add a pin to the map
    nbPushpins++;
    var pin = new Microsoft.Maps.Pushpin(param, {text: nbPushpins.toString()}); 
    //Microsoft.Maps.Events.addHandler(pin, 'rightclick', deletePushpin);
    // Add the pin
    map.entities.push(pin);
    // Add the line between the last two
    /*if(nbPushpins > 1) { 
        map.getCredentials(function(credentials) {
            callRestService(credentials, param);
        }); 
    }*/

    // Center the map on the location
    map.setView({center: param});

    // FOR ACCESSING ALL THE LOCATION WITH NO ARRAY RETAINED
    for (i = 0; i < nbPushpins; i++) 
    {
        alert(map.entities.get(i).getLocation());                      
    }
}

function deletePushpin(e)
{
    if(parseInt(e.target.getText()) === nbPushpins)
    {
        nbPushpins--;
        map.entities.removeAt(nbPushpins);
        switch(nbPushpins)
        {
            case 0 :
                lastPushpinLocation = null;
                break;
            case 1 :
                totalDistance = 0;
                lastPushpinLocation = map.entities.get(0).getLocation();
                break;
            default :
                totalDistance -= calculateDistance(map.entities.get(nbPushpins - 1).getLocation(), map.entities.get(nbPushpins - 2).getLocation()); 
                lastPushpinLocation = map.entities.get(nbPushpins - 1).getLocation();
                break;
        }
        //removeHTMLPushpin();
        map.setView({center: lastPushpinLocation});
    }
}

/* HAVERSINE FORMULA */

function calculateDistance(locationStart, locationEnd)
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
    if(nbPushpins > 0) {
        map.entities.get(nbPushpins - 1).setOptions({ icon: "images/default_pushpin.png" });
    }
}


/********* RECUPERATION ITINERAIRE ENTRE DEUX POINTS PLACÉS **********/

function callRestService(credentials, param) 
{
    var routeRequest = "http://dev.virtualearth.net/REST/v1/Routes?wp.0="
                        + lastPushpinLocation.latitude + "," + lastPushpinLocation.longitude + 
                        "&wp.1=" + param.latitude + "," + param.longitude + 
                        "&routePathOutput=Points&output=json&jsonp=RouteCallback&key=AsA8oS2mP9AjL-xXtE6TK_oDzrrzZV9_5IB4-8cWYfis6CrFTCwukZia0lT-3CZ0";

    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", routeRequest);
    alert(routeRequest);
    document.body.appendChild(script);
}

function RouteCallback(result) {
                          
    if (result &&
       result.resourceSets &&
       result.resourceSets.length > 0 &&
       result.resourceSets[0].resources &&
       result.resourceSets[0].resources.length > 0) {
       
         // Set the map view
         //var bbox = result.resourceSets[0].resources[0].bbox;
         //var viewBoundaries = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(bbox[0], bbox[1]), new Microsoft.Maps.Location(bbox[2], bbox[3]));
         //map.setView({ bounds: viewBoundaries});


         // Draw the route
         var routeline = result.resourceSets[0].resources[0].routePath.line;
         //var routepoints = new Array();
         
         for (var i = 0; i < routeline.coordinates.length; i++) {

             routepoints.push( new Microsoft.Maps.Location(routeline.coordinates[i][0], routeline.coordinates[i][1]) );
         }

         
         // Draw the route on the map
         var routeshape = new Microsoft.Maps.Polyline(routepoints, {strokeColor:new Microsoft.Maps.Color(200,0,0,200)});
         if(nbPushpins === 2) { map.entities.push(routeshape); }
         
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