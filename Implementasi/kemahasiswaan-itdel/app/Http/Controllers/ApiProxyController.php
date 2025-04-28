<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Auth;

class ApiProxyController extends Controller
{
    public function getStudents(Request $request)
    {
        // Log awal untuk memastikan endpoint dicapai
        $userData = Auth::user() ? [
            'id' => Auth::user()->id,
            'username' => Auth::user()->username,
            'email' => Auth::user()->email,
            'role' => Auth::user()->role,
        ] : null;

        Log::info('Attempting to access getStudents endpoint', [
            'user' => $userData,
            'session' => $request->session()->all(),
        ]);

        // Periksa apakah pengguna terautentikasi
        if (!Auth::check()) {
            Log::error('User is not authenticated');
            return response()->json(['error' => 'User is not authenticated'], 401);
        }

        // Ambil api_token dari sesi
        $token = $request->session()->get('api_token');
        if (!$token) {
            Log::error('No API token found in session', ['session' => $request->session()->all()]);
            return response()->json(['error' => 'No authentication token found'], 401);
        }

        // Log token yang akan digunakan
        Log::info('Using API Token:', ['token' => $token]);

        // Ambil CIS_API_URL dari konfigurasi
        $cisApiUrl = config('app.cis_api_url');
        if (empty($cisApiUrl)) {
            Log::error('CIS_API_URL is empty or not set in configuration');
            return response()->json(['error' => 'CIS API URL not configured'], 500);
        }

        try {
            $client = new Client();
            $response = $client->get($cisApiUrl . '/library-api/mahasiswa', [
                'verify' => false,
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
                    'Accept' => 'application/json',
                ],
                'query' => [
                    'status' => 'aktif',
                ],
            ]);

            $body = $response->getBody()->getContents();
            $data = json_decode($body, true);

            Log::info('Raw CIS API Response:', ['body' => $body]);
            Log::info('Decoded CIS API Response:', ['data' => $data]);

            // Tangani berbagai struktur respons
            $studentsData = null;
            if (is_array($data)) {
                $studentsData = $data;
            } elseif (isset($data['data']) && is_array($data['data'])) {
                $studentsData = $data['data'];
            } elseif (isset($data['students']) && is_array($data['students'])) {
                $studentsData = $data['students'];
            } elseif (isset($data['results']) && is_array($data['results'])) {
                $studentsData = $data['results'];
            } elseif (isset($data['data']['mahasiswa']) && is_array($data['data']['mahasiswa'])) {
                $studentsData = $data['data']['mahasiswa'];
            }

            if ($studentsData === null || !is_array($studentsData)) {
                Log::error('Invalid response structure from CIS API', ['response' => $data]);
                return response()->json([
                    'error' => 'Invalid response structure from CIS API',
                    'response' => $data,
                ], 500);
            }

            // Transformasi data ke format yang diharapkan
            $students = array_map(function ($mahasiswa) {
                return [
                    'user_id' => $mahasiswa['id'] ?? null,
                    'username' => $mahasiswa['nim'] ?? null,
                    'email' => $mahasiswa['email'] ?? ($mahasiswa['nim'] . '@students.del.ac.id'),
                    'name' => $mahasiswa['nama'] ?? null,
                    'role' => 'Mahasiswa',
                    'status' => $mahasiswa['status'] ?? 1,
                    'nim' => $mahasiswa['nim'] ?? null,
                    'prodi' => $mahasiswa['prodi_name'] ?? null,
                    'fakultas' => $mahasiswa['fakultas'] ?? null,
                    'angkatan' => $mahasiswa['angkatan'] ?? null,
                ];
            }, $studentsData);

            return response()->json($students);
        } catch (RequestException $e) {
            if ($e->hasResponse()) {
                $statusCode = $e->getResponse()->getStatusCode();
                $responseBody = $e->getResponse()->getBody()->getContents();
                $decodedResponse = json_decode($responseBody, true);
                Log::error('CIS API HTTP Error:', [
                    'status' => $statusCode,
                    'response' => $responseBody,
                    'decoded' => $decodedResponse,
                ]);
                if ($statusCode === 401) {
                    return response()->json(['error' => 'Token autentikasi tidak valid. Silakan login kembali.'], 401);
                }
                return response()->json([
                    'error' => 'CIS API request failed',
                    'status' => $statusCode,
                    'details' => $decodedResponse ?? $responseBody,
                ], $statusCode);
            }

            Log::error('Error fetching students from CIS API:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch students from CIS API: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            Log::error('Unexpected error in ApiProxyController:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Unexpected error: ' . $e->getMessage()], 500);
        }
    }
}
