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
                'beasiswa' => true,
                'news' => true,
                'newscategory' => true,
                'achievements' => true,
                'counseling' => true,
            ],
            'kemahasiswaan' => [
                'pengumuman' => true,
                'beasiswa' => true,
                'news' => true,
                'newscategory' => true,
                'achievements' => true,
                'counseling' => true,
            ],
            'adminbem' => [
                'pengumuman' => true,
                'news' => true,
                'newscategory' => false,
                'achievements' => false,
                'counseling' => false,
            ],
            'adminmpm' => [
                'pengumuman' => true,
                'news' => false,
                'newscategory' => false,
                'achievements' => false,
                'counseling' => false,
            ],
            'mahasiswa' => [
                'pengumuman' => false,
                'beasiswa' => false,
                'news' => false,
                'newscategory' => false,
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

        // Mengelompokkan Berita dan Kategori Berita dalam dropdown "Manajemen Berita"
        if (($permissions['news'] ?? false) || ($permissions['newscategory'] ?? false)) {
            $newsSubmenu = [];

            if ($permissions['news'] ?? false) {
                $newsSubmenu[] = [
                    'name' => 'Berita',
                    'route' => 'admin.news.index',
                    'visible' => true,
                ];
            }

            if ($permissions['newscategory'] ?? false) {
                $newsSubmenu[] = [
                    'name' => 'Kategori Berita',
                    'route' => 'admin.news-category.index',
                    'visible' => true,
                ];
            }

            $menuItems[] = [
                'name' => 'Manajemen Berita',
                'icon' => 'newspaper',
                'visible' => true,
                'submenu' => $newsSubmenu,
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

        return array_filter($menuItems, fn($item) => $item['visible'] ?? true);
    }
}