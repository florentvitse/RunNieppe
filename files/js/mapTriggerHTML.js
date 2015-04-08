function addHTMLPushpin(distance)
{
    var percent;

    if(distance > 0) {
        $("#table_distance tr:last").after("<tr><td>" + nbPushpins + "</td><td>" + (nbPushpins + 1) + "</td><td>" + distance.toFixed(2) + " m</td></tr>");
        if(totalDistance < 1000) {
            $("#total_distance").text(totalDistance.toFixed(2) + ' m');
        } else {
            $("#total_distance").text((totalDistance / 1000).toFixed(2) + ' km');
        }
        updateProgressBar();
    }
}

function updateProgressBar()
{
    var arrayBar = $(".progress .progress-bar").get();
    var DISTANCE = 5000;

    for (key in arrayBar) {
        percent = Math.ceil((totalDistance / DISTANCE) * 100);
        if(percent > 100) {
            percent = 100;
            $(arrayBar[key]).removeClass("active");
        } 
        $(arrayBar[key]).attr('data-transitiongoal', percent).progressbar();
        DISTANCE += 5000;
    }
}

function removeHTMLPushpin()
{
    if(nbPushpins > 0) {
        if(totalDistance < 1000) {
            $("#total_distance").text(totalDistance.toFixed(2) + ' m');
        } else {
            $("#total_distance").text((totalDistance / 1000).toFixed(2) + ' km');
        }
        $("#table_distance tr:last").remove();
        updateProgressBar();
    } 
    if(nbPushpins === 1) {
        $(".progress .progress-bar").attr('data-transitiongoal', 0).progressbar();
    }
}