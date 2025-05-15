<?php

namespace App\Http\Controllers;

use App\Models\Counseling;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CounselingController extends Controller
{
    /**
     * Generate a new counseling ID (e.g., csl001, csl002, etc.).
     *
     * @return string
     */
    private function generateCounselingId()
    {
        $lastCounseling = Counseling::latest('id')->first();

        if ($lastCounseling) {
            $lastIdNumber = (int) substr($lastCounseling->id, 3);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            $newIdNumber = 1;
        }

        return 'csl' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT);
    }

    public function index()
    {
        $user = Auth::user();

        // Ambil semua data counselings untuk kalender
        $counselings = Counseling::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($counseling) {
                return [
                    'id' => $counseling->id,
                    'user' => $counseling->user ? [
                        'id' => $counseling->user->id,
                        'name' => $counseling->user->name,
                        'nim' => $counseling->user->nim,
                        'asrama' => $counseling->user->asrama,
                        'prodi' => $counseling->user->prodi,
                        'fakultas' => $counseling->user->fakultas,
                        'angkatan' => $counseling->user->angkatan,
                    ] : null,
                    'issue' => $counseling->issue,
                    'noWhatsApp' => $counseling->noWhatsApp,
                    'booking_date' => $counseling->booking_date,
                    'booking_time' => $counseling->booking_time,
                    'status' => $counseling->status,
                    'rejection_reason' => $counseling->rejection_reason,
                    'created_at' => $counseling->created_at,
                    'updated_at' => $counseling->updated_at,
                ];
            });

        Log::info('Counseling data sent to frontend', [
            'counselings_count' => count($counselings),
            'counselings' => $counselings->toArray(),
        ]);

        return Inertia::render('Counseling', [
            'auth' => [
                'user' => $user,
                'isMahasiswa' => $user && $user->role === 'mahasiswa',
            ],
            'counselings' => [
                'data' => $counselings,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function indexAdmin()
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $counselings = Counseling::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $counselings->getCollection()->transform(function ($counseling) {
            return [
                'id' => $counseling->id,
                'user' => $counseling->user ? [
                    'id' => $counseling->user->id,
                    'name' => $counseling->user->name,
                    'nim' => $counseling->user->nim,
                    'asrama' => $counseling->user->asrama,
                    'prodi' => $counseling->user->prodi,
                    'fakultas' => $counseling->user->fakultas,
                    'angkatan' => $counseling->user->angkatan,
                ] : null,
                'issue' => $counseling->issue,
                'noWhatsApp' => $counseling->noWhatsApp,
                'booking_date' => $counseling->booking_date,
                'booking_time' => $counseling->booking_time,
                'status' => $counseling->status,
                'rejection_reason' => $counseling->rejection_reason,
                'created_at' => $counseling->created_at,
                'updated_at' => $counseling->updated_at,
            ];
        });

        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Counseling/index', [
            'auth' => [
                'user' => $user,
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'counselings' => $counselings,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Store method called', [
            'request_data' => $request->all(),
            'user' => Auth::user(),
        ]);

        $user = Auth::user();

        // Ensure the user is logged in and has the role 'mahasiswa'
        if (!$user || $user->role !== 'mahasiswa') {
            Log::warning('User not authenticated or not mahasiswa', [
                'user' => $user,
            ]);
            return redirect()->route('login')->with('error', 'Anda harus login sebagai mahasiswa untuk mengirimkan permintaan konseling.');
        }

        try {
            // Validate the request
            $validated = $request->validate([
                'issue' => 'required|string|max:1000',
                'noWhatsApp' => 'required|string|max:15|regex:/^[0-9+()-]+$/', // Changed from noTelephone
                'bookingDate' => [
                    'required',
                    'date',
                    'after_or_equal:' . now()->addDays(1)->toDateString(), // Updated to H+1
                    function ($attribute, $value, $fail) {
                        $date = Carbon::parse($value);
                        if ($date->isSunday()) {
                            $fail('Tidak dapat melakukan booking pada hari Minggu.');
                        }
                    },
                ],
                'bookingTime' => 'required|in:08:00,09:00,10:00,11:00,13:00,14:00,15:00,16:00', // Updated to include 08:00 and 16:00
            ]);

            // Mapping data yang divalidasi ke nama kolom database
            $dataToStore = [
                'issue' => $validated['issue'],
                'noWhatsApp' => $validated['noWhatsApp'],
                'booking_date' => $validated['bookingDate'],
                'booking_time' => $validated['bookingTime'],
            ];

            // Check for existing booking
            $existingBooking = Counseling::where('booking_date', $dataToStore['booking_date'])
                ->where('booking_time', $dataToStore['booking_time'])
                ->where('status', 'disetujui')
                ->exists();

            if ($existingBooking) {
                Log::info('Booking slot already taken', [
                    'booking_date' => $dataToStore['booking_date'],
                    'booking_time' => $dataToStore['booking_time'],
                ]);
                return redirect()->route('counseling.index')
                    ->with('error', 'Jam tersebut sudah ada yang booking. Silakan pilih slot lain.')
                    ->withErrors(['bookingTime' => 'Jam tersebut sudah ada yang booking. Silakan pilih slot lain.']);
            }

            DB::beginTransaction();

            // Generate new counseling ID
            $newId = $this->generateCounselingId();

            // Create the counseling request
            Counseling::create([
                'id' => $newId,
                'requestBy' => $user->id,
                'issue' => $dataToStore['issue'],
                'noWhatsApp' => $dataToStore['noWhatsApp'],
                'booking_date' => $dataToStore['booking_date'],
                'booking_time' => $dataToStore['booking_time'],
                'status' => 'menunggu',
            ]);

            DB::commit();

            Log::info('Counseling request created successfully', [
                'id' => $newId,
                'user_id' => $user->id,
                'booking_date' => $dataToStore['booking_date'],
                'booking_time' => $dataToStore['booking_time'],
            ]);

            return redirect()->route('counseling.index')
                ->with('success', 'Permintaan konseling berhasil dikirim.');
        } catch (ValidationException $e) {
            Log::error('Validation failed', [
                'user_id' => $user->id,
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);

            return redirect()->route('counseling.index')
                ->with('error', 'Gagal memvalidasi data. Silakan periksa input Anda.')
                ->withErrors($e->errors());
        } catch (QueryException $e) {
            DB::rollBack();
            Log::error('Failed to create counseling request', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'validated_data' => $request->all(),
            ]);

            return redirect()->route('counseling.index')
                ->with('error', 'Gagal menyimpan permintaan konseling. Silakan coba lagi.')
                ->withErrors(['general' => 'Gagal menyimpan permintaan konseling: ' . $e->getMessage()]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Unexpected error while creating counseling request', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'validated_data' => $request->all(),
            ]);

            return redirect()->route('counseling.index')
                ->with('error', 'Terjadi kesalahan. Silakan coba lagi.')
                ->withErrors(['general' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:menunggu,disetujui,ditolak',
            'rejection_reason' => 'required_if:status,ditolak|string|max:500|nullable',
        ]);

        $counseling = Counseling::findOrFail($id);

        // Check if the new status is 'disetujui' and validate slot availability
        if ($request->status === 'disetujui') {
            $existingApprovedBookings = Counseling::where('booking_date', $counseling->booking_date)
                ->where('booking_time', $counseling->booking_time)
                ->where('status', 'disetujui')
                ->where('id', '!=', $id)
                ->exists();

            if ($existingApprovedBookings) {
                return redirect()->route('admin.counseling.index')
                    ->with('error', 'Slot tersebut sudah dipesan oleh pengguna lain yang telah disetujui.');
            }
        }

        $counseling->status = $request->status;
        $counseling->rejection_reason = $request->status === 'ditolak' ? $request->rejection_reason : null;
        $counseling->save();

        return redirect()->route('admin.counseling.index')
            ->with('success', 'Status permintaan konseling berhasil diperbarui.');
    }
}