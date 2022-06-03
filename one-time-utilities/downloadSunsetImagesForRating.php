<?php
    set_time_limit(60 * 60); // Allow script to execute for a maximum of 60 minutes

    $relativePath = '../';
    require($relativePath.'config.php');

    if ($_GET['password'] !== $SECRETS['PROTECTED_CODE_PASSWORD']) { exit(); }

    require($relativePath.'functions/getSunsetTime.php');
    require($relativePath.'functions/getTimesBeforeOrAfterSunsetTime.php');
    require($relativePath.'functions/addToArray.php');
    require($relativePath.'functions/generateAvailableDates.php');

    function getTimesBeforeOrAfterSunsetTimeWithParams($date, $params) {
        $sunsetTime = getSunsetTime($date);

        $sunsetRangeTimes = [
            "timesFromBeforeToSunset" => getTimesBeforeOrAfterSunsetTime($sunsetTime, 'BEFORE', $params['BEFORE_PERIOD'], $params['BEFORE_INTERVAL']),
            "timesFromAfterToSunset" => getTimesBeforeOrAfterSunsetTime($sunsetTime, 'AFTER', $params['AFTER_PERIOD'], $params['AFTER_INTERVAL'])
        ];

        $combinedSunsetRangeTimes = array_merge($sunsetRangeTimes['timesFromBeforeToSunset'], $sunsetRangeTimes['timesFromAfterToSunset']);

        return $combinedSunsetRangeTimes;
    }

    function downloadSunsetImagesForDate($dateInput) {
        global $CONFIG;

        $date = new DateTime($dateInput);

        // THESE NEED TO EXCEED THE VALUES IN showAnimatedAndGridImagesForDate() in /rate/resources/js/viewer.js
        // Need to download the same or more images than are to be viewed
        // At least every 1 minute
        $imagesToDownload = getTimesBeforeOrAfterSunsetTimeWithParams($date, [
            'BEFORE_PERIOD' => '-30 minutes',
            'BEFORE_INTERVAL' => '1 minutes',
            'AFTER_PERIOD' => '+70 minutes',
            'AFTER_INTERVAL' => '1 minutes',
        ]);

        foreach ($imagesToDownload as $filename) {
            $path = $CONFIG['SERVER'].'/'.$CONFIG['IMG_PATH'].'/'.$filename.'.jpg';

            mkdir('../data/sunsetImagesForRating/'.$date->format('Y-m-d').'/');
            if (file_put_contents('../data/sunsetImagesForRating/'.$date->format('Y-m-d').'/'.$filename.'.jpg', file_get_contents($path))) {
                echo 'Successfully downloaded image for '.$filename.' to ../data/sunsetImagesForRating/'.$date->format('Y-m-d').'/'.$filename.'.jpg<br>';
            } else {
                echo 'Error downloading image for '.$filename.' to ../data/sunsetImagesForRating/'.$date->format('Y-m-d').'/'.$filename.'.jpg<br>';
            }
        }
    }

    $availableDates = generateAvailableDates([
        'FIRST_DATE' => '2022-03-22',
        'LAST_DATE' => '2022-06-01'
    ]);

    foreach ($availableDates as $availableDate) {
        downloadSunsetImagesForDate($availableDate);
    }
?>