<?php
    if ($_GET['date']) {
        require('config.php');
        require('functions/getSunsetTime.php');
        require('functions/addToArray.php');

        function getTimesBeforeOrAfterSunsetTime($direction, $range, $interval) {
            global $sunsetTime;

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

        $dateInput = $_GET['date'];
        $date = new DateTime($dateInput);
        
        $beforePeriod = '-30 minutes';
        $beforeInterval = '1 minutes';
        $afterPeriod = '-30 minutes';
        $afterInterval = '1 minutes';

        if ($_GET['beforePeriod']) { $beforePeriod = $_GET['beforePeriod']; }
        if ($_GET['beforeInterval']) { $beforeInterval = $_GET['beforeInterval']; }
        if ($_GET['afterPeriod']) { $afterPeriod = $_GET['afterPeriod']; }
        if ($_GET['afterInterval']) { $afterInterval = $_GET['afterInterval']; }

        $sunsetTime = getSunsetTime($date);
        $sunsetRangeTimes = [
            "timesFromBeforeToSunset" => getTimesBeforeOrAfterSunsetTime('BEFORE', $beforePeriod, $beforeInterval),
            "timesFromAfterToSunset" => getTimesBeforeOrAfterSunsetTime('AFTER', $afterPeriod, $afterInterval)
        ];

        $combinedSunsetRangeTimes = array_merge($sunsetRangeTimes['timesFromBeforeToSunset'], $sunsetRangeTimes['timesFromAfterToSunset']);

        if ($_GET['output'] === 'JSON' || $_GET['output'] === 'JSON-PRETTY') {
            if ($_GET['output'] === 'JSON-PRETTY') { echo '<pre>'; }

            echo json_encode(Array(
                "date" => $date->format("Y-m-d"),
                "sunsetTime" => $sunsetTime->format("H-i"),
                "sunsetDateTime" => $sunsetTime->format("Y-m-d-H-i"),
                "sunsetTimestamp" => $sunsetTime->format("c"),
                "sunsetTimestampData" => $sunsetTime,
                "sunsetRangeTimes" => $combinedSunsetRangeTimes
            ));

            if ($_GET['output'] === 'JSON-PRETTY') { echo '</pre>'; }
        } else if ($_GET['output'] === 'HTML') {
            echo '<body style="margin: 0; background: #000;">';
            
            foreach ($combinedSunsetRangeTimes as $time) {
                echo '<img src="../'.$CONFIG['IMG_PATH'].'/'.$time.'.jpg" style="width: 33.33333%;">';
            }

            echo '</body>';
        } else if ($_GET['output'] === 'compositeImage') {
            $srcImagePaths = Array();

            foreach ($combinedSunsetRangeTimes as $time) {
                array_push($srcImagePaths, '../'.$CONFIG['IMG_PATH'].'/'.$time.'.jpg');
            }

            require('functions/generateCompositeGridImage.php');

            generateCompositeGridImage($srcImagePaths);
        }
    } else {
        echo '<pre>No date input!</pre>';
    }
?>