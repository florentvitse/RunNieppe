var map = null;
var nbPushpins = 1;

function getMap()
{
	var mapOptions = {
						credentials: "AsA8oS2mP9AjL-xXtE6TK_oDzrrzZV9_5IB4-8cWYfis6CrFTCwukZia0lT-3CZ0",
						center: new Microsoft.Maps.Location(50.69752, 2.86048),
                        mapTypeId: Microsoft.Maps.MapTypeId.aerial,
                        zoom: 16
                     }

	map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), mapOptions);

	/* TO SET BOUNDARIES ON VIEWING THE MAP */
	
	//var viewBoundaries = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(50.87140, 2.46893),new Microsoft.Maps.Location(50.88889, 3.43453), new Microsoft.Maps.Location(50.49507, 3.43557));
    //map.setView({ bounds: viewBoundaries});

    // 50.87140, 2.46893
    // 50.88889, 3.43453 
    // 50.49507, 3.43557
    // 50.48198, 2.41089
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