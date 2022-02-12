<?php
    require ('secrets.php');
    
    $CONFIG = [
        'SERVER' => 'http://192.168.1.20',
        'IMG_PATH' => 'nest-cam-timelapse/images/SKYLINE',
        'LOCATION' => [
            'LAT' => '40.730610',
            'LNG' => '-73.935242'
        ],
        'TIMEZONE' => 'America/New_York'
    ];

    date_default_timezone_set($CONFIG['TIMEZONE']);
?>