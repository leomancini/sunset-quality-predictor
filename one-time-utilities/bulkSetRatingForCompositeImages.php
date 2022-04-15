<?php
    $relativePath = '../';
    require($relativePath.'config.php');

    if ($_GET['password'] !== $SECRETS['PROTECTED_CODE_PASSWORD']) { exit(); }

    require('./generateAverageRatings.php');

    $airtableAuthToken = $SECRETS['AIRTABLE_API_KEY'];
    $allRecords = [];

    echo '<pre>';

    $ratings = generateAverageRatings();

    mkdir($relativePath.'data/ratedSunsets/');
    mkdir($relativePath.'data/ratedSunsets/1/');
    mkdir($relativePath.'data/ratedSunsets/2/');
    mkdir($relativePath.'data/ratedSunsets/3/');
    mkdir($relativePath.'data/ratedSunsets/4/');
    mkdir($relativePath.'data/ratedSunsets/5/');
    
    foreach ($ratings as $sunsetDate => $ratingInfo) {
        echo $sunsetDate.' set to '.$ratingInfo['average']['rounded'];
        copy($relativePath.'data/compositeImagesBeforeSunset/'.$sunsetDate.'.jpg', $relativePath.'data/ratedSunsets/'.$ratingInfo['average']['rounded'].'/'.$sunsetDate.'.jpg', );
    }

    echo '</pre>';
?>