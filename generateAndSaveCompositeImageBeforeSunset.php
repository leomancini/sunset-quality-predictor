<?php
    if ($_GET['date']) {
        set_time_limit(60 * 10); // Allow script to execute for a maximum of 10 minutes
    
        require('config.php');    
        require('functions/getTimesBeforeSunset.php');
        require('functions/generateCompositeGridImage.php');

        $dateInput = $_GET['date'];
        $date = new DateTime($dateInput);

        $srcImagePaths = getTimesFromStartToSunset($date, [
            'END_TIME_OFFSET_FROM_SUNSET' => '-1 hour',
            'START_TIME_OFFSET_FROM_SUNSET' => '-4 hours',
            'INTERVAL' => '5 minutes',
            'FILENAME' => true,
            'CHECK_EXISTS' => 'REMOTE',
            'LIMIT' => ((60 / 10) * 21)
        ]);
        
        generateCompositeGridImage($srcImagePaths, [
            'SAVE_AS_FILE' => true,
            'DIRECTORY' => 'data/compositeImagesBeforeSunset/forPrediction/',
            'FILENAME' => $date->format('Y-m-d'),
            'GRID_SIZE' => 5
        ]);

        echo json_encode(['success' => true]);
    } else {
        echo '<pre>No date input!</pre>';
    }
?>