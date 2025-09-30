<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">


    <title>{{ env('APP_NAME') }}</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" href="/images/tabicon.png">

    <!-- Windows Phone -->
    <meta name="msapplication-navbutton-color" content="{{ env('PRIMARY_COLOR') }}" />
    <meta name="description" content="{{ env('APP_DESCRIPTION') }}" />

    <link rel="preconnect" href="/fonts/Montserrat/Montserrat-VariableFont_wght.ttf" as="font" type="font/ttf"
        crossorigin />
    <link rel="preconnect" href="/fonts/Montserrat/static/Montserrat-Regular.ttf" as="font" type="font/ttf"
        crossorigin />
    <link rel="preconnect" href="/fonts/Montserrat/static/Montserrat-Bold.ttf" as="font" type="font/ttf"
        crossorigin />
    <link rel="preconnect" href="/fonts/Montserrat/static/Montserrat-Regular.ttf" as="font" type="font/ttf"
        crossorigin />
    <link rel="preconnect" href="/fonts/Montserrat/static/Montserrat-Medium.ttf" as="font" type="font/ttf"
        crossorigin />
    <link rel="preconnect" href="/fonts/AnnabelleJFRegular/AnnabelleJFRegular.ttf" as="font" type="font/ttf"
        crossorigin />

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/sass/app.scss', 'resources/js/app.jsx'])
</head>

<body>

    <div id="root">
        <div class="splash-centered">
            <img width="180" src="/images/logo.png" />
            <div class="splash-loader">
                <div class="bar1"></div>
                <div class="bar2"></div>
                <div class="bar3"></div>
                <div class="bar4"></div>
                <div class="bar5"></div>
                <div class="bar6"></div>
            </div>
        </div>
    </div>

</body>

</html>
