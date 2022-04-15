<?php
    $relativePath = '../';
    require($relativePath.'config.php');

    // if ($_GET['password'] !== $SECRETS['PROTECTED_CODE_PASSWORD']) { exit(); }

    require('./generateAverageRatings.php');

    $airtableAuthToken = $SECRETS['AIRTABLE_API_KEY'];
    $allRecords = [];

    
    $ratings = generateAverageRatings();
    
    $sunsetsWithRatings = [];

    foreach ($ratings as $sunsetDate => $ratingInfo) {
        $sunsetsWithRatings[$sunsetDate] = $ratingInfo['average']['rounded'];
    }

    if($_GET['debug']) { echo '<pre>'; }

    echo json_encode($sunsetsWithRatings);

    if($_GET['debug']) { echo '</pre>'; }
?>