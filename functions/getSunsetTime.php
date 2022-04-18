<?php
    function getSunsetTime($date) {
        global $CONFIG;
        
        $request = curl_init();
        curl_setopt($request, CURLOPT_URL, "https://api.sunrise-sunset.org/json?lat=".$CONFIG['LOCATION']['LAT']."&lng=".$CONFIG['LOCATION']['LNG']."&date=".$date->format('Y-m-d'));
        curl_setopt($request, CURLOPT_RETURNTRANSFER, 1);
        $results = curl_exec($request);
        curl_close($request);
    
        $sunData = json_decode($results)->results;
    
        $dateSunsetTimeUTC = new DateTime($date->format('Y-m-d')." ".$sunData->sunset, new DateTimeZone('UTC'));
        $dateSunsetTimeUTC->setTimezone(new DateTimeZone($CONFIG['TIMEZONE']));
        $dateSunsetTimeET = new DateTime($dateSunsetTimeUTC->format('Y-m-d')." ".$dateSunsetTimeUTC->format('H:i'));

        return $dateSunsetTimeET;
    }
?>