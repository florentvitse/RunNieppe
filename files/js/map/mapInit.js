function getMap()
{
	var mapOptions = {
						credentials: "AsA8oS2mP9AjL-xXtE6TK_oDzrrzZV9_5IB4-8cWYfis6CrFTCwukZia0lT-3CZ0",
						center: new Microsoft.Maps.Location(50.69752, 2.86048),
                        mapTypeId: Microsoft.Maps.MapTypeId.aerial,
                        zoom: 16
                     }

	var map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), mapOptions);

	return map;

	/* TO SET BOUNDARIES ON VIEWING THE MAP */
	
	//var viewBoundaries = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(47.618594, -122.347618), new Microsoft.Maps.Location(47.620700, -122.347584), new Microsoft.Maps.Location(47.622052, -122.345869));
    //map.setView({ bounds: viewBoundaries});
}

function addPushpin(map, param)
{
	// Add a pin to the map
    var pin = new Microsoft.Maps.Pushpin(param); 
    map.entities.push(pin);

    // Center the map on the location
    map.setView({center: param});
}
