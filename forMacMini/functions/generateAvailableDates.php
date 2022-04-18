<?php
    function generateAvailableDates($options) {
        global $CONFIG;
        
        if ($options['FIRST_DATE']) {
            $begin = new DateTime($options['FIRST_DATE']);
        } else {
            $begin = new DateTime($CONFIG['FIRST_DATE']);
        }

        if ($options['LAST_DATE']) {
            $end = new DateTime($options['LAST_DATE'].' +1 day');
        } else {
            $end = new DateTime(); // Today
        }
    
        $todaySunsetTime = getSunsetTime($end);
    
        $interval = DateInterval::createFromDateString('1 day');
        $period = new DatePeriod($begin, $interval, $end);
        
        $dates = Array();
    
        foreach ($period as $date) {
            if ($end->format('Y-m-d') === $date->format('Y-m-d')) {
                if ($end > $todaySunsetTime) {
                    array_push($dates, $date->format('Y-m-d'));
                }
            } else {
                array_push($dates, $date->format('Y-m-d'));
            }
        }

        return $dates;
    }
?>