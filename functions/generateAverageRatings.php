<?php
    $relativePath = '../';
    require($relativePath.'config.php');

    if ($_GET['password'] !== $SECRETS['PROTECTED_CODE_PASSWORD']) { exit(); }

    $airtableAuthToken = $SECRETS['AIRTABLE_API_KEY'];
    $airtableBaseId = $SECRETS['AIRTABLE_BASE_ID'];
    $allRecords = [];

    function getRecordsPage($offset) {
        global $airtableAuthToken;
        global $airtableBaseId;

        $request = curl_init();

        curl_setopt_array($request, array(
            CURLOPT_URL => 'https://api.airtable.com/v0/'.$airtableBaseId.'/Ratings?maxResults=9999&pageSize=100&offset='.$offset,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json',
                'Authorization: Bearer '.$airtableAuthToken
            ),
        ));
    
        $responseData = curl_exec($request);
    
        curl_close($request);
    
        $response = json_decode($responseData, true);

        return $response;
    }

    function getAllRecords($offset) {
        global $allRecords;

        $response = getRecordsPage($offset);
        
        if ($response['offset']) {
            array_push($allRecords, $response['records']);
            getAllRecords($response['offset']);
            // print_r($response);
        } else {
            array_push($allRecords, $response['records']);
            getRecordsPage($offset);
        }

        return $allRecords;
    }

    function generateAverageRatings() {
        $allRecordsArray = getAllRecords(null);
        $allRecords = call_user_func_array('array_merge', $allRecordsArray);
    
        $ratings = [];
    
        foreach ($allRecords as $record) {
            $fields = $record['fields'];
            $sunsetDate = explode('T', $fields['Sunset'])[0];
            $ratings[$sunsetDate] = [
                'ratings' => []
            ];
        }
    
        foreach ($allRecords as $record) {
            $fields = $record['fields'];
            $sunsetDate = explode('T', $fields['Sunset'])[0];
            array_push($ratings[$sunsetDate]['ratings'], $fields['Rating']);
    
            foreach ($ratings[$sunsetDate] as $sunsetRating) {
                $averageRating = array_sum($ratings[$sunsetDate]['ratings']) / count($ratings[$sunsetDate]['ratings']);
    
                $ratings[$sunsetDate]['average'] = [
                    'raw' => $averageRating,
                    'rounded' => round($averageRating)
                ];
            }
        }

        return $ratings;
    }

    if ($_GET['debug'] === 'true') {
        echo '<pre>';
        echo json_encode(generateAverageRatings());
        echo '</pre>';
    }
?>
