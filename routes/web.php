<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// Pusher auth route for private channels
Route::post('/broadcasting/auth', function (Request $request) {
    return broadcast_auth($request);
})->middleware('auth:api');

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api|images|fonts|css|js|favicon\.ico).*$');
