<?php
    require('config.php');
    require('functions/getSunsetTime.php');
    require('functions/generateAvailableDates.php');

    if ($_GET['debug'] === 'true') { echo '<pre>'; }

    if ($_GET['last_date']) {
        $dates = generateAvailableDates([
            'LAST_DATE' => $_GET['last_date']
        ]);
    } else {
        $dates = generateAvailableDates([]);
    }
    
    echo json_encode($dates);

    if ($_GET['debug'] === 'true') { echo '</pre>'; }
?>