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
            // 'superadmin' => [
            //     'pengumuman' => true,
            //     'layanan' => true,
            //     'kegiatan' => true,
            //     'organisasi' => true,
            //     'beasiswa'=> true,
            //     'news'=> true,
            // ],
            'kemahasiswaan' => [
                'pengumuman' => true,
                'layanan' => true,
                'kegiatan' => false,
                'organisasi' => false,
                'beasiswa'=> true,
                'news'=> true,
                'achievements'=> true,
            ],
            'adminbem' => [
                'berita' => false,
                'pengumuman' => true,
                'layanan' => true,
                'kegiatan' => true,
                'organisasi' => false,
                'news'=> true,
                'achievements'=> false,

            ],
            'adminmpm' => [
                'berita' => false,
                'pengumuman' => true,
                'layanan' => true,
                'kegiatan' => false,
                'organisasi' => true,
                'news'=> false,
                'achievements'=> false,
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

        $menuItems = [
            [
                'name' => 'Dashboard',
                'route' => 'admin.dashboard',
                'icon' => 'home',
                'visible' => true,
            ]
        ];


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

        // Tambahkan menu Berita jika user memiliki akses ke "news"
        if ($permissions['news'] ?? false) {
            $menuItems[] = [
                'name' => 'Berita',
                'route' => 'admin.news.index',
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

        return $menuItems;
    }
}

