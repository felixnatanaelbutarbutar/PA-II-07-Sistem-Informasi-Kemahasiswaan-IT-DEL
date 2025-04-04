<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        // Validasi input
        $request->validate([
            'message' => 'required|string',
        ]);

        $userMessage = $request->input('message');

        // Cek apakah ada aturan yang cocok dengan pertanyaan
        $rules = DB::table('chatbot_rules')->get(); // Ambil semua aturan dari database
        $matchedRule = null;

        // Loop melalui semua aturan untuk mencari kecocokan
        foreach ($rules as $rule) {
            $keyword = strtolower($rule->keyword);
            $userMessageLower = strtolower($userMessage);

            // Cek apakah keyword ada di dalam pesan pengguna
            if (strpos($userMessageLower, $keyword) !== false) {
                $matchedRule = $rule;
                break;
            }
        }

        if ($matchedRule) {
            return response()->json([
                'status' => 'success',
                'reply' => $matchedRule->response,
            ]);
        }

        // Jika tidak ada aturan yang cocok, lanjutkan ke Gemini API
        $systemPrompt = "Kamu adalah chatbot layanan kampus Institut Teknologi Del yang membantu mahasiswa dengan pertanyaan tentang beasiswa, organisasi, dan kegiatan. Jawab dengan bahasa yang ramah, informatif, dan menggunakan Bahasa Indonesia. Jika pertanyaan di luar topik, arahkan pengguna untuk menghubungi kemahasiswaan@del.ac.id.";

        try {
            $client = new Client();
            $response = $client->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . env('GOOGLE_GEMINI_API_KEY'), [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $systemPrompt],
                                ['text' => $userMessage],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.5,
                        'maxOutputTokens' => 150,
                    ],
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $botReply = $data['candidates'][0]['content']['parts'][0]['text'];

            return response()->json([
                'status' => 'success',
                'reply' => $botReply,
            ]);
        } catch (\Exception $e) {
            Log::error('Chatbot Error: ' . $e->getMessage(), [
                'exception' => $e,
                'user_message' => $userMessage,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menghubungi chatbot: ' . $e->getMessage(),
            ], 500);
        }
    }
}