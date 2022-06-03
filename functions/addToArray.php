<?php
    function addToArray($options, $minuteFormatted, &$timesFromStartToSunset) {
        global $CONFIG;

        if ($options['FILENAME']) {
            $filename = $CONFIG['SERVER']."/".$CONFIG['IMG_PATH']."/$minuteFormatted.jpg";

            if ($options['CHECK_EXISTS'] === 'LOCAL') {
                if (file_exists(dirname(__FILE__).'/../'.$filename)) {
                    array_push($timesFromStartToSunset, $filename);
                }
            } else if ($options['CHECK_EXISTS'] === 'REMOTE') {
                if (@fopen($filename, 'r')) {
                    array_push($timesFromStartToSunset, $filename);
                }
            } else {
                array_push($timesFromStartToSunset, $filename);
            }
        } else {
            array_push($timesFromStartToSunset, $minuteFormatted);
        }
    }
?>