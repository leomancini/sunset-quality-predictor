<?php
    require('config.php');
    require('functions/getSunsetTime.php');

    $begin = new DateTime($CONFIG['FIRST_DATE']);
    $now = new DateTime(); // Today

    $todaySunsetTime = getSunsetTime($now);

    $interval = DateInterval::createFromDateString('1 day');
    $period = new DatePeriod($begin, $interval, $now);
    
    $images = Array();

    $CONFIG = [
        'TITLE' => '🌅&nbsp;&nbsp;Composite Sunset Images',
        'SHOW_DIRECTORY_CONTENTS' => false,
        'PATH' => '../',
        'SHOW_MANUAL_ITEMS' => true,
        'OPEN_LINKS_IN_NEW_TAB' => false,
        'ITEMS' => [],
        'STYLE' => [
            'BULLETS' => true,
            'BULLET_STYLE' => '\002192'
        ]
    ];

    foreach ($period as $date) {
        if ($now->format('Y-m-d') === $date->format('Y-m-d')) {
            if ($now > $todaySunsetTime) {
                array_push($CONFIG['ITEMS'], [
                    'label' => $date->format('Y-m-d'),
                    'link' => 'generateCompositeSunsetImage.php?date='.$date->format('Y-m-d').'&output=HTML'
                ]);
            } else {
                array_push($CONFIG['ITEMS'], [
                    'label' => $date->format('Y-m-d').' (PENDING)'
                ]);
            }
        } else {
            array_push($CONFIG['ITEMS'], [
                'label' => $date->format('Y-m-d'),
                'link' => 'generateCompositeSunsetImage.php?date='.$date->format('Y-m-d').'&output=HTML'
            ]);
        }
    }

    $CONFIG['ITEMS'] = array_reverse($CONFIG['ITEMS']);
?>

<!DOCTYPE HTML>
<html>
	<head>
		<title><?php echo $CONFIG['TITLE']; ?></title>
        <meta charset='UTF-8'>
		<meta name='viewport' content='width=device-width, initial-scale=1'>
        <style>
            * {
                -webkit-font-smoothing: antialiased;
            }

            html, body {
                margin: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
            }

            h1 {
                font-size: 24px;
                margin: 0 0 30px 0;
            }

            ul {
                list-style-type: none;
                list-style-position: inside;
                margin: 0;
                padding: 0;
            }

            li {
                font-size: 16px;
                list-style-type: none;
                list-style-position: inside;
                padding: 8px 0 8px 0;
                margin: 0;
                display: block;
                width: fit-content;
            }

            <?php if ($CONFIG['STYLE']['BULLETS']) { ?>
            li:before {
                font-size: 14px;
                color: rgba(0, 0, 0, 0.5);
                content: '<?php echo $CONFIG['STYLE']['BULLET_STYLE']; ?>';
                margin-right: 8px;
                transition: all 0.3s;
            }
            <?php } ?>

            li:hover a, li:hover:before {
                color: rgba(0, 0, 0, 1);
            }

            a {
                color: rgba(0, 0, 0, 0.5);
                transition: all 0.3s;
                padding: 8px 0 8px 0;
            }

            li.nolink, li.nolink:before, li.nolink:hover:before {
                color: rgba(0, 0, 0, 0.5);
            }

            @media (prefers-color-scheme: dark) {
                html, body {
                    background-color: #1A1A1A;
                    color: #FFFFFF;
                }

                li:before, a {
                    color: rgba(255, 255, 255, 0.5);
                }

                li:hover a, li:hover:before {
                    color: rgba(255, 255, 255, 1);
                }

                li.nolink, li.nolink:before, li.nolink:hover:before {
                    color: rgba(255, 255, 255, 0.5);
                }
            }
        </style>
	</head>
	<body>
        <h1><?php echo $CONFIG['TITLE']; ?></h1>
		<ul>
            <?php
                $linkAttributes = '';

                if ($CONFIG['OPEN_LINKS_IN_NEW_TAB']) {
                    $linkAttributes .= ' target="_blank"';
                    $linkAttributes .= ' rel="nofollow noopener noreferrer"';
                }

                if ($CONFIG['SHOW_DIRECTORY_CONTENTS']) {
                    $files = scandir($CONFIG['PATH']);

                    $hiddenFiles = [
                        '.',
                        '..',
                        'index.php',
                        '.DS_Store',
                        '.git',
                        '.gitignore'
                    ];

                    foreach ($files as &$file) {
                        if (!in_array($file, $hiddenFiles)) {
                            echo "<li><a".$linkAttributes." href='".$CONFIG['PATH'].$file."'>".$file."</a></li>";
                        }
                    }
                }

                if ($CONFIG['SHOW_MANUAL_ITEMS'] && $CONFIG['ITEMS']) {
                    foreach ($CONFIG['ITEMS'] as &$item) {
                        if ($item['link']) {
                            echo "<li><a".$linkAttributes." href='".$item['link']."'>".$item['label']."</a></li>";
                        } else {
                            echo "<li class='nolink'>".$item['label']."</li>";
                        }
                    }
                }
            ?>
        </ul>
	</body>
</html>