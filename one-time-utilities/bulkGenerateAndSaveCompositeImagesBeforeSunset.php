<?php
    set_time_limit(60 * 60); // Allow script to execute for a maximum of 60 minutes

    $relativePath = '../';
    require($relativePath.'config.php');

    if ($_GET['password'] !== $SECRETS['ONE_TIME_UTILITIES_PASSWORD']) { exit(); }

    require($relativePath.'functions/getTimesBeforeSunset.php');
    require($relativePath.'functions/generateCompositeGridImage.php');
    require($relativePath.'functions/generateAvailableDates.php');

    $dates = generateAvailableDates([
        'FIRST_DATE' => '2022-03-22',
        'LAST_DATE' => '2022-04-02'
    ]);

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
        
        generateCompositeGridImage($srcImagePaths, [
            'SAVE_AS_FILE' => true,
            'DIRECTORY' => '../data/compositeImagesBeforeSunset/',
            'FILENAME' => $date->format('Y-m-d'),
            'GRID_SIZE' => 8
        ]);
    
        echo 'Successfully generated composite image for '.$date->format('F j, Y').' and saved to data/compositeImagesBeforeSunset/'.$date->format('Y-m-d').'.jpg<br>';    
    }
?>