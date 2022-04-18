<?php
    function getTimesBeforeOrAfterSunsetTime($sunsetTime, $direction, $range, $interval) {
        $beforeOrAfterSunsetTime = new DateTime($sunsetTime->format("Y-m-d H:i").' '.$range);
        $interval = DateInterval::createFromDateString($interval);

        if ($direction === 'BEFORE') {
            $period = new DatePeriod($beforeOrAfterSunsetTime, $interval, $sunsetTime);
        } else if ($direction === 'AFTER') {
            $period = new DatePeriod($sunsetTime, $interval, $beforeOrAfterSunsetTime);
        }

        $allTimesFromBeforeOrAfterToSunset = Array();

        foreach ($period as $minute) {
            array_push($allTimesFromBeforeOrAfterToSunset, $minute);
        }

        $timesFromBeforeOrAfterToSunset = Array();
        $index = 0;

        foreach ($allTimesFromBeforeOrAfterToSunset as $minute) {
            $minuteFormatted = $minute->format("Y-m-d-H-i");

            addToArray(null, $minuteFormatted, $timesFromBeforeOrAfterToSunset);

            $index++;
        }

        return $timesFromBeforeOrAfterToSunset;
    }
?>