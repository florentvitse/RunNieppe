function formateDistance(param)
{
    if(param < 1000) {
        return (param.toFixed(2) + ' m');
    } else {
        return ((param / 1000).toFixed(2) + ' km');
    }
}

function addHTMLPushpin(distance)
{
    var percent;
    var classTextOne = "interval-text",
        classTextTwo = "interval-text";
    if(distance > 0) {
        if(nbPushpins > 8) {
            if(nbPushpins === 9)
            {
                classTextTwo = "interval-text-supten";
            } else {
                classTextOne = classTextTwo = "interval-text-supten";
            }
        } 

        $("#table_distance tr:last").after("<tr style=\"height: 50px;\"><td class=\"interval-pushpin interval-pushpin-deb\"><span class=\"" + classTextOne + "\"><b>" 
                                            + nbPushpins + 
                                            "</b></span></td><td class=\"interval-pushpin interval-pushpin-end\"><span class=\"" + classTextTwo + "\"><b>" 
                                            + (nbPushpins + 1) + 
                                            "</b></span></td><td>" + formateDistance(distance) + "</td></tr><br><br>");
        
        $("#total_distance").text(formateDistance(totalDistance));
        updateProgressBar();
    }
}

function updateProgressBar()
{
    var labelBar = $(".labelBar").get();
    var arrayBar = $(".progress .progress-bar").get();
    var arrayDistance = [5000, 10000, 15000, 21000, 30000, 42195];
    var distTest = 0;
     
    // Determination de la plus grande distance à afficher tant que l'on est inférieur à celle-ci   
    while((distTest < arrayDistance.length - 3) && (totalDistance > arrayDistance[distTest + 1]))
    {
        distTest++;
    }

    // Affichage des barres correspondantes avec les ratios associés
    for (key in arrayBar) {

        $(labelBar[key]).text((arrayDistance[distTest + parseInt(key)] / 1000) + " km");

        percent = Math.ceil((totalDistance / arrayDistance[distTest + parseInt(key)]) * 100);
        if(percent > 100) {
            percent = 100;
            $(arrayBar[key]).removeClass("active").removeClass("progress-bar-striped");
        } else {
            $(arrayBar[key]).addClass("active").addClass("progress-bar-striped");
        }
        $(arrayBar[key]).attr('data-transitiongoal', percent).progressbar();
    }
}

function removeHTMLPushpin()
{
    if(nbPushpins > 0) {
        $("#total_distance").text(formateDistance(totalDistance));
        $("#table_distance tr:last").remove();
        updateProgressBar();
    } 
    if(nbPushpins === 1) {
        $(".progress .progress-bar").attr('data-transitiongoal', 0).progressbar();
    }
}