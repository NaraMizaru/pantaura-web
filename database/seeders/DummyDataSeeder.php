<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\DisasterType;
use App\Enums\IncidentStatus;
use App\Enums\ModerationStatus;
use App\Enums\ResolutionStatus;
use App\Enums\UserRole;
use App\Models\Incident;
use App\Models\IncidentStatusHistory;
use App\Models\Report;
use App\Models\ResolutionSubmission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('role', UserRole::Admin->value)->first()
            ?? User::factory()->admin()->create([
                'name' => 'Admin SiagaKita',
                'email' => 'admin@siagakita.test',
                'password' => Hash::make('password'),
            ]);

        $citizenA = User::query()->firstOrCreate(
            ['email' => 'budi@siagakita.test'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'role' => UserRole::Citizen,
                'email_verified_at' => now(),
            ],
        );

        $citizenB = User::query()->firstOrCreate(
            ['email' => 'siti@siagakita.test'],
            [
                'name' => 'Siti Rahma',
                'password' => Hash::make('password'),
                'role' => UserRole::Citizen,
                'email_verified_at' => now(),
            ],
        );

        $citizenC = User::query()->firstOrCreate(
            ['email' => 'andi@siagakita.test'],
            [
                'name' => 'Andi Pratama',
                'password' => Hash::make('password'),
                'role' => UserRole::Citizen,
                'email_verified_at' => now(),
            ],
        );

        $verifiedIncident = Incident::factory()->ofType(DisasterType::Flood)->verified()->create([
            'title' => 'Banjir Jl. Ahmad Yani Depan Halte',
            'description' => 'Ketinggian air sekitar 45 cm menggenangi dua lajur jalan utama.',
            'latitude' => -6.2088000,
            'longitude' => 106.8456000,
            'address' => 'Jl. Ahmad Yani No. 12, Jakarta Pusat',
            'verified_by' => $admin->id,
            'verified_at' => now()->subHours(2),
        ]);

        Report::factory()->create([
            'incident_id' => $verifiedIncident->id,
            'user_id' => $citizenA->id,
            'description' => 'Air setinggi lutut di depan minimarket Jl. Ahmad Yani.',
            'latitude' => -6.2088100,
            'longitude' => 106.8456200,
            'submitted_at' => now()->subHours(3),
            'moderation_status' => ModerationStatus::Verified,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now()->subHours(2),
        ]);

        Report::factory()->create([
            'incident_id' => $verifiedIncident->id,
            'user_id' => $citizenB->id,
            'description' => 'Arus lalu lintas tersendat karena genangan meluas ke persimpangan.',
            'latitude' => -6.2091000,
            'longitude' => 106.8459000,
            'submitted_at' => now()->subHours(2),
            'moderation_status' => ModerationStatus::Verified,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now()->subHour(),
        ]);

        IncidentStatusHistory::create([
            'incident_id' => $verifiedIncident->id,
            'previous_status' => null,
            'new_status' => IncidentStatus::Unverified,
            'changed_by' => $citizenA->id,
            'created_at' => now()->subHours(3),
        ]);

        IncidentStatusHistory::create([
            'incident_id' => $verifiedIncident->id,
            'previous_status' => IncidentStatus::Unverified,
            'new_status' => IncidentStatus::Verified,
            'changed_by' => $admin->id,
            'reason' => 'Laporan dan bukti foto terkonfirmasi.',
            'created_at' => now()->subHours(2),
        ]);

        $nearbyDuplicateIncident = Incident::factory()->ofType(DisasterType::Flood)->create([
            'title' => 'Genangan Dekat Halte Ahmad Yani',
            'description' => 'Air mulai menggenangi trotoar di sisi timur Jl. Ahmad Yani.',
            'latitude' => -6.2094000,
            'longitude' => 106.8461000,
            'address' => 'Jl. Ahmad Yani Sisi Timur, Jakarta Pusat',
            'status' => IncidentStatus::Unverified,
        ]);

        Report::factory()->create([
            'incident_id' => $nearbyDuplicateIncident->id,
            'user_id' => $citizenC->id,
            'description' => 'Air meluap dari saluran drainase dekat halte.',
            'latitude' => -6.2094000,
            'longitude' => 106.8461000,
            'submitted_at' => now()->subMinutes(25),
            'moderation_status' => ModerationStatus::Pending,
        ]);

        $unverifiedPoints = [
            [
                'title' => 'Genangan Jl. Kemang Raya',
                'description' => 'Air mulai naik di sekitar pertigaan Kemang.',
                'latitude' => -6.2607000,
                'longitude' => 106.8142000,
                'address' => 'Jl. Kemang Raya, Jakarta Selatan',
                'report' => 'Genangan air sekitar 30 cm setelah hujan deras 1 jam.',
            ],
            [
                'title' => 'Genangan Jl. DI Panjaitan',
                'description' => 'Jalur lambat tergenang sepanjang 150 meter.',
                'latitude' => -6.2352000,
                'longitude' => 106.8774000,
                'address' => 'Jl. DI Panjaitan, Jakarta Timur',
                'report' => 'Sepeda motor kesulitan melintas karena air setinggi 35 cm.',
            ],
            [
                'title' => 'Banjir Kawasan Kelapa Gading',
                'description' => 'Genangan di sekitar bundaran utama Kelapa Gading.',
                'latitude' => -6.1574000,
                'longitude' => 106.9085000,
                'address' => 'Boulevard Kelapa Gading, Jakarta Utara',
                'report' => 'Air mulai memasuki area parkir pertokoan.',
            ],
            [
                'title' => 'Genangan Jl. Daan Mogot KM 11',
                'description' => 'Lajur kiri menuju Grogol tergenang.',
                'latitude' => -6.1589000,
                'longitude' => 106.7423000,
                'address' => 'Jl. Daan Mogot, Jakarta Barat',
                'report' => 'Kemacetan panjang akibat genangan 25-30 cm.',
            ],
        ];

        foreach ($unverifiedPoints as $point) {
            $inc = Incident::factory()->ofType(DisasterType::Flood)->create([
                'title' => $point['title'],
                'description' => $point['description'],
                'latitude' => $point['latitude'],
                'longitude' => $point['longitude'],
                'address' => $point['address'],
                'status' => IncidentStatus::Unverified,
            ]);

            Report::factory()->create([
                'incident_id' => $inc->id,
                'user_id' => $citizenB->id,
                'description' => $point['report'],
                'latitude' => $point['latitude'],
                'longitude' => $point['longitude'],
                'submitted_at' => now()->subMinutes(40),
                'moderation_status' => ModerationStatus::Pending,
            ]);
        }

        $earthquakeIncident = Incident::factory()->ofType(DisasterType::Earthquake)->verified()->create([
            'title' => 'Getaran Gempa Terasa di Menteng',
            'description' => 'Getaran kuat terasa selama beberapa detik dan membuat warga berhamburan ke luar gedung.',
            'latitude' => -6.1954000,
            'longitude' => 106.8321000,
            'address' => 'Menteng, Jakarta Pusat',
            'verified_by' => $admin->id,
            'verified_at' => now()->subHours(3),
        ]);

        Report::factory()->create([
            'incident_id' => $earthquakeIncident->id,
            'user_id' => $citizenA->id,
            'description' => 'Getaran terasa sampai lantai tiga, lampu gantung bergoyang.',
            'latitude' => -6.1954100,
            'longitude' => 106.8321200,
            'submitted_at' => now()->subHours(4),
            'moderation_status' => ModerationStatus::Verified,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now()->subHours(3),
        ]);

        $landslideIncident = Incident::factory()->ofType(DisasterType::Landslide)->create([
            'title' => 'Tanah Longsor Tebing Jl. Raya Bogor',
            'description' => 'Material tanah menutup sebagian badan jalan setelah hujan deras semalaman.',
            'latitude' => -6.2943000,
            'longitude' => 106.8654000,
            'address' => 'Jl. Raya Bogor, Jakarta Timur',
            'status' => IncidentStatus::Unverified,
        ]);

        Report::factory()->create([
            'incident_id' => $landslideIncident->id,
            'user_id' => $citizenC->id,
            'description' => 'Tebing setinggi sekitar tiga meter longsor dan menutup lajur kiri.',
            'latitude' => -6.2943000,
            'longitude' => 106.8654000,
            'submitted_at' => now()->subMinutes(50),
            'moderation_status' => ModerationStatus::Pending,
        ]);

        $fireIncident = Incident::factory()->ofType(DisasterType::Fire)->resolved()->create([
            'title' => 'Kebakaran Gudang di Penjaringan',
            'description' => 'Kebakaran menghanguskan gudang penyimpanan dan berhasil dipadamkan petugas.',
            'latitude' => -6.1256000,
            'longitude' => 106.7934000,
            'address' => 'Penjaringan, Jakarta Utara',
            'verified_by' => $admin->id,
        ]);

        Report::factory()->create([
            'incident_id' => $fireIncident->id,
            'user_id' => $citizenB->id,
            'description' => 'Asap tebal terlihat dari jalan raya, api sempat membesar.',
            'latitude' => -6.1256100,
            'longitude' => 106.7934200,
            'submitted_at' => now()->subHours(10),
            'moderation_status' => ModerationStatus::Verified,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now()->subHours(9),
        ]);

        $resolutionPendingIncident = Incident::factory()->ofType(DisasterType::Flood)->create([
            'title' => 'Banjir Kawasan Kampung Melayu',
            'description' => 'Genangan sempat mencapai 60 cm di area permukiman.',
            'latitude' => -6.2244000,
            'longitude' => 106.8669000,
            'address' => 'Kampung Melayu, Jakarta Timur',
            'status' => IncidentStatus::ResolutionSubmitted,
            'verified_by' => $admin->id,
            'verified_at' => now()->subHours(5),
        ]);

        Report::factory()->create([
            'incident_id' => $resolutionPendingIncident->id,
            'user_id' => $citizenA->id,
            'description' => 'Air masuk ke halaman warga sejak pagi.',
            'latitude' => -6.2244100,
            'longitude' => 106.8669100,
            'submitted_at' => now()->subHours(6),
            'moderation_status' => ModerationStatus::Verified,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now()->subHours(5),
        ]);

        ResolutionSubmission::factory()->create([
            'incident_id' => $resolutionPendingIncident->id,
            'user_id' => $citizenB->id,
            'description' => 'Pompa air sudah beroperasi dan jalanan sudah surut total.',
            'status' => ResolutionStatus::Pending,
        ]);

        $resolvedIncident = Incident::factory()->ofType(DisasterType::Flood)->resolved()->create([
            'title' => 'Genangan Underpass Dukuh Atas',
            'description' => 'Sempat terjadi genangan 25 cm di jalur lambat.',
            'latitude' => -6.2008000,
            'longitude' => 106.8229000,
            'address' => 'Dukuh Atas, Jakarta Pusat',
            'verified_by' => $admin->id,
        ]);

        Report::factory()->create([
            'incident_id' => $resolvedIncident->id,
            'user_id' => $citizenA->id,
            'description' => 'Jalur lambat tergenang saat jam pulang kerja.',
            'latitude' => -6.2008100,
            'longitude' => 106.8229200,
            'submitted_at' => now()->subHours(8),
            'moderation_status' => ModerationStatus::Verified,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now()->subHours(7),
        ]);
    }
}
