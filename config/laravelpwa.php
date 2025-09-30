<?php

return [
    'name' => env('APP_NAME', 'My PWA App'),
    'manifest' => [
        'name' => env('APP_NAME', 'My PWA App'),
        'short_name' => env('APP_SHORT_NAME', 'My PWA App'),
        'start_url' => '/',
        'background_color' => '#ffffff',
        'theme_color' => '#000000',
        'display' => 'standalone',
        'orientation' => 'any',
        'status_bar' => 'black',
        'icons' => [
            '72x72' => [
                'path' => env('APP_ICON_72x72'),
                'purpose' => 'any'
            ],
            '96x96' => [
                'path' => env('APP_ICON_96x96'),
                'purpose' => 'any'
            ],
            '128x128' => [
                'path' => env('APP_ICON_128x128'),
                'purpose' => 'any'
            ],
            '144x144' => [
                'path' => env('APP_ICON_144x144'),
                'purpose' => 'any'
            ],
            '152x152' => [
                'path' => env('APP_ICON_152x152'),
                'purpose' => 'any'
            ],
            '192x192' => [
                'path' => env('APP_ICON_192x192'),
                'purpose' => 'any'
            ],
            '384x384' => [
                'path' => env('APP_ICON_384x384'),
                'purpose' => 'any'
            ],
            '512x512' => [
                'path' => env('APP_ICON_512x512'),
                'purpose' => 'any'
            ],
        ],
        'splash' => [
            '640x1136' => env('APP_ICON_640x1136'),
            '750x1334' => env('APP_ICON_750x1334'),
            '828x1792' => env('APP_ICON_828x1792'),
            '1125x2436' => env('APP_ICON_1125x2436'),
            '1242x2208' => env('APP_ICON_1242x2208'),
            '1242x2688' => env('APP_ICON_1242x2688'),
            '1536x2048' => env('APP_ICON_1536x2048'),
            '1668x2224' => env('APP_ICON_1668x2224'),
            '1668x2388' => env('APP_ICON_1668x2388'),
            '2048x2732' => env('APP_ICON_2048x2732'),
        ],
        'shortcuts' => [
            [
                'name' => env('APP_NAME'),
                'description' => env('APP_DESCRIPTION'),
                'url' => env('APP_URL'),
                'icons' => [
                    "src" => env('APP_ICON_72x72'),
                    "purpose" => "any"
                ]
            ],
            // [
            //     'name' => 'Shortcut Link 2',
            //     'description' => 'Shortcut Link 2 Description',
            //     'url' => '/shortcutlink2'
            // ]
        ],
        'custom' => []
    ]
];
