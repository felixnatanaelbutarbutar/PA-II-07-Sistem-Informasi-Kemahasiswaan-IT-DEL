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
                'form' => true,
                'achievements' => true,
                'achievementtype' => true,
                'counseling' => true,
                'aspiration' => true,
                'aspirationcategory' => true,
                'mpm' => true,
                'bem' => true,
                'downloads' => true,
                'download-categories' => true,
                'organizationadmin' => true,
                'carousel' => true,
                'kegiatan' => true,
                'chatbot' => true,
                'directors' => true,

            ],
            'adminbem' => [
                'announcementcategory' => true, // Ditambahkan untuk submenu Kategori Pengumuman
                'announcement' => true, // Diubah dari 'pengumuman' menjadi 'announcement'
                'newscategory' => true,
                'news' => true,
                'achievements' => true,
                'achievementtype' => false,
                'scholarship' => false,
                'form' => false,
                'counseling' => false,
                'aspiration' => false,
                'aspirationcategory' => false,
                'bem' => true,
                'mpm' => false,
                'carousel' => false,
                'kegiatan' => true,
                'chatbot' => true,
                'downloads' => false,
                'download-categories' => false,
                'directors' => false,
            ],
            'adminmpm' => [
                'announcementcategory' => true, // Ditambahkan untuk submenu Kategori Pengumuman
                'announcement' => true, // Diubah dari 'pengumuman' menjadi 'announcement'
                'newscategory' => true,
                'news' => true,
                'achievements' => false,
                'achievementtype' => true,
                'scholarship' => false,
                'form' => false,
                'counseling' => false,
                'aspiration' => true,
                'aspirationcategory' => true,
                'bem' => false,
                'mpm' => true,
                'carousel' => false,
                'kegiatan' => true,
                'chatbot' => true,
                'downloads' => false,
                'download-categories' => false,
                'directors' => false,

            ],
            'mahasiswa' => [
                'pengumuman' => false,
                'beasiswa' => false,
                'news' => false,
                'newscategory' => false,
                'achievements' => false,
                'achievementtype' => false,
                'scholarship' => false,
                'form' => false,
                'counseling' => true,
                'aspiration' => false,
                'aspirationcategory' => false,
                'bem' => false,
                'carousel' => false,
                'kegiatan' => true,
                'chatbot' => false,
                'downloads' => false,
                'download-categories' => false,
                'directors' => false,

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

        // Inisialisasi menuItems
        $menuItems = [];

        // Menu untuk pengguna yang login (superadmin, kemahasiswaan, adminbem, adminmpm)
        if (in_array($role, ['superadmin', 'kemahasiswaan', 'adminbem', 'adminmpm'])) {
            $menuItems[] = [
                'name' => 'Dashboard',
                'route' => $role === 'superadmin' ? 'superadmin.dashboard' : 'admin.dashboard',
                'icon' => 'home',
                'visible' => true,
            ];
        }

        // Menu untuk mahasiswa (tanpa dashboard admin)
        if ($role === 'mahasiswa') {
            $menuItems = [];
        }

        // Menu untuk guest (tanpa dashboard)
        if ($role === 'guest') {
            $menuItems = [
                [
                    'name' => 'Beranda',
                    'route' => 'home',
                    'icon' => 'home',
                    'visible' => true,
                ],
                [
                    'name' => 'Berita',
                    'route' => 'news.guest.index',
                    'icon' => 'newspaper',
                    'visible' => true,
                ],
                [
                    'name' => 'Pengumuman',
                    'route' => 'announcement.guest.index',
                    'icon' => 'bell',
                    'visible' => true,
                ],
                [
                    'name' => 'Prestasi',
                    'route' => 'achievements.index',
                    'icon' => 'award',
                    'visible' => true,
                ],
                [
                    'name' => 'Kegiatan',
                    'route' => 'activities.guest.index',
                    'icon' => 'calendar',
                    'visible' => true,
                ],
                [
                    'name' => 'BEM',
                    'route' => 'bem.show',
                    'icon' => 'organization',
                    'visible' => true,
                ],
                [
                    'name' => 'MPM',
                    'route' => 'mpm.show',
                    'icon' => 'organization',
                    'visible' => true,
                ],
                [
                    'name' => 'Unduhan',
                    'route' => 'downloads.guest.index',
                    'icon' => 'download',
                    'visible' => true,
                ],
            ];
        }

        // Menu untuk Manajemen Pengumuman
        if (($permissions['announcement'] ?? false) || ($permissions['announcementcategory'] ?? false)) {
            $announcementSubmenu = [];
            if ($permissions['announcementcategory'] ?? false) {
                $announcementSubmenu[] = [
                    'name' => 'Kategori Pengumuman',
                    'route' => 'admin.announcement-category.index',
                    'visible' => true,
                ];
            }
            if ($permissions['announcement'] ?? false) {
                $announcementSubmenu[] = [
                    'name' => 'Pengumuman',
                    'route' => 'admin.announcement.index',
                    'visible' => true,
                ];
            }
            $menuItems[] = [
                'name' => 'Manajemen Pengumuman',
                'icon' => 'bell',
                'visible' => true,
                'submenu' => $announcementSubmenu,
            ];
        }

        // Menu untuk Manajemen Berita
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

        // Menu untuk Manajemen Beasiswa
        if (($permissions['scholarship'] ?? false) || ($permissions['scholarshipcategory'] ?? false)) {
            $scholarshipSubmenu = [];
            if ($permissions['scholarshipcategory'] ?? false) {
                $scholarshipSubmenu[] = [
                    'name' => 'Kategori Beasiswa',
                    'route' => 'admin.scholarship-category.index',
                    'visible' => true,
                ];
            }
            if ($permissions['scholarship'] ?? false) {
                $scholarshipSubmenu[] = [
                    'name' => 'Beasiswa',
                    'route' => 'admin.scholarship.index',
                    'visible' => true,
                ];
            }
            $menuItems[] = [
                'name' => 'Manajemen Beasiswa',
                'icon' => 'scholarship',
                'visible' => true,
                'submenu' => $scholarshipSubmenu,
            ];
        }

        // Menu untuk Manajemen Prestasi
        if (($permissions['achievements'] ?? false) || ($permissions['achievementtype'] ?? false)) {
            $achievementSubmenu = [];
            if ($permissions['achievementtype'] ?? false) {
                $achievementSubmenu[] = [
                    'name' => 'Jenis Prestasi',
                    'route' => 'admin.achievement-type.index',
                    'visible' => true,
                ];
            }
            if ($permissions['achievements'] ?? false) {
                $achievementSubmenu[] = [
                    'name' => 'Prestasi',
                    'route' => 'admin.achievements.index',
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

        // Menu untuk Manajemen Form
        if ($permissions['form'] ?? false) {
            $menuItems[] = [
                'name' => 'Manajemen Form',
                'route' => 'admin.form.index',
                'icon' => 'form',
                'visible' => true,
            ];
        }

        // Menu untuk Konseling
        if ($permissions['counseling'] ?? false) {
            $menuItems[] = [
                'name' => 'Konseling',
                'route' => $role === 'mahasiswa' ? 'counseling.index' : 'admin.counseling.index',
                'icon' => 'heart',
                'visible' => true,
            ];
        }

        // Menu untuk Manajemen Aspirasi
        if (($permissions['aspiration'] ?? false) || ($permissions['aspirationcategory'] ?? false)) {
            $aspirationSubmenu = [];
            if ($permissions['aspirationcategory'] ?? false) {
                $aspirationSubmenu[] = [
                    'name' => 'Kategori Aspirasi',
                    'route' => 'admin.aspiration-category.index',
                    'visible' => true,
                ];
            }
            if ($permissions['aspiration'] ?? false) {
                $aspirationSubmenu[] = [
                    'name' => 'Aspirasi',
                    'route' => $role === 'mahasiswa' ? 'aspiration.index' : 'admin.aspiration.index',
                    'visible' => true,
                ];
            }
            $menuItems[] = [
                'name' => 'Manajemen Aspirasi',
                'icon' => 'aspiration',
                'visible' => true,
                'submenu' => $aspirationSubmenu,
            ];
        }

        // Menu untuk Manajemen MPM
        if ($permissions['mpm'] ?? false) {
            $menuItems[] = [
                'name' => 'Manajemen MPM',
                'route' => 'admin.mpm.index',
                'icon' => 'organization',
                'visible' => true,
            ];
        }

        // Menu untuk Manajemen BEM
        if ($permissions['bem'] ?? false) {
            $menuItems[] = [
                'name' => 'Manajemen BEM',
                'route' => 'admin.bem.index',
                'icon' => 'organization',
                'visible' => true,
            ];
        }

        // Menu untuk Unduhan
        if ($permissions['downloads'] ?? false) {
            $downloadSubmenu = [];
            if ($permissions['download-categories'] ?? false) {
                $downloadSubmenu[] = [
                    'name' => 'Kategori Unduhan',
                    'route' => 'admin.download-categories.index',
                    'visible' => true,
                ];
            }
            $downloadSubmenu[] = [
                'name' => 'Unduhan',
                'route' => 'admin.downloads.index',
                'visible' => true,
            ];
            $menuItems[] = [
                'name' => 'Unduhan',
                'icon' => 'download',
                'visible' => true,
                'submenu' => $downloadSubmenu,
            ];
        }

        // Menu untuk Kelola Admin Organisasi
        if ($permissions['organizationadmin'] ?? false) {
            $menuItems[] = [
                'name' => 'Kelola Admin Organisasi',
                'route' => 'admin.organization-admins.index',
                'icon' => 'organization',
                'visible' => true,
            ];
        }

        // Menu untuk Kelola Carousel
        if ($permissions['carousel'] ?? false) {
            $menuItems[] = [
                'name' => 'Kelola Carousel',
                'route' => 'admin.carousel.index',
                'icon' => 'carousel',
                'visible' => true,
            ];
        }

        // Menu untuk Kegiatan
        if ($permissions['kegiatan'] ?? false) {
            $menuItems[] = [
                'name' => 'Kegiatan',
                'route' => $role === 'guest' ? 'activities.guest.index' : 'admin.activities.index',
                'icon' => 'calendar',
                'visible' => true,
            ];
        }

        // Menu untuk Kelola Chatbot Rules
        if ($permissions['chatbot'] ?? false) {
            $menuItems[] = [
                'name' => 'Kelola FAQ',
                'route' => 'admin.chatbot-rules.index',
                'icon' => 'chatbot',
                'visible' => true,
            ];
        }

        // Menu untuk Kelola Directors
        if ($permissions['directors'] ?? false) {
            $menuItems[] = [
                'name' => 'Kelola Sambutan Kemahasiswaan',
                'route' => 'admin.directors.index',
                'icon' => 'directors',
                'visible' => true,
            ];
        }

        return array_filter($menuItems, fn($item) => $item['visible'] ?? true);
    }
}
