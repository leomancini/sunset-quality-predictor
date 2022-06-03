<?php
    require($relativePath.'config.php');
    require($relativePath.'functions/getSunsetTime.php');
    require($relativePath.'functions/addToArray.php');

    function getTimesFromStartToSunset($date, $options) {
        global $CONFIG;

        if ($options['INTERVAL']) {
            $interval = $options['INTERVAL'];
        } else {
            $interval = '15 minutes';
        }

        $sunsetTime = getSunsetTime($date);
        $interval = DateInterval::createFromDateString($interval);

       if ($options['START_TIME_OFFSET_FROM_SUNSET']) {
            $startTime = new DateTime($sunsetTime->format("Y-m-d H:i").' '.$options['START_TIME_OFFSET_FROM_SUNSET']);
        } else {
            $startTime = new DateTime($date->format('Y-m-d')." 00:00");
        }

        if ($options['END_TIME_OFFSET_FROM_SUNSET']) {
            $timeBeforeSunsetTime = new DateTime($sunsetTime->format("Y-m-d H:i").' '.$options['END_TIME_OFFSET_FROM_SUNSET']);
            $period = new DatePeriod($startTime, $interval, $timeBeforeSunsetTime);
        } else {
            $period = new DatePeriod($startTime, $interval, $sunsetTime);
        }
    
        $allTimesFromStartToSunset = Array();
    
        foreach ($period as $minute) {
            array_push($allTimesFromStartToSunset, $minute);
        }

        $allTimesFromStartToSunset = array_reverse($allTimesFromStartToSunset); // Sort by reverse chronological

        $timesFromStartToSunset = Array();
        $index = 0;

        foreach ($allTimesFromStartToSunset as $minute) {
            $minuteFormatted = $minute->format("Y-m-d-H-i");
    
            if ($options['LIMIT']) {
                if ($index < $options['LIMIT']) {
                    addToArray($options, $minuteFormatted, $timesFromStartToSunset);
                }
            } else {
                addToArray($options, $minuteFormatted, $timesFromStartToSunset);
            }

            $index++;
        }

        return $timesFromStartToSunset;
    }
?>