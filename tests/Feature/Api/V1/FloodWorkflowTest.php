<?php

use App\Enums\IncidentStatus;
use App\Models\Incident;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('citizen can register, login, fetch profile, and logout via api v1', function () {
    $register = $this->postJson('/api/v1/auth/register', [
        'name' => 'Warga Baru',
        'email' => 'warga@siagakita.test',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'device_name' => 'flutter-test',
    ]);

    $register->assertCreated()
        ->assertJsonPath('data.user.role', 'citizen');

    $token = $register->json('data.token');

    $this->withToken($token)
        ->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.email', 'warga@siagakita.test');

    $this->withToken($token)
        ->postJson('/api/v1/auth/logout')
        ->assertOk();
});

test('citizen can create flood report with media and submit additional report', function () {
    Storage::fake('public');

    $citizen = User::factory()->create();
    $token = $citizen->createToken('test')->plainTextToken;

    $createResponse = $this->withToken($token)->post('/api/v1/reports', [
        'latitude' => -6.2088,
        'longitude' => 106.8456,
        'address' => 'Jl. Sudirman No. 1',
        'description' => 'Air menggenang setinggi 40 cm di jalur lambat.',
        'media' => [
            UploadedFile::fake()->image('banjir.jpg', 800, 600),
        ],
    ]);

    $createResponse->assertCreated()
        ->assertJsonPath('data.moderation_status', 'pending')
        ->assertJsonPath('data.incident.status', IncidentStatus::Unverified->value);

    $incidentId = $createResponse->json('data.incident_id');

    $this->getJson('/api/v1/incidents/map')
        ->assertOk()
        ->assertJsonFragment(['id' => $incidentId]);

    $additionalResponse = $this->withToken($token)->post("/api/v1/incidents/{$incidentId}/reports", [
        'latitude' => -6.2089,
        'longitude' => 106.8457,
        'description' => 'Laporan tambahan: air mulai naik ke trotoar.',
        'media' => [
            UploadedFile::fake()->image('tambahan.png', 640, 480),
        ],
    ]);

    $additionalResponse->assertCreated()
        ->assertJsonPath('data.incident_id', $incidentId);

    $this->withToken($token)
        ->getJson('/api/v1/reports/my')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('report creation requires valid media evidence', function () {
    $citizen = User::factory()->create();
    $token = $citizen->createToken('test')->plainTextToken;

    $this->withToken($token)
        ->postJson('/api/v1/reports', [
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'description' => 'Laporan tanpa bukti media harus gagal.',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['media']);
});

test('citizen can submit resolution evidence for verified incident and rejected incidents are hidden', function () {
    Storage::fake('public');

    $citizen = User::factory()->create();
    $token = $citizen->createToken('test')->plainTextToken;

    $verifiedIncident = Incident::factory()->verified()->create();
    $rejectedIncident = Incident::factory()->create(['status' => IncidentStatus::Rejected]);

    $this->getJson("/api/v1/incidents/{$rejectedIncident->id}")
        ->assertNotFound();

    $response = $this->withToken($token)->post("/api/v1/incidents/{$verifiedIncident->id}/resolutions", [
        'description' => 'Genangan air sudah surut sepenuhnya.',
        'media' => [
            UploadedFile::fake()->image('surut.jpg', 800, 600),
        ],
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.status', 'pending');

    expect($verifiedIncident->fresh()->status)->toBe(IncidentStatus::ResolutionSubmitted);
});
