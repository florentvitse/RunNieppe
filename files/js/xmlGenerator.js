function CreateXMLDoc () {
    if (document.implementation.createDocument && 
        document.implementation.createDocumentType) {
        
        var currentdate = new Date(); 
        var datetime = currentdate.getFullYear() + "-"
                + ("0" + (currentdate.getMonth() +　1)).slice(-2) + "-" 
                + currentdate.getDate() + "T"  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds() + ".000Z";

        var headXMLDoc = '<?xml version="1.0" encoding="utf-8"?><gpx version="1.1" creator="RunNieppe"><metadata><time>' + datetime + '</time></metadata><trk><trkseg></trkseg></trk></gpx>';

        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(headXMLDoc, "application/xml");

        //var xmlDoc = document.implementation.createDocument ("", "root", null);

        /* EXAMPLE */

        /*
        <trkpt lon="2.849621" lat="50.710483">
            <ele>0.0</ele>
        </trkpt> */


        /*var fruitNode = xmlDoc.createElement("fruit");
        fruitNode.setAttribute("name" , "avocado");
        xmlDoc.documentElement.appendChild(fruitNode);*/
        
        var serializer = new XMLSerializer();
        alert (serializer.serializeToString (xmlDoc));
    } else {
        alert ("Your browser does not support this example");
    }
}