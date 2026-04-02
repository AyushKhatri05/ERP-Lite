const fs = require('fs');
const path = require('path');

// Create directory structure
const createDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Write file with content
const writeFile = (filePath, content) => {
    createDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content.trim());
    console.log(`✅ Created: ${filePath}`);
};

console.log('🚀 Generating COMPLETE FRONTEND for ERP Lite...\n');

// ============================================
// CONFIG FILES
// ============================================

// 1. package.json
writeFile('frontend/package.json', `{
  "name": "erp-lite-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "13.5.11",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.3.6",
    "react-hot-toast": "^2.4.0",
    "zustand": "^4.3.7",
    "@heroicons/react": "^2.0.16",
    "@headlessui/react": "^1.7.13",
    "react-hook-form": "^7.43.9"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.14",
    "tailwindcss": "^3.3.1",
    "postcss": "^8.4.21"
  }
}`);

// 2. tailwind.config.js
writeFile('frontend/tailwind.config.js', `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`);

// 3. postcss.config.js
writeFile('frontend/postcss.config.js', `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`);

// 4. .env.local
writeFile('frontend/.env.local', `NEXT_PUBLIC_API_URL=http://localhost:5000/api`);

// ============================================
// STYLES
// ============================================

// 5. globals.css
writeFile('frontend/src/styles/globals.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50;
}`);

// ============================================
// UTILS
// ============================================

// 6. api.js
writeFile('frontend/src/utils/api.js', `import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = \`Bearer \${token}\`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const apiService = {
    auth: {
        login: (credentials) => api.post('/auth/login', credentials),
        logout: () => api.post('/auth/logout'),
    },
    users: {
        getProfile: () => api.get('/users/profile/me'),
    },
};

export default apiService;`);

// ============================================
// HOOKS
// ============================================

// 7. useAuth.js
writeFile('frontend/src/hooks/useAuth.js', `import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiService from '../utils/api';
import toast from 'react-hot-toast';

const useAuth = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (credentials) => {
                set({ isLoading: true });
                try {
                    const response = await apiService.auth.login(credentials);
                    const { token, user } = response.data;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    set({ user, token, isAuthenticated: true, isLoading: false });
                    toast.success('Login successful!');
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    toast.error(error.response?.data?.message || 'Login failed');
                    throw error;
                }
            },

            logout: async () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                set({ user: null, token: null, isAuthenticated: false });
                toast.success('Logged out');
            },
        }),
        {
            name: 'auth-storage',
            getStorage: () => localStorage,
        }
    )
);

export default useAuth;`);

// ============================================
// LAYOUT COMPONENTS
// ============================================

// 8. ClientSidebar.jsx
writeFile('frontend/src/components/layout/ClientSidebar.jsx', `import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    HomeIcon, CubeIcon, ShoppingCartIcon, ChartBarIcon,
    UsersIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';

export default function ClientSidebar() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved) setCollapsed(JSON.parse(saved));
    }, []);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(!collapsed));
    };

    const menuItems = [
        { title: 'Dashboard', icon: HomeIcon, path: '/dashboard', roles: ['admin', 'inventory_manager', 'sales_staff'] },
        { title: 'Inventory', icon: CubeIcon, path: '/inventory', roles: ['admin', 'inventory_manager'] },
        { title: 'Sales', icon: ShoppingCartIcon, path: '/sales', roles: ['admin', 'inventory_manager', 'sales_staff'] },
        { title: 'Analytics', icon: ChartBarIcon, path: '/analytics', roles: ['admin', 'inventory_manager'] },
        { title: 'Users', icon: UsersIcon, path: '/admin/users', roles: ['admin'] },
        { title: 'Settings', icon: Cog6ToothIcon, path: '/profile', roles: ['admin', 'inventory_manager', 'sales_staff'] }
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

    if (!mounted) {
        return <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-indigo-600 to-purple-700"></div>;
    }

    return (
        <aside className={\`fixed left-0 top-0 h-screen bg-gradient-to-b from-indigo-600 to-purple-700 text-white shadow-2xl z-50 transition-all duration-300 \${collapsed ? 'w-20' : 'w-64'}\`}>
            <div className="h-full flex flex-col">
                <div className="p-4 flex items-center justify-between border-b border-white/20">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-indigo-600 font-bold text-xl">E</span>
                        </div>
                        {!collapsed && <span className="font-bold text-xl">ERP Lite</span>}
                    </div>
                    <button onClick={toggleSidebar} className="p-1 rounded-lg hover:bg-white/20">
                        {collapsed ? '→' : '←'}
                    </button>
                </div>

                <div className="p-4 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                            <span className="text-white font-semibold">{user?.username?.charAt(0) || 'U'}</span>
                        </div>
                        {!collapsed && (
                            <div>
                                <p className="font-medium">{user?.username}</p>
                                <p className="text-xs text-white/70">{user?.role}</p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    {filteredMenu.map((item) => (
                        <Link href={item.path} key={item.path}>
                            <div className={\`mx-2 px-4 py-3 rounded-lg flex items-center space-x-3 hover:bg-white/20 cursor-pointer \${router.pathname === item.path ? 'bg-white text-indigo-600' : ''}\`}>
                                <item.icon className="w-5 h-5" />
                                {!collapsed && <span className="text-sm">{item.title}</span>}
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/20">
                    <button onClick={logout} className="w-full px-4 py-3 rounded-lg flex items-center space-x-3 hover:bg-white/20">
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                        {!collapsed && <span className="text-sm">Logout</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}`);

// 9. Navbar.jsx
writeFile('frontend/src/components/layout/Navbar.jsx', `import { useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, BellIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-40 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                        <BellIcon className="h-5 w-5 text-gray-600" />
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                    </button>

                    <div className="relative">
                        <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">{user?.username?.charAt(0).toUpperCase()}</span>
                            </div>
                            <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1">
                                <Link href="/profile"><div className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">Profile</div></Link>
                                <Link href="/settings"><div className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">Settings</div></Link>
                                <div className="border-t border-gray-200 my-1"></div>
                                <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600">Sign out</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}`);

// 10. DashboardLayout.jsx
writeFile('frontend/src/components/layout/DashboardLayout.jsx', `import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import useAuth from '../../hooks/useAuth';

const Sidebar = dynamic(() => import('./ClientSidebar'), { ssr: false });

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="ml-64">
                <Navbar />
                <main className="p-6">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}`);

console.log('✅ Part 1 complete! Run this script again after adding Part 2');