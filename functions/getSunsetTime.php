<?php
    function getSunsetTime($date) {
        global $CONFIG;
        global $SECRETS;
        
        $request = curl_init();
        curl_setopt($request, CURLOPT_URL, $SECRETS['SUNSET_API_PROXY_URL']."?date=".$date->format('Y-m-d'));
        curl_setopt($request, CURLOPT_RETURNTRANSFER, 1);
        $results = curl_exec($request);
        curl_close($request);
    
        $sunData = json_decode($results)->results;
    
        $dateSunsetTimeUTC = new DateTime($sunData->sunset, new DateTimeZone('UTC'));
        $dateSunsetTimeUTC->setTimezone(new DateTimeZone($CONFIG['TIMEZONE']));
        $dateSunsetTimeET = new DateTime($dateSunsetTimeUTC->format('Y-m-d H:i'));

        return $dateSunsetTimeET;
    }
?>