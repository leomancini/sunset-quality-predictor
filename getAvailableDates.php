<?php
    require('config.php');
    require('functions/getSunsetTime.php');

    $begin = new DateTime('2021-12-16');
    $now = new DateTime(); // Today

    $todaySunsetTime = getSunsetTime($now);

    $interval = DateInterval::createFromDateString('1 day');
    $period = new DatePeriod($begin, $interval, $now);
    
    $dates = Array();

    foreach ($period as $date) {
        if ($now->format('Y-m-d') === $date->format('Y-m-d')) {
            if ($now > $todaySunsetTime) {
                array_push($dates, $date->format('Y-m-d'));
            }
        } else {
            array_push($dates, $date->format('Y-m-d'));
        }
    }

    if ($_GET['debug'] === 'true') { echo '<pre>'; }

    echo json_encode($dates);

    if ($_GET['debug'] === 'true') { echo '</pre>'; }
?>