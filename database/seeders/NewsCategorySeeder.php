<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\NewsCategory;
use Illuminate\Support\Facades\Log;

class NewsCategorySeeder extends Seeder
{
    public function run()
    {
        // Ambil user admin yang mau digunakan
        $admin = User::where('email', 'johannes@del.ac.id')->first();

        if (!$admin) {
            Log::error('Admin dengan email johannes@del.ac.id tidak ditemukan.');
            echo "Admin dengan email johannes@del.ac.id tidak ditemukan.\n";
            return;
        }

        // Kategori berita yang akan di-seed
        $categories = [
            [
                'category_id' => 'nc001',
                'category_name' => 'Akademik',
                'description' => 'Berita tentang prestasi akademik, penghargaan, dan kegiatan pendidikan',
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 'nc002',
                'category_name' => 'Kegiatan Kampus',
                'description' => 'Informasi tentang acara mahasiswa, kompetisi, dan kegiatan kampus lainnya',
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 'nc003',
                'category_name' => 'Penelitian dan Inovasi',
                'description' => 'Berita tentang proyek penelitian, inovasi teknologi, dan publikasi ilmiah',
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 'nc004',
                'category_name' => 'Pengabdian Masyarakat',
                'description' => 'Kegiatan pengabdian masyarakat oleh mahasiswa dan dosen IT Del',
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 'nc005',
                'category_name' => 'Alumni',
                'description' => 'Kisah sukses alumni dan kegiatan terkait komunitas alumni',
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 'nc006',
                'category_name' => 'Kerjasama',
                'description' => 'Berita tentang kemitraan dengan industri, universitas, dan organisasi lain',
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 'nc007',
                'category_name' => 'Teknologi',
                'description' => 'Berita terkait perkembangan teknologi dan proyek IT di IT Del',
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        try {
            // Bersihkan tabel untuk menghindari duplikasi (opsional, komentari jika tidak diperlukan)
            // DB::table('news_categories')->truncate();

            // Insert data menggunakan model untuk memastikan validasi dan event
            foreach ($categories as $category) {
                NewsCategory::updateOrCreate(
                    ['category_id' => $category['category_id']],
                    $category
                );
            }

            Log::info('NewsCategorySeeder berhasil dijalankan', ['count' => count($categories)]);
            echo "Berhasil menambahkan " . count($categories) . " kategori berita.\n";
        } catch (\Exception $e) {
            Log::error('Error saat menjalankan NewsCategorySeeder: ' . $e->getMessage());
            echo "Gagal menambahkan kategori berita: " . $e->getMessage() . "\n";
        }
    }
}
