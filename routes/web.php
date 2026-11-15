<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\IncidentManagementController;
use App\Http\Controllers\Admin\ReportManagementController;
use App\Http\Controllers\Admin\ResolutionVerificationController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Public\IncidentMapController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', [IncidentMapController::class, 'index'])->name('home');
Route::get('/incidents/{incident}', [IncidentMapController::class, 'show'])->name('incidents.show');
Route::view('/api/docs', 'api-docs')->name('api.docs');

Route::middleware(['auth', 'verified'])->get('/dashboard', function (Request $request) {
    if ($request->user()?->isAdmin()) {
        return redirect()->route('admin.dashboard');
    }

    return redirect()->route('home');
})->name('dashboard');

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (): void {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/reports', [ReportManagementController::class, 'index'])->name('reports.index');
        Route::get('/reports/{report}', [ReportManagementController::class, 'show'])->name('reports.show');
        Route::post('/reports/{report}/verify', [ReportManagementController::class, 'verify'])->name('reports.verify');
        Route::post('/reports/{report}/reject', [ReportManagementController::class, 'reject'])->name('reports.reject');
        Route::post('/reports/{report}/group', [ReportManagementController::class, 'group'])->name('reports.group');

        Route::get('/incidents', [IncidentManagementController::class, 'index'])->name('incidents.index');
        Route::get('/incidents/{incident}', [IncidentManagementController::class, 'show'])->name('incidents.show');

        Route::get('/resolutions', [ResolutionVerificationController::class, 'index'])->name('resolutions.index');
        Route::post('/resolutions/{resolution}/approve', [ResolutionVerificationController::class, 'approve'])->name('resolutions.approve');
        Route::post('/resolutions/{resolution}/reject', [ResolutionVerificationController::class, 'reject'])->name('resolutions.reject');

        Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [UserManagementController::class, 'updateRole'])->name('users.update-role');
    });

require __DIR__.'/settings.php';
