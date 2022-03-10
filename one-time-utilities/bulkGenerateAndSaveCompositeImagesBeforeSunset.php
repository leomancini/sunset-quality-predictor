<?php
    set_time_limit(5 * 60); // Allow script to execute for a maximum of 5 minutes

    $relativePath = '../';

    require('../functions/getTimesBeforeSunset.php');
    require('../functions/generateCompositeGridImage.php');

    // TODO: Replace with function to list all dates from start date
    $dates = [
        '2022-02-21'
    ];

    foreach ($dates as &$dateInput) {
        $date = new DateTime($dateInput);

        $srcImagePaths = getTimesFromMidnightToSunset($date, [
            'OFFSET_FROM_SUNSET' => '-1 hour',
            'INTERVAL' => '10 minutes',
            'RELATIVE_PATH' => $relativePath,
            'FILENAME' => true,
            'CHECK_EXISTS' => true,
            'LIMIT' => 8 * 8
        ]);
        
        generateCompositeGridImage($srcImagePaths, [
            'SAVE_AS_FILE' => true,
            'DIRECTORY' => '../data/compositeImagesBeforeSunset/',
            'FILENAME' => $date->format('Y-m-d'),
            'GRID_SIZE' => 8
        ]);
    
        echo 'Successfully generated composite image for '.$date->format('F j, Y').' and saved to data/compositeImagesBeforeSunset/'.$date->format('Y-m-d').'.jpg<br>';    
    }
?>