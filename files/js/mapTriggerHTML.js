function formateDistance(dist)
{
    if(dist < 1000) {
        return (dist + ' m');
    } else {
        return ((dist / 1000).toFixed(2) + ' km');
    }
}

function formateDistanceMiles(dist)
{
    if(dist < 1609) {
        return ( ((dist * 0.621371192).toFixed(0) / 1000) + ' mi');
    } else {
        return ( ((dist * 0.621371192) / 1000).toFixed(2) + ' mi');
    }
}

function addHTMLPushpin(number, distance, buckled)
{
    var percent;
    var classTextOne = "interval-text",
        classTextTwo = "interval-text";
    var nextNumber = number;
    if(distance > 0) {
        if(number > 9) {
            if(number === 10)
            {
                classTextTwo = "interval-text-supten";
            } else {
                classTextOne = classTextTwo = "interval-text-supten";
            }
        } 
        if(buckled) { 
            classTextTwo = "interval-text"; 
            nextNumber = 1;
        }

        $("#table_distance tr:last").after('<tr><td class="interval-pushpin interval-pushpin-deb"><span class="' + classTextOne + '"><b>' 
                                            + (number - 1) + 
                                            '</b></span></td><td class="interval-pushpin interval-pushpin-end"><span class="' + classTextTwo + '"><b>' 
                                            + nextNumber + 
                                            '</b></span></td><td><img class="pull-right" src="images/path.png"/><span class="pull-right" style="position: relative; top: 20px; left: 130px;">' 
                                            + formateDistance(distance) + '</span></td></tr><br><br>');
        
        $("#total_distance").text(formateDistance(totalDistance));
        $("#total_distance_miles").text(formateDistanceMiles(totalDistance));
        updateProgressBar();
        updateActionButtons(number);
    }
}

function removeHTMLPushpin(number)
{
    $("#total_distance").text(formateDistance(totalDistance));
    $("#total_distance_miles").text(formateDistanceMiles(totalDistance));
    
    if(number > 0) {
        $("#table_distance tr:last").remove();
    } 
    if(number === 1) {
        $(".panel-body").slideUp();
        $("#intervalTrigger").toggleClass("glyphicon-chevron-up");
        $("#intervalTrigger").toggleClass("glyphicon-chevron-down");
    }
    updateActionButtons(number);
    updateProgressBar();
}

function updateProgressBar()
{
    var labelBar = $(".labelBar").get();
    var arrayBar = $(".progress .progress-bar").get();
    var arrayDistance = [5000, 10000, 15000, 21000, 30000, 42195];
    var arrayDistanceMiles = [3.1, 6.2, 9.3, 13.1, 18.6, 26.2];
    var distTest = 0;
     
    // Determination de la plus grande distance à afficher tant que l'on est inférieur à celle-ci   
    while((distTest < arrayDistance.length - 3) && (totalDistance > arrayDistance[distTest + 1]))
    {
        distTest++;
    }

    // Affichage des barres correspondantes avec les ratios associés
    for (key in arrayBar) {

        $(labelBar[key]).text((arrayDistance[distTest + parseInt(key)] / 1000) + " km / " + arrayDistanceMiles[distTest + parseInt(key)] + " mi");

        percent = Math.ceil((totalDistance / arrayDistance[distTest + parseInt(key)]) * 100);
        if(percent > 99.99) {
            percent = 100;
            $(arrayBar[key]).removeClass("active").removeClass("progress-bar-striped");
        } else {
            $(arrayBar[key]).addClass("active").addClass("progress-bar-striped");
        }
        $(arrayBar[key]).attr('data-transitiongoal', percent).progressbar();
    }
}

$('#loopTrack').click(function() {
    if( $('#loopTrack').attr("data-enableloop") === "true"){
        $('#loopTrack').attr("data-enableloop", false);
        $('#loopTrack').text("Débouclez le parcours");
        buckleTrack();
    } else {
        $('#loopTrack').attr("data-enableloop", true);
        $('#loopTrack').text("Bouclez le parcours");
        unBuckleTrack();
    }
});

function updateActionButtons(num)
{
    if(num > 1)
    {
        $('#loopTrack').css('display', 'block');
        $('#dlGPXTrack').css('display', 'block');
    } else {
        $('#loopTrack').css('display', 'none');
        $('#dlGPXTrack').css('display', 'none');
    }
}

$('#dlGPXTrack').click(function() {
    createGPXFile();
});