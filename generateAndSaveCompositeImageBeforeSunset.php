<?php
    if ($_GET['date']) {
        set_time_limit(60 * 60); // Allow script to execute for a maximum of 60 minutes
    
        require('config.php');    
        require('functions/getTimesBeforeSunset.php');
        require('functions/generateCompositeGridImage.php');

        $dateInput = $_GET['date'];
        $date = new DateTime($dateInput);

        $srcImagePaths = getTimesFromMidnightToSunset($date, [
            'OFFSET_FROM_SUNSET' => '-1 hour',
            'INTERVAL' => '10 minutes',
            'FILENAME' => true,
            'CHECK_EXISTS' => 'REMOTE',
            'LIMIT' => ((60 / 10) * 21)
        ]);
        
        generateCompositeGridImage($srcImagePaths, [
            'SAVE_AS_FILE' => true,
            'DIRECTORY' => 'data/compositeImagesBeforeSunset/forPrediction/',
            'FILENAME' => $date->format('Y-m-d'),
            'GRID_SIZE' => 8
        ]);
    } else {
        echo '<pre>No date input!</pre>';
    }
?>