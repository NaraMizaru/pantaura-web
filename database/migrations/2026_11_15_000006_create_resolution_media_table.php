<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resolution_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('resolution_submission_id')->constrained('resolution_submissions')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_type');
            $table->string('original_filename');
            $table->unsignedBigInteger('file_size');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resolution_media');
    }
};
