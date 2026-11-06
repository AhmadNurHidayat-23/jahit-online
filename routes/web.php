<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\TailorController;
use App\Http\Middleware\EnsureStaff;
use Illuminate\Support\Facades\Route;

Route::get('/', [CatalogController::class, 'index']);
Route::get('/masuk', [AuthController::class, 'form'])->middleware('guest')->name('login');
Route::post('/masuk', [AuthController::class, 'login'])->middleware(['guest', 'throttle:5,1']);
Route::post('/daftar', [AuthController::class, 'register'])->middleware(['guest', 'throttle:5,1']);
Route::middleware('auth')->group(function () {
    Route::post('/keluar', [AuthController::class, 'logout']);
    Route::get('/pesan/{service}', [CatalogController::class, 'booking']);
    Route::post('/pesan/{service}', [TailorController::class, 'store'])->middleware('throttle:10,1');
    Route::get('/pesanan', [TailorController::class, 'index']);
    Route::get('/pesanan/{order}', [TailorController::class, 'show']);
    Route::get('/pesanan/{order}/invoice', [TailorController::class, 'invoice']);
    Route::get('/pesanan/{order}/referensi', [TailorController::class, 'reference']);
    Route::patch('/pesanan/{order}', [TailorController::class, 'update']);
    Route::post('/petugas/penawaran/{order}', [TailorController::class, 'quote'])->middleware(EnsureStaff::class);
});
