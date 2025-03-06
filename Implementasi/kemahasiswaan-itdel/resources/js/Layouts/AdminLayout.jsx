import { Link } from '@inertiajs/react';

export default function AdminLayout({ children }) {
    return (
        <div className="wrapper" style={{ display: 'flex' }}>
            {/* Sidebar */}
            <nav className="sidebar" style={{ width: '200px', background: '#333', color: 'white', padding: '20px' }}>
                <ul>
                    <li><Link href={route('admin.dashboard')} style={{ color: 'white' }}>Dashboard</Link></li>
                    <li><Link href={route('users.index')} style={{ color: 'white' }}>Users</Link></li>
                </ul>
            </nav>

            {/* Main Content */}
            <div className="main" style={{ flex: 1, padding: '20px', border: '2px solid red' }}>
                {children}
            </div>
        </div>
    );
}
    