function GetMap()
{
	var mapOptions = {
						credentials: "AsA8oS2mP9AjL-xXtE6TK_oDzrrzZV9_5IB4-8cWYfis6CrFTCwukZia0lT-3CZ0",
						mapTypeId: Microsoft.Maps.MapTypeId.aerial
					 }

	var map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), mapOptions);
}
