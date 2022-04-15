<?php
    $relativePath = '../';
    require($relativePath.'config.php');

    if ($_GET['password'] !== $SECRETS['ONE_TIME_UTILITIES_PASSWORD']) { exit(); }

    require('./generateAverageRatings.php');

    $airtableAuthToken = $SECRETS['AIRTABLE_API_KEY'];
    $allRecords = [];

    echo '<pre>';

    $ratings = generateAverageRatings();
    
    foreach ($ratings as $sunsetDate => $ratingInfo) {
        echo $sunsetDate.' average rating is '.$ratingInfo['average']['rounded'].'<br>';
    }

    echo '</pre>';
?>