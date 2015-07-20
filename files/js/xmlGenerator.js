function createGPXFile () {       
    var currentdate = new Date(); 
    var datetime = currentdate.getFullYear() + "-"
            + ("0" + (currentdate.getMonth() +　1)).slice(-2) + "-" 
            + currentdate.getDate() + "T"  
            + currentdate.getHours() + ":"  
            + currentdate.getMinutes() + ":" 
            + currentdate.getSeconds() + ".000Z";

    var XMLDoc = '<?xml version="1.0" encoding="utf-8"?>\r\n<gpx version="1.1" creator="RunNieppe">\r\n\t'
                + '<metadata>\r\n\t\t'
                + '<time>' 
                + datetime 
                + '</time>\r\n\t</metadata>\r\n\t'
                + '<trk>\r\n\t\t'
                + '<name>RunNieppe_Track_c_' + datetime + '</name>\r\n\t\t'
                + '<trkseg>\r\n\t\t\t';

    // Add of the points used to draw the Polyline
    $(routepoints).each(function(index, value) {
        XMLDoc += '<trkpt lat="' + value.latitude + '" lon="' + value.longitude + '">' 
               + '\r\n\t\t\t\t<ele>0</ele>\r\n\t\t\t\t<time>0000-00-00T00:00:00Z</time>\r\n\t\t\t</trkpt>\r\n\t\t\t';
    });

    XMLDoc += '\r\n\t\t</trkseg>\r\n\t</trk>\r\n</gpx>';

    /* APPROCHE DOM 
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(XMLDoc, "application/xml");
    var serializer = new XMLSerializer();
    alert(serializer.serializeToString(xmlDoc));
    */ 

    /* APPROCHE BLOB */    
    var data = new Blob([XMLDoc], {type : 'text/xml'}); 

    var ua = window.navigator.userAgent;
    
    // Test for MSIE x.x - IE
    if (~ua.indexOf('MSIE ') || ~ua.indexOf('Trident/')) 
    { 
        window.navigator.msSaveBlob(data, 'RunNieppe_Track_c_' + datetime + '.gpx');
    } else {
        // Creation of the clickself link
        var a = document.createElement("a");
        a.style = "display: none";
        a.href = window.URL.createObjectURL(data);   
        a.download = 'RunNieppe_Track_c_' + datetime + '.gpx';
        // Append to the DOM - (Mandatory for Firefox)
        document.body.appendChild(a);
        a.click();
        //Remove from the DOM
        a.remove();  
    }
}