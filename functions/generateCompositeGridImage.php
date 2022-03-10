<?php
    // Modified from https://diceattack.wordpress.com/2011/01/03/combining-multiple-images-using-php-and-gd/
    function generateCompositeGridImage($srcImagePaths, $options) {
        if ($options['GRID_SIZE']) {
            $gridSize = $options['GRID_SIZE'];
        } else {
            $gridSize = 8;
        }
        
        $scale = 0.3;

        $tileWidth = 1920 / (1 / $scale);
        $tileHeight = 1080 / (1 / $scale);
        
        $mapWidth = $tileWidth * $gridSize;
        $mapHeight = $tileHeight * $gridSize;
        
        $mapImage = imagecreatetruecolor($mapWidth, $mapHeight);
        $bgColor = imagecolorallocate($mapImage, 0, 0, 0);
        imagefill($mapImage, 0, 0, $bgColor);
    
        foreach ($srcImagePaths as $index => $srcImagePath) {
            list ($x, $y) = indexToCoords($index, $tileWidth, $tileHeight, $gridSize, $scale);
            $tileImg = imagecreatefromjpeg($srcImagePath);
        
            imagecopyresized($mapImage, $tileImg, $x, $y, 0, 0, $tileWidth, $tileHeight, 1920, 1080);
            imagedestroy($tileImg);
        }
        
        $thumbWidth = $mapWidth / 4;
        $thumbHeight = $mapHeight / 4;
        $thumbImage = imagecreatetruecolor($thumbWidth, $thumbHeight);
        imagecopyresampled($thumbImage, $mapImage, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $mapWidth, $mapHeight);
        
        if ($options['SAVE_AS_FILE']) {
            imagejpeg($thumbImage, $options['DIRECTORY'].$options['FILENAME'].'.jpg');
        } else {
            imagejpeg($thumbImage);
        }
    }
    
    function indexToCoords($index, $tileWidth, $tileHeight, $gridSize, $scale) {
        $x = ($index % $gridSize) * $tileWidth;
        $y = floor($index / $gridSize) * $tileHeight;

        return Array($x, $y);
    }
?>