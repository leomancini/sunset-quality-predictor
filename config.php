<?php
    require ('secrets.php');
    
    $CONFIG = [
        'SERVER' => 'http://192.168.1.20',
        'IMG_PATH' => 'nest-cam-timelapse/images/SKYLINE',
        'TIMEZONE' => 'America/New_York',
        'FIRST_DATE' => '2021-12-16'
    ];

    date_default_timezone_set($CONFIG['TIMEZONE']);
?>