<?php
    if ($_GET['date']) {
        require('functions/getTimesBeforeSunset.php');
        require('functions/generateCompositeGridImage.php');

        $dateInput = $_GET['date'];
        $date = new DateTime($dateInput);
    
        $srcImagePaths = getTimesFromMidnightToSunset($date, ['FILENAME' => true, 'CHECK_EXISTS' => true, 'LIMIT' => 8 * 8]);
    
        header('Content-type: image/jpeg');
        
        generateCompositeGridImage($srcImagePaths);
    } else {
        echo '<pre>No date input!</pre>';
    }
?>