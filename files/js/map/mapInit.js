/* GLOBALES VARIABLES */
var map = null;
var currentLocation = null;
var nbPushpins = 1;

/* FUNCTIONS */

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
    Microsoft.Maps.Events.addHandler(map, 'click', function(e) 
            {
              if (e.targetType == "map") {
                  var point = new Microsoft.Maps.Point(e.getX(), e.getY());
                  var loc = e.target.tryPixelToLocation(point);
                  addPushpin(loc);
              }
            }
    );
}

function getCurrentLocation()
{
    var geoLocationProvider = new Microsoft.Maps.GeoLocationProvider(map);  

    geoLocationProvider.getCurrentPosition({ successCallback: function(e)  
      {
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
    var pin = new Microsoft.Maps.Pushpin(param, {text: nbPushpins.toString()}); 
    nbPushpins++;
    map.entities.push(pin);

    // Center the map on the location
    map.setView({center: param});
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
