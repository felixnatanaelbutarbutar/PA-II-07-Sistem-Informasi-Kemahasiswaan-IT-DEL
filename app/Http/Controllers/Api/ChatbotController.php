<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ChatbotController extends Controller
{
    /**
     * Menghitung jarak Levenshtein untuk mendeteksi typo
     */
    private function calculateSimilarity($str1, $str2)
    {
        return levenshtein(strtolower($str1), strtolower($str2));
    }

    /**
     * Chatbot endpoint
     */
    public function chat(Request $request)
    {
        // Validasi input
        $request->validate([
            'message' => 'required|string',
        ]);

        $userMessage = $request->input('message');
        $userMessageLower = strtolower($userMessage);

        // Ambil semua aturan dari database
        $rules = DB::table('chatbot_rules')->get();
        $matchedRule = null;
        $closestKeyword = null;
        $minDistance = 3; // Batas jarak Levenshtein untuk mendeteksi typo
        $matchedKeyword = null;

        // Loop melalui semua aturan untuk mencari kecocokan atau kemungkinan typo
        foreach ($rules as $rule) {
            $keyword = strtolower($rule->keyword);

            // Cek kecocokan langsung
            if (strpos($userMessageLower, $keyword) !== false) {
                $matchedRule = $rule;
                $matchedKeyword = $keyword;
                break;
            }

            // Cek kemungkinan typo menggunakan Levenshtein distance
            $words = explode(' ', $userMessageLower);
            foreach ($words as $word) {
                $distance = $this->calculateSimilarity($word, $keyword);
                if ($distance <= $minDistance && ($closestKeyword === null || $distance < $minDistance)) {
                    $closestKeyword = $keyword;
                    $minDistance = $distance;
                    $matchedRule = $rule;
                    $matchedKeyword = $word; // Kata yang dianggap typo
                }
            }
        }

        // Jika ada aturan yang cocok (baik langsung atau dengan typo)
        if ($matchedRule) {
            $baseResponse = $matchedRule->response;
            $isTypo = $matchedKeyword !== strtolower($matchedRule->keyword);

            // Tambahkan pesan koreksi typo jika ada
            $reply = $isTypo
                ? "Mungkin maksud Anda '" . $matchedRule->keyword . "'? " . $baseResponse
                : $baseResponse;

            // Gunakan Gemini API untuk memperkaya jawaban
            $systemPrompt = "Kamu adalah chatbot layanan kampus Institut Teknologi Del yang membantu mahasiswa dengan pertanyaan tentang beasiswa, organisasi, dan kegiatan. Jawab dengan bahasa yang ramah, informatif, dan menggunakan Bahasa Indonesia. Berdasarkan jawaban awal berikut: '$baseResponse', kembangkan jawaban tersebut dengan informasi tambahan yang relevan, maksimal 100 kata.";

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
                $enhancedResponse = $data['candidates'][0]['content']['parts'][0]['text'];

                // Gabungkan jawaban awal dengan jawaban yang diperkaya
                $finalReply = $reply . " " . $enhancedResponse;

                return response()->json([
                    'status' => 'success',
                    'reply' => $finalReply,
                ]);
            } catch (\Exception $e) {
                Log::error('Chatbot Enhancement Error: ' . $e->getMessage(), [
                    'exception' => $e,
                    'user_message' => $userMessage,
                ]);

                // Jika gagal memperkaya, kembalikan jawaban awal saja
                return response()->json([
                    'status' => 'success',
                    'reply' => $reply,
                ]);
            }
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