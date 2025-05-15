<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChatbotRulesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rules = [
            [
                'keyword' => 'beasiswa potensi cum laude',
                'response' => 'Untuk mendapatkan Beasiswa Potensi Cum Laude, kamu perlu memenuhi syarat berikut: 1. Nilai perilaku minimal AB. 2. IP Semester ganjil minimal 3.5. Untuk informasi lebih lanjut, hubungi bagian kemahasiswaan.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'keyword' => 'cara bergabung dengan bem',
                'response' => 'Untuk bergabung dengan BEM, kamu perlu mengikuti proses rekrutmen yang diadakan setiap tahun. Pantau pengumuman di website kampus atau hubungi pengurus BEM untuk informasi lebih lanjut.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'keyword' => 'kegiatan bulan ini',
                'response' => 'Untuk informasi kegiatan bulan ini, kamu bisa cek pengumuman di website kampus atau papan informasi fakultas. Biasanya ada seminar, workshop, atau lomba yang diadakan setiap bulan. Untuk detail lebih lanjut, hubungi bagian kemahasiswaan.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Masukkan data ke tabel chatbot_rules
        DB::table('chatbot_rules')->insert($rules);
    }
}