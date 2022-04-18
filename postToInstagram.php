<?php
    require('config.php');

    function generateInstagramContainer($imageUrl, $caption) {
        global $SECRETS;

        $curl = curl_init('https://graph.facebook.com/v13.0/17841452598932405/media?image_url='.$imageUrl.'&caption='.urlencode($caption).'&access_token='.$SECRETS['FACEBOOK_ACCESS_TOKEN']);

        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLINFO_HEADER_OUT, true);
        curl_setopt($curl, CURLOPT_POST, true);

        $responseData = curl_exec($curl);

        curl_close($curl);

        $response = json_decode($responseData, true);

        return $response['id'];
    }

    function publishInstagramContainer($container) {
        global $SECRETS;

        $curl = curl_init('https://graph.facebook.com/v13.0/17841452598932405/media_publish?creation_id='.$container.'&access_token='.$SECRETS['FACEBOOK_ACCESS_TOKEN']);

        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLINFO_HEADER_OUT, true);
        curl_setopt($curl, CURLOPT_POST, true);

        $responseData = curl_exec($curl);

        curl_close($curl);
    }

    function saveImage() {
        global $input;

        $directory = './instagram/';
        $file = $directory.time().'.png';

        $image = $input['imageURL'];
        $image = str_replace('data:image/png;base64,', '', $image);
        $image = str_replace(' ', '+', $image);

        $data = base64_decode($image);
        
        file_put_contents($file, $data);

        return $file;
    }

    function getUrl($file) {
        $server = '';
        $directory = '/sunset-quality-predictor/';

        $url = $server.$directory.$file;

        return $url;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    $file = saveImage();
    
    $url = getUrl($file);

    $container = generateInstagramContainer(
        $url,
        $input['caption']
    );

    publishInstagramContainer($container);
?>