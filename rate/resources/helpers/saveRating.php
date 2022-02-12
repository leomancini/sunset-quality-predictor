<?php
    require('../../../config.php');

    $inputJSON = trim(file_get_contents("php://input"));
    $input = json_decode($inputJSON, true);

    $airtableAuthToken = $SECRETS['AIRTABLE_API_KEY'];

    $request = curl_init();

    curl_setopt_array($request, array(
        CURLOPT_URL => 'https://api.airtable.com/v0/appMjqWKwL86HUWWX/Ratings',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => '{
            "records": [{
                "fields": {
                    "IP Address": "'.$_SERVER['REMOTE_ADDR'].'",
                    "Sunset": "'.$input['sunsetTimestamp'].'",
                    "Display Type": "'.$input['displayType'].'",
                    "Rating": '.$input['rating'].'
                }
            }]
        }',
        CURLOPT_HTTPHEADER => array(
            'Content-Type: application/json',
            'Authorization: Bearer '.$airtableAuthToken
        ),
    ));

    curl_exec($request);
    curl_close($request);

    echo $response;
?>