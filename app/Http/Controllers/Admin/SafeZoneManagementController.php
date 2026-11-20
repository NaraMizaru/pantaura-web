<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\SafeZoneType;
use App\Http\Controllers\Controller;
use App\Models\SafeZone;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SafeZoneManagementController extends Controller
{
    public function index(): Response
    {
        $safeZones = SafeZone::query()
            ->latest()
            ->get()
            ->map(fn (SafeZone $zone): array => [
                'id' => $zone->id,
                'name' => $zone->name,
                'type' => $zone->type->value,
                'type_label' => $zone->type->label(),
                'description' => $zone->description,
                'latitude' => $zone->latitude,
                'longitude' => $zone->longitude,
                'address' => $zone->address,
                'capacity' => $zone->capacity,
                'is_active' => $zone->is_active,
            ]);

        return Inertia::render('admin/safe-zones/index', [
            'safeZones' => $safeZones,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::enum(SafeZoneType::class)],
            'description' => ['nullable', 'string', 'max:1000'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'address' => ['nullable', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:100000'],
        ]);

        SafeZone::create([
            'name' => (string) $validated['name'],
            'type' => (string) $validated['type'],
            'description' => $validated['description'] ?? null,
            'latitude' => (float) $validated['latitude'],
            'longitude' => (float) $validated['longitude'],
            'address' => $validated['address'] ?? null,
            'capacity' => isset($validated['capacity']) ? (int) $validated['capacity'] : null,
            'is_active' => true,
            'created_by' => $admin->id,
        ]);

        return back()->with('success', 'Posko / Titik Aman berhasil ditambahkan.');
    }

    public function update(Request $request, SafeZone $safeZone): RedirectResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $safeZone->update([
            'is_active' => (bool) $validated['is_active'],
        ]);

        return back()->with('success', 'Status Posko / Titik Aman diperbarui.');
    }

    public function destroy(SafeZone $safeZone): RedirectResponse
    {
        $safeZone->delete();

        return back()->with('success', 'Posko / Titik Aman dihapus.');
    }
}
