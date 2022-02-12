<?php
    require('config.php');
    require('getSunsetTime.php');
    require('addToArray.php');

    $dateInput = $_GET['date'];
    $date = new DateTime($dateInput);

    function getTimesFromMidnightToSunset($date, $options) {
        global $CONFIG;

        $interval = '15 minutes';

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

    // DEBUG
    if ($_GET['debug'] === 'true') {
        echo '<pre>'.json_encode(Array(
            "date" => $date->format('Y-m-d'),
            "sunsetTime" => getSunsetTime($date)->format("H-i"),
            "sunsetDateTime" => getSunsetTime($date)->format("Y-m-d-H-i"),
            "timesFromMidnightToSunset" => getTimesFromMidnightToSunset($date, ['FILENAME' => false, 'CHECK_EXISTS' => true])
        ));
    }

    // TODO: Create composite image of times 15 mins before/after sunset
?>