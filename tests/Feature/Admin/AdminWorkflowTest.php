<?php

use App\Enums\IncidentStatus;
use App\Enums\ModerationStatus;
use App\Enums\ResolutionStatus;
use App\Models\Incident;
use App\Models\Report;
use App\Models\ResolutionSubmission;
use App\Models\User;

test('citizens are forbidden from accessing admin routes', function () {
    $citizen = User::factory()->create();

    $this->actingAs($citizen)
        ->get('/admin')
        ->assertForbidden();
});

test('admin can verify report, reject report, and group duplicate report into nearby incident', function () {
    $admin = User::factory()->admin()->create();
    $citizen = User::factory()->create();

    $primaryIncident = Incident::factory()->create([
        'latitude' => -6.2088,
        'longitude' => 106.8456,
        'status' => IncidentStatus::Unverified,
    ]);
    $primaryReport = Report::factory()->create([
        'incident_id' => $primaryIncident->id,
        'user_id' => $citizen->id,
        'latitude' => -6.2088,
        'longitude' => 106.8456,
    ]);

    $this->actingAs($admin)
        ->post("/admin/reports/{$primaryReport->id}/verify")
        ->assertRedirect();

    expect($primaryReport->fresh()->moderation_status)->toBe(ModerationStatus::Verified)
        ->and($primaryIncident->fresh()->status)->toBe(IncidentStatus::Verified);

    $duplicateIncident = Incident::factory()->create([
        'latitude' => -6.2090,
        'longitude' => 106.8458,
        'status' => IncidentStatus::Unverified,
    ]);
    $duplicateReport = Report::factory()->create([
        'incident_id' => $duplicateIncident->id,
        'user_id' => $citizen->id,
        'latitude' => -6.2090,
        'longitude' => 106.8458,
    ]);

    $this->actingAs($admin)
        ->post("/admin/reports/{$duplicateReport->id}/group", [
            'target_incident_id' => $primaryIncident->id,
        ])
        ->assertRedirect();

    expect($duplicateReport->fresh()->incident_id)->toBe($primaryIncident->id)
        ->and(Incident::find($duplicateIncident->id))->toBeNull()
        ->and($primaryIncident->reports()->count())->toBe(2);

    $spamIncident = Incident::factory()->create(['status' => IncidentStatus::Unverified]);
    $spamReport = Report::factory()->create(['incident_id' => $spamIncident->id]);

    $this->actingAs($admin)
        ->post("/admin/reports/{$spamReport->id}/reject", [
            'reason' => 'Foto tidak valid dan bukan kejadian banjir.',
        ])
        ->assertRedirect();

    expect($spamReport->fresh()->moderation_status)->toBe(ModerationStatus::Rejected)
        ->and($spamIncident->fresh()->status)->toBe(IncidentStatus::Rejected);
});

test('admin can approve and reject resolution submissions with status history', function () {
    $admin = User::factory()->admin()->create();
    $incident = Incident::factory()->create([
        'status' => IncidentStatus::ResolutionSubmitted,
    ]);

    $rejectedSubmission = ResolutionSubmission::factory()->create([
        'incident_id' => $incident->id,
        'status' => ResolutionStatus::Pending,
    ]);

    $this->actingAs($admin)
        ->post("/admin/resolutions/{$rejectedSubmission->id}/reject", [
            'reason' => 'Air masih menggenang di ruas jalan.',
        ])
        ->assertRedirect();

    expect($rejectedSubmission->fresh()->status)->toBe(ResolutionStatus::Rejected)
        ->and($incident->fresh()->status)->toBe(IncidentStatus::Verified);

    $incident->refresh()->update(['status' => IncidentStatus::ResolutionSubmitted]);
    $approvedSubmission = ResolutionSubmission::factory()->create([
        'incident_id' => $incident->id,
        'status' => ResolutionStatus::Pending,
    ]);

    $this->actingAs($admin)
        ->post("/admin/resolutions/{$approvedSubmission->id}/approve")
        ->assertRedirect();

    expect($approvedSubmission->fresh()->status)->toBe(ResolutionStatus::Approved)
        ->and($incident->fresh()->status)->toBe(IncidentStatus::Resolved)
        ->and($incident->statusHistories()->count())->toBe(2);
});
