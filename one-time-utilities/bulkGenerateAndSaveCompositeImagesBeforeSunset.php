<?php
    set_time_limit(60 * 60); // Allow script to execute for a maximum of 60 minutes

    $relativePath = '../';
    require($relativePath.'config.php');

    if ($_GET['password'] !== $SECRETS['PROTECTED_CODE_PASSWORD']) { exit(); }

    require($relativePath.'functions/getTimesBeforeSunset.php');
    require($relativePath.'functions/generateCompositeGridImage.php');
    require($relativePath.'functions/generateAvailableDates.php');

    $dates = generateAvailableDates([
        'FIRST_DATE' => '2021-12-17',
        'LAST_DATE' => '2022-03-21'
    ]);

    foreach ($dates as &$dateInput) {
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
            'DIRECTORY' => '../data/compositeImagesBeforeSunset/ratedSunsets_v2/',
            'FILENAME' => $date->format('Y-m-d'),
            'GRID_SIZE' => 5
        ]);
    
        echo 'Successfully generated and saved composite image for '.$date->format('F j, Y').'<br>';    
    }
?>