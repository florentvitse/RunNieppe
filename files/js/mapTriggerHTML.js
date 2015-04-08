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
    var labelBar = $(".labelBar").get();
    var arrayBar = $(".progress .progress-bar").get();
    var arrayDistance = [5000, 10000, 15000, 21000, 30000, 42195];
    var distTest = 0;
       
    while((distTest < arrayDistance.length - 3) && (totalDistance > arrayDistance[distTest + 1]))
    {
        distTest++;
    }


    // Start in the array of distance
    alert(distTest);
    //alert($(labelBar[key]).text());

    for (key in arrayBar) {

        percent = Math.ceil((totalDistance / arrayDistance[key]) * 100);
        if(percent > 100) {
            percent = 100;
            $(arrayBar[key]).removeClass("active");
        } 
        $(arrayBar[key]).attr('data-transitiongoal', percent).progressbar();
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