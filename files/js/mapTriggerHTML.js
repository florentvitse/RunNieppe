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

        $(".progress .progress-bar").each(function(i) {
            switch(i) 
            {
                case 0 :
                    percent = Math.ceil((totalDistance / 5000) * 100);
                    if(percent > 100) {
                        percent = 100;
                        $(this).removeClass("active");
                    } 
                    $(this).attr('data-transitiongoal', percent);
                    break;
                case 1 :
                    percent = Math.ceil((totalDistance / 10000) * 100);
                    if(percent > 100) {
                        percent = 100;
                        $(this).removeClass("active");
                    } 
                    $(this).attr('data-transitiongoal', percent);
                    break;
                case 2 : 
                    percent = Math.ceil((totalDistance / 15000) * 100);
                    if(percent > 100) {
                        percent = 100;
                        $(this).removeClass("active");
                    } 
                    $(this).attr('data-transitiongoal', percent);
                    break;
            }
        })
        $(".progress .progress-bar").progressbar();
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