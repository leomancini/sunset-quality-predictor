<?php
    set_time_limit(60 * 60); // Allow script to execute for a maximum of 60 minutes

    $relativePath = '../';

    require($relativePath.'functions/getTimesBeforeSunset.php');
    require($relativePath.'functions/generateCompositeGridImage.php');

    // TODO: Replace with function to list all dates from start date
    $dates = [
        '2022-02-19',
        '2022-02-20',
        '2022-02-21'
    ];

    foreach ($dates as &$dateInput) {
        $date = new DateTime($dateInput);

        $srcImagePaths = getTimesFromMidnightToSunset($date, [
            'OFFSET_FROM_SUNSET' => '-1 hour',
            'INTERVAL' => '10 minutes',
            'RELATIVE_PATH' => $relativePath,
            'FILENAME' => true,
            'CHECK_EXISTS' => 'REMOTE',
            'LIMIT' => ((60 / 10) * 21)
        ]);

        // print_r($srcImagePaths);
        
        generateCompositeGridImage($srcImagePaths, [
            'SAVE_AS_FILE' => true,
            'DIRECTORY' => '../data/compositeImagesBeforeSunset/',
            'FILENAME' => $date->format('Y-m-d'),
            'GRID_SIZE' => 8
        ]);
    
        echo 'Successfully generated composite image for '.$date->format('F j, Y').' and saved to data/compositeImagesBeforeSunset/'.$date->format('Y-m-d').'.jpg<br>';    
    }
?>