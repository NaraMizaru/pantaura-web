<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\IncidentController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\ResolutionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    Route::get('/incidents', [IncidentController::class, 'index']);
    Route::get('/incidents/map', [IncidentController::class, 'map']);
    Route::get('/incidents/{incident}', [IncidentController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        Route::post('/reports', [ReportController::class, 'store']);
        Route::get('/reports/my', [ReportController::class, 'myReports']);
        Route::post('/incidents/{incident}/reports', [ReportController::class, 'storeAdditional']);
        Route::post('/incidents/{incident}/resolutions', [ResolutionController::class, 'store']);
    });
});
