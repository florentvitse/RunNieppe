/* GLOBALES VARIABLES */
var map = null;
var nbPushpins = 0;

var totalDistance = 0;
var lastPushpinLocation = null;

var currentLocation = null;

var directionsManager = null;

/* FUNCTIONS */

// Add the method toRad() to the JS Class Number
Number.prototype.toRad = function() { return this * (Math.PI / 180); };

function getMap()
{
	var mapOptions = {
						credentials: "AsA8oS2mP9AjL-xXtE6TK_oDzrrzZV9_5IB4-8cWYfis6CrFTCwukZia0lT-3CZ0",
						center: new Microsoft.Maps.Location(50.69752, 2.86048),
                        mapTypeId: Microsoft.Maps.MapTypeId.aerial,
                        zoom: 16,
                        showDashboard: false,
                        enableSearchLogo: false
                     }

	map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), mapOptions);

    /* A TESTER SUR ORDI PERSO */
    //getCurrentLocation();

    /* EVENTS */
    Microsoft.Maps.Events.addHandler(map, 'dblclick', 
            function(e) {
                e.handled = true;
            }
    );

    Microsoft.Maps.Events.addHandler(map, 'click', 
            function(e) {
              if (e.targetType == "map") {
                  var point = new Microsoft.Maps.Point(e.getX(), e.getY());
                  var loc = e.target.tryPixelToLocation(point);
                  addHTMLDiffPushpin(calculateDistance(lastPushpinLocation, loc));
                  addPushpin(loc);
                  
                  //createDirections(loc);
              }
            }
    );
}

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

function addPushpin(param)
{
	// Add a pin to the map
    nbPushpins++;
    var pin = new Microsoft.Maps.Pushpin(param, {text: nbPushpins.toString()}); 
    Microsoft.Maps.Events.addHandler(pin, 'rightclick', deletePushpin);
    map.entities.push(pin);
    lastPushpinLocation = param;

    // Center the map on the location
    map.setView({center: param});
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
        updateDisplayAfterRemoval();
    }
}

function addPolygon(arrayOfLocations, color)
{
	// Create a polygon 
    var polygon = new Microsoft.Maps.Polygon(arrayOfLocations, 
    										{fillColor: color,
    										 strokeColor: color} );
    // Add the polygon to the map
    map.entities.push(polygon);
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

function addHTMLDiffPushpin(distance)
{
    var percent;

    if(distance > 0) {
        $("#table_distance tr:last").after("<tr><td>" + nbPushpins + "</td><td>" + (nbPushpins + 1) + "</td><td>" + distance.toFixed(2) + " m</td></tr>");
        if(totalDistance < 1000) {
            $("#total_distance").text(totalDistance.toFixed(2) + ' m');
        } else {
            $("#total_distance").text((totalDistance / 1000).toFixed(2) + ' km');
        }

        $(".progress").each(function(i) {
            switch(i) 
            {
                case 0 :
                    percent = Math.ceil((totalDistance / 5000) * 100);
                    $(this).css("width", percent + '%');
                    break;
                case 1 :
                    percent = Math.ceil((totalDistance / 10000) * 100);
                    $(this).css("width", percent + '%');
                    break;
                case 2 : 
                    percent = Math.ceil((totalDistance / 15000) * 100);
                    $(this).css("width", percent + '%');
                    break;
            }
            //$( this ).toggleClass( "example" );
        })
    }
}

function updateDisplayAfterRemoval()
{
    if(nbPushpins > 0) {
        if(totalDistance < 1000) {
            $("#total_distance").text(totalDistance.toFixed(2) + ' m');
        } else {
            $("#total_distance").text((totalDistance / 1000).toFixed(2) + ' km');
        }
        $("#table_distance tr:last").remove();
    }
}






/* DIRECTION SUIVANT LA ROUTE (BUG PRESENT) */

function createDirectionsManager()
{
    if (!directionsManager) 
    {
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
    }
    directionsManager.resetDirections();


    //directionsErrorEventObj = Microsoft.Maps.Events.addHandler(directionsManager, 'directionsError', function(arg) { alert("Impossible de calculer le trajet") });
    //directionsUpdatedEventObj = Microsoft.Maps.Events.addHandler(directionsManager, 'directionsUpdated', function() { alert("Trajet mis à jour") });
}
      
function createWalkingRoute(param)
{

    if (!directionsManager) {
        createDirectionsManager();
    }
    directionsManager.resetDirections();
    
    // Set Route Mode to walking 
    directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.walking });
    //var start = new Microsoft.Maps.Directions.Waypoint({ location: new Microsoft.Maps.Location(50.69907, 2.86194) });
    var start = new Microsoft.Maps.Directions.Waypoint({ location: lastPushpinLocation });
    directionsManager.addWaypoint(start);
    //var end = new Microsoft.Maps.Directions.Waypoint({ location: new Microsoft.Maps.Location(50.70075, 2.86389) });
    var end = new Microsoft.Maps.Directions.Waypoint({ location: param });
    directionsManager.addWaypoint(end);
    
    // Set the element in which the itinerary will be rendered
    //directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('directionsItinerary') });
    directionsManager.calculateDirections();

}

function createDirections(param)
{
    if(nbPushpins != 1) {
        if (!directionsManager)
        {
          Microsoft.Maps.loadModule('Microsoft.Maps.Directions', { callback: createWalkingRoute(param) });
        }
        else
        {
          createWalkingRoute();
        }
    }
}