function createGPXFile () {
    /*if (document.implementation.createDocument && 
        document.implementation.createDocumentType) {*/
        
        var currentdate = new Date(); 
        var datetime = currentdate.getFullYear() + "-"
                + ("0" + (currentdate.getMonth() +　1)).slice(-2) + "-" 
                + currentdate.getDate() + "T"  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds() + ".000Z";

        var XMLDoc = '<?xml version="1.0" encoding="utf-8"?><gpx version="1.1" creator="RunNieppe"><metadata><time>' + datetime + '</time></metadata><trk><trkseg>';

        /* EXAMPLE */

        //XMLDoc += '<trkpt lat="50.710483" lon="2.849621"></trkpt>';
        $(routepoints).each(function(index, value) {

        });


        /*var fruitNode = xmlDoc.createElement("fruit");
        fruitNode.setAttribute("name" , "avocado");
        xmlDoc.documentElement.appendChild(fruitNode);*/

        XMLDoc += '</trkseg></trk></gpx>';

        /* APPROCHE DOM 
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(XMLDoc, "application/xml");
        var serializer = new XMLSerializer();
        alert(serializer.serializeToString(xmlDoc));*/ 

        /* APPROCHE BLOB */

        var data = new Blob([XMLDoc], {type : 'text/xml'}); 

        // Creation of the clickself link
        var a = document.createElement("a");
        a.style = "display: none";
        a.href = window.URL.createObjectURL(data);   
        a.download = "Nom_dy_fichier_date.gpx";
        // Add to the DOM - (Necessary for Firefox)
        document.body.appendChild(a);
        a.click();
        //Remove from the DOM
        a.remove();  

        /* SUPPORT OF IE, LATER */
        //window.navigator.msSaveBlob(data, "Nom_dy_fichier_date.gpx");   
    /*} else {
        alert ("Your browser does not support this example");
    }*/
}