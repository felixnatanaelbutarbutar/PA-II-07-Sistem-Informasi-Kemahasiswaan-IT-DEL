<?php

namespace App\Helpers;

class RoleHelper
{
    /**
     * Get the permissions for a specific role
     *
     * @param string $role
     * @return array
     */
    public static function getRolePermissions(string $role): array
    {
        $role = strtolower($role);

        $rolePermissions = [
            'superadmin' => [
                'pengumuman' => true,
                'layanan' => true,
                'kegiatan' => true,
                'organisasi' => true,
                'beasiswa' => true,
                'news' => true,
                'newscategory' => true, // Tambahkan untuk superadmin
                'achievements' => true,
                'counseling' => true,
            ],
            'kemahasiswaan' => [
                'pengumuman' => true,
                'layanan' => true,
                'kegiatan' => false,
                'organisasi' => false,
                'beasiswa' => true,
                'news' => true,
                'newscategory' => true,
                'achievements' => true,
                'counseling' => true,
            ],
            'adminbem' => [
                'berita' => false,
                'pengumuman' => true,
                'layanan' => true,
                'kegiatan' => true,
                'organisasi' => false,
                'news' => true,
                'newscategory' => false, // Tidak ada akses untuk adminbem
                'achievements' => false,
                'counseling' => false,
            ],
            'adminmpm' => [
                'berita' => false,
                'pengumuman' => true,
                'layanan' => true,
                'kegiatan' => false,
                'organisasi' => true,
                'news' => false,
                'newscategory' => false, // Tidak ada akses untuk adminmpm
                'achievements' => false,
                'counseling' => false,
            ],
            'mahasiswa' => [
                'pengumuman' => false,
                'layanan' => false,
                'kegiatan' => false,
                'organisasi' => false,
                'beasiswa' => false,
                'news' => false,
                'newscategory' => false, // Tidak ada akses untuk mahasiswa
                'achievements' => false,
                'counseling' => true,
            ],
        ];

        return $rolePermissions[$role] ?? [];
    }

    /**
     * Check if a role has permission to access a feature
     *
     * @param string $role
     * @param string $feature
     * @return bool
     */
    public static function hasPermission(string $role, string $feature): bool
    {
        $permissions = self::getRolePermissions($role);
        return isset($permissions[$feature]) && $permissions[$feature] === true;
    }

    /**
     * Get navigation menu items for a specific role
     *
     * @param string $role
     * @return array
     */
    public static function getNavigationMenu(string $role): array
    {
        $role = strtolower($role);
        $permissions = self::getRolePermissions($role);

        // Menu untuk superadmin, kemahasiswaan, adminbem, adminmpm
        $menuItems = [
            [
                'name' => 'Dashboard',
                'route' => $role === 'superadmin' ? 'superadmin.dashboard' : 'admin.dashboard',
                'icon' => 'home',
                'visible' => true,
            ]
        ];

        // Menu untuk mahasiswa (tanpa dashboard admin)
        if ($role === 'mahasiswa') {
            $menuItems = [];
        }

        if ($permissions['pengumuman'] ?? false) {
            $menuItems[] = [
                'name' => 'Pengumuman',
                'route' => 'admin.announcement.index',
                'icon' => 'bell',
                'visible' => true,
            ];
        }

        if ($permissions['layanan'] ?? false) {
            $menuItems[] = [
                'name' => 'Layanan',
                'route' => 'admin.layanan',
                'icon' => 'gear',
                'visible' => true,
            ];
        }

        if ($permissions['kegiatan'] ?? false) {
            $menuItems[] = [
                'name' => 'Kegiatan',
                'route' => 'admin.kegiatan',
                'icon' => 'calendar',
                'visible' => true,
            ];
        }

        if ($permissions['organisasi'] ?? false) {
            $menuItems[] = [
                'name' => 'Organisasi',
                'route' => 'admin.organisasi',
                'icon' => 'organization',
                'visible' => true,
            ];
        }

        if ($permissions['news'] ?? false) {
            $menuItems[] = [
                'name' => 'Berita',
                'route' => 'admin.news.index',
                'icon' => 'newspaper',
                'visible' => true,
            ];
        }

        if ($permissions['newscategory'] ?? false) {
            $menuItems[] = [
                'name' => 'Kategori Berita',
                'route' => 'admin.news-category.index',
                'icon' => 'newspaper',
                'visible' => true,
            ];
        }

        if ($permissions['achievements'] ?? false) {
            $menuItems[] = [
                'name' => 'Prestasi',
                'route' => 'admin.achievements.index',
                'icon' => 'award',
                'visible' => true,
            ];
        }

        if ($permissions['counseling'] ?? false) {
            $menuItems[] = [
                'name' => 'Konseling',
                'route' => $role === 'mahasiswa' ? 'counseling.index' : 'admin.counseling.index',
                'icon' => 'heart',
                'visible' => true,
            ];
        }

        return $menuItems;
    }
}