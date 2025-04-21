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
            'kemahasiswaan' => [
                'beasiswa' => true,
                'announcementcategory' => true,
                'announcement' => true,
                'newscategory' => true,
                'news' => true,
                'scholarshipcategory' => true,
                'scholarship' => true,
                'achievements' => true,
                'achievementtype' => true,
                'counseling' => true,
                'aspiration' => true,
                'mpm' => true,
                'bem' => true,
                'downloads' => true,
                'organizationadmin' => true,
                'carousel' => true, // Tambahkan izin untuk carousel
            ],
            'adminbem' => [
                'pengumuman' => true,
                'news' => true,
                'newscategory' => false,
                'achievements' => true,
                'achievementtype' => false,
                'counseling' => false,
                'aspiration' => false,
                'bem' => true,
                'mpm' => false,
                'carousel' => false, // Tidak ada akses untuk adminbem
            ],
            'adminmpm' => [
                'pengumuman' => true,
                'news' => false,
                'newscategory' => false,
                'achievements' => false,
                'achievementtype' => false,
                'counseling' => false,
                'aspiration' => true,
                'bem' => false,
                'mpm' => true,
                'carousel' => false, 
            ],
            'mahasiswa' => [
                'pengumuman' => false,
                'beasiswa' => false,
                'news' => false,
                'newscategory' => false,
                'achievements' => false,
                'achievementtype' => false,
                'counseling' => true,
                'aspiration' => false,
                'bem' => false,
                'carousel' => false, 
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

        if (($permissions['announcement'] ?? false) || ($permissions['announcementcategory'] ?? false)) {
            $newsSubmenu = [];
            if ($permissions['announcementcategory'] ?? false) {
                $newsSubmenu[] = [
                    'name' => 'Kategori Pengumuman',
                    'route' => 'admin.announcement-category.index',
                    'visible' => true,
                ];
            }

            if ($permissions['announcement'] ?? false) {
                $newsSubmenu[] = [
                    'name' => 'Pengumuman',
                    'route' => 'admin.announcement.index',
                    'visible' => true,
                ];
            }

            $menuItems[] = [
                'name' => 'Manajemen Pengumuman',
                'icon' => 'bell',
                'visible' => true,
                'submenu' => $newsSubmenu,
            ];
        }

        // Mengelompokkan Berita dan Kategori Berita dalam dropdown "Manajemen Berita"
        if (($permissions['news'] ?? false) || ($permissions['newscategory'] ?? false)) {
            $newsSubmenu = [];

            if ($permissions['newscategory'] ?? false) {
                $newsSubmenu[] = [
                    'name' => 'Kategori Berita',
                    'route' => 'admin.news-category.index',
                    'visible' => true,
                ];
            }

            if ($permissions['news'] ?? false) {
                $newsSubmenu[] = [
                    'name' => 'Berita',
                    'route' => 'admin.news.index',
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

        // Mengelompokkan Beasiswa dan Kategori Beasiswa dalam dropdown "Manajemen Beasiswa"
        if (($permissions['scholarship'] ?? false) || ($permissions['scholarshipcategory'] ?? false)) {
            $newsSubmenu = [];

            if ($permissions['scholarship'] ?? false) {
                $newsSubmenu[] = [
                    'name' => 'Beasiswa',
                    'route' => 'admin.scholarship.index',
                    'visible' => true,
                ];
            }

            if ($permissions['scholarshipcategory'] ?? false) {
                $newsSubmenu[] = [
                    'name' => 'Kategori Beasiswa',
                    'route' => 'admin.scholarship-category.index',
                    'visible' => true,
                ];
            }

            $menuItems[] = [
                'name' => 'Manajemen Beasiswa',
                'icon' => 'scholarship',
                'visible' => true,
                'submenu' => $newsSubmenu,
            ];
        }

        // Mengelompokkan Prestasi dan Jenis Prestasi dalam dropdown "Manajemen Prestasi"
        if (($permissions['achievements'] ?? false) || ($permissions['achievementtype'] ?? false)) {
            $achievementSubmenu = [];

            if ($permissions['achievements'] ?? false) {
                $achievementSubmenu[] = [
                    'name' => 'Prestasi',
                    'route' => 'admin.achievements.index',
                    'visible' => true,
                ];
            }

            if ($permissions['achievementtype'] ?? false) {
                $achievementSubmenu[] = [
                    'name' => 'Jenis Prestasi',
                    'route' => 'admin.achievement-type.index',
                    'visible' => true,
                ];
            }

            $menuItems[] = [
                'name' => 'Manajemen Prestasi',
                'icon' => 'award',
                'visible' => true,
                'submenu' => $achievementSubmenu,
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

        if ($permissions['aspiration'] ?? false) {
            $menuItems[] = [
                'name' => 'Aspirasi',
                'route' => 'admin.aspiration.index',
                'icon' => 'aspiration',
                'visible' => true,
            ];
        }

        if ($permissions['mpm'] ?? false) {
            $menuItems[] = [
                'name' => 'Manajemen MPM',
                'route' => 'admin.mpm.index',
                'icon' => 'organization',
                'visible' => true,
            ];
        }
        if ($permissions['bem'] ?? false) {
            $menuItems[] = [
                'name' => 'Manajemen BEM',
                'route' => 'admin.bem.index',
                'icon' => 'organization',
                'visible' => true,
            ];
        }

        if ($permissions['downloads'] ?? false) {
            $menuItems[] = [
                'name' => 'Unduhan',
                'route' => 'admin.downloads.index',
                'icon' => 'download',
                'visible' => true,
            ];
        }

        // Tambahkan menu untuk fitur organizationadmin (hanya untuk kemahasiswaan)
        if ($permissions['organizationadmin'] ?? false) {
            $menuItems[] = [
                'name' => 'Kelola Admin Organisasi',
                'route' => 'admin.organization-admins.index',
                'icon' => 'user-shield',
                'visible' => true,
            ];
        }

        // Tambahkan menu untuk fitur carousel (hanya untuk kemahasiswaan)
        if ($permissions['carousel'] ?? false) {
            $menuItems[] = [
                'name' => 'Kelola Carousel',
                'route' => 'admin.carousel.index',
                'icon' => 'image',
                'visible' => true,
            ];
        }

        return array_filter($menuItems, fn($item) => $item['visible'] ?? true);
    }
}