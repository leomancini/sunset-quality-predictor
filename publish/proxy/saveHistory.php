<?php
    $relativePath = '../../';
    require($relativePath.'config.php');

    $input = json_decode(file_get_contents('php://input'), true);

    $input['password'] = $SECRETS['UPLOAD_PASSWORD'];

    $curl = curl_init();

    curl_setopt($curl, CURLOPT_URL, $SECRETS['PUBLISH_SERVER_URL'].'history/save.php');
    curl_setopt($curl, CURLOPT_FAILONERROR, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $input);

    $result = curl_exec($curl);
    
    curl_close($curl);

    echo $result;
?>