function createGPXFile () {       
    var currentdate = new Date(); 
    var datetime = currentdate.getFullYear() + "-"
            + ("0" + (currentdate.getMonth() +　1)).slice(-2) + "-" 
            + currentdate.getDate() + "T"  
            + currentdate.getHours() + ":"  
            + currentdate.getMinutes() + ":" 
            + currentdate.getSeconds() + ".000Z";

    var XMLDoc = '<?xml version="1.0" encoding="utf-8"?><gpx version="1.1" creator="RunNieppe"><metadata><time>' + datetime + '</time></metadata><trk><trkseg>';

    // Add of the points used to drew the Polyline
    $(routepoints).each(function(index, value) {
        XMLDoc += '<trkpt lat="' + value.latitude + '" lon="' + value.longitude + '"></trkpt>';
    });

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
}