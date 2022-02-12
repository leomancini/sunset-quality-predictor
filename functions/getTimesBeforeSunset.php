<?php
    require('config.php');
    require('functions/getSunsetTime.php');
    require('functions/addToArray.php');

    function getTimesFromMidnightToSunset($date, $options) {
        global $CONFIG;

        if ($options['INTERVAL']) {
            $interval = $options['INTERVAL'];
        } else {
            $interval = '15 minutes';
        }

        $sunsetTime = getSunsetTime($date);
        $midnightTime = new DateTime($date->format('Y-m-d')." 00:00");
        $interval = DateInterval::createFromDateString($interval);
        $period = new DatePeriod($midnightTime, $interval, $sunsetTime);
    
        $allTimesFromMidnightToSunset = Array();
    
        foreach ($period as $minute) {
            array_push($allTimesFromMidnightToSunset, $minute);
        }

        $allTimesFromMidnightToSunset = array_reverse($allTimesFromMidnightToSunset); // Sort by reverse chronological

        $timesFromMidnightToSunset = Array();
        $index = 0;

        foreach ($allTimesFromMidnightToSunset as $minute) {
            $minuteFormatted = $minute->format("Y-m-d-H-i");
    
            if ($options['LIMIT']) {
                if ($index < $options['LIMIT']) {
                    addToArray($options, $minuteFormatted, $timesFromMidnightToSunset);
                }
            } else {
                addToArray($options, $minuteFormatted, $timesFromMidnightToSunset);
            }

            $index++;
        }

        return $timesFromMidnightToSunset;
    }
?>