<?php
    function addToArray($options, $minuteFormatted, &$timesFromMidnightToSunset) {
        global $CONFIG;

        if ($options['FILENAME']) {
            $filename = "../".$CONFIG['IMG_PATH']."/$minuteFormatted.jpg";

            if ($options['CHECK_EXISTS']) {
                if (file_exists(dirname(__FILE__).'/../'.$filename)) {
                    array_push($timesFromMidnightToSunset, $filename);
                }
            } else {
                array_push($timesFromMidnightToSunset, $filename);
            }
        } else {
            array_push($timesFromMidnightToSunset, $minuteFormatted);
        }
    }
?>