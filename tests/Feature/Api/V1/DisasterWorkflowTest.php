<?php

use App\Enums\DisasterType;
use App\Enums\IncidentStatus;
use App\Enums\SafeZoneType;
use App\Enums\UrgentNeed;
use App\Models\Incident;
use App\Models\SafeZone;
use App\Models\User;
use App\Services\IncidentService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('citizen can register, login, fetch profile, and logout via api v1', function () {
    $register = $this->postJson('/api/v1/auth/register', [
        'name' => 'Warga Baru',
        'email' => 'warga@pantaura.test',
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
        ->assertJsonPath('data.email', 'warga@pantaura.test');

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
        ->assertJsonPath('data.incident.status', IncidentStatus::Unverified->value)
        ->assertJsonPath('data.incident.disaster_type', 'flood')
        ->assertJsonPath('data.incident.disaster_type_label', 'Banjir');

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

test('citizen can create a typed disaster report and filter incidents by type', function () {
    Storage::fake('public');

    $citizen = User::factory()->create();
    $token = $citizen->createToken('test')->plainTextToken;

    $response = $this->withToken($token)->post('/api/v1/reports', [
        'disaster_type' => 'earthquake',
        'latitude' => -6.1954,
        'longitude' => 106.8321,
        'address' => 'Menteng, Jakarta Pusat',
        'description' => 'Getaran gempa terasa kuat selama beberapa detik.',
        'media' => [
            UploadedFile::fake()->image('gempa.jpg', 800, 600),
        ],
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.incident.disaster_type', 'earthquake')
        ->assertJsonPath('data.incident.disaster_type_label', 'Gempa Bumi');

    $incidentId = $response->json('data.incident_id');

    $this->getJson('/api/v1/incidents/map?type=earthquake')
        ->assertOk()
        ->assertJsonFragment(['id' => $incidentId]);

    $this->getJson('/api/v1/incidents/map?type=flood')
        ->assertOk()
        ->assertJsonMissing(['id' => $incidentId]);

    $this->getJson('/api/v1/incidents?type=earthquake')
        ->assertOk()
        ->assertJsonFragment(['id' => $incidentId]);
});

test('invalid disaster type is rejected', function () {
    $citizen = User::factory()->create();
    $token = $citizen->createToken('test')->plainTextToken;

    $this->withToken($token)
        ->postJson('/api/v1/reports', [
            'disaster_type' => 'tsunami',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'description' => 'Jenis bencana tidak dikenal harus ditolak.',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['disaster_type']);
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

test('resolved incidents are hidden from default public map and list unless filtered by status=resolved', function () {
    $activeIncident = Incident::factory()->verified()->create();
    $resolvedIncident = Incident::factory()->resolved()->create();

    $this->getJson('/api/v1/incidents/map')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $activeIncident->id);

    $this->getJson('/api/v1/incidents/map?status=resolved')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $resolvedIncident->id);

    $this->getJson('/api/v1/incidents')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $activeIncident->id);

    $this->getJson('/api/v1/incidents?status=resolved')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $resolvedIncident->id);
});

test('citizen can find nearby incidents, toggle crowd confirmation, and view active safe zones', function () {
    $citizen = User::factory()->create();
    $token = $citizen->createToken('test')->plainTextToken;

    $nearIncident = Incident::factory()->verified()->create([
        'disaster_type' => DisasterType::Flood,
        'latitude' => -6.2088000,
        'longitude' => 106.8456000,
        'urgent_needs' => [UrgentNeed::RubberBoat->value],
    ]);

    Incident::factory()->verified()->create([
        'disaster_type' => DisasterType::Flood,
        'latitude' => -6.9175000,
        'longitude' => 107.6191000,
    ]);

    SafeZone::create([
        'name' => 'Posko Utama Jakarta',
        'type' => SafeZoneType::Posko,
        'latitude' => -6.2090000,
        'longitude' => 106.8460000,
        'is_active' => true,
    ]);

    $this->getJson('/api/v1/incidents/nearby?lat=-6.2089&lng=106.8457&radius=500')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $nearIncident->id);

    $this->withToken($token)
        ->postJson("/api/v1/incidents/{$nearIncident->id}/confirm")
        ->assertOk()
        ->assertJsonPath('data.confirmed', true)
        ->assertJsonPath('data.confirmations_count', 1);

    $this->withToken($token)
        ->postJson("/api/v1/incidents/{$nearIncident->id}/confirm")
        ->assertOk()
        ->assertJsonPath('data.confirmed', false)
        ->assertJsonPath('data.confirmations_count', 0);

    $this->getJson('/api/v1/safe-zones')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Posko Utama Jakarta');
});

test('citizen receives geofence alert when an incident in watch area becomes verified', function () {
    $citizen = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $token = $citizen->createToken('test')->plainTextToken;

    $watchResponse = $this->withToken($token)->postJson('/api/v1/watch-areas', [
        'label' => 'Rumah',
        'latitude' => -6.2088,
        'longitude' => 106.8456,
        'radius_meters' => 2000,
    ]);

    $watchResponse->assertCreated()
        ->assertJsonPath('data.label', 'Rumah');

    $incident = Incident::factory()->create([
        'latitude' => -6.2095,
        'longitude' => 106.8460,
        'status' => IncidentStatus::Unverified,
    ]);

    app(IncidentService::class)->transitionStatus($incident, IncidentStatus::Verified, $admin);

    $alertsResponse = $this->withToken($token)->getJson('/api/v1/alerts');
    $alertsResponse->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.incident.id', $incident->id);

    $alertId = $alertsResponse->json('data.0.id');

    $this->withToken($token)
        ->postJson("/api/v1/alerts/{$alertId}/read")
        ->assertOk();
});
