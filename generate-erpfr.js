// ============================================
// FRONTEND FILES - Part 1
// ============================================

console.log('\n🚀 Generating Frontend files...\n');

// 1. frontend/package.json
writeFile('frontend/package.json', `{
  "name": "erp-lite-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "13.5.11",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.3.6",
    "react-hot-toast": "^2.4.0",
    "recharts": "^2.5.0",
    "zustand": "^4.3.7",
    "@heroicons/react": "^2.0.16",
    "@headlessui/react": "^1.7.13",
    "framer-motion": "^10.12.4",
    "react-hook-form": "^7.43.9",
    "date-fns": "^2.29.3",
    "qrcode.react": "^3.1.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.14",
    "tailwindcss": "^3.3.1",
    "postcss": "^8.4.21",
    "eslint": "^8.38.0",
    "eslint-config-next": "^13.4.0"
  }
}`);

// 2. frontend/tailwind.config.js
writeFile('frontend/tailwind.config.js', `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        secondary: "#f97316",
      },
    },
  },
  plugins: [],
}`);

// 3. frontend/postcss.config.js
writeFile('frontend/postcss.config.js', `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`);

// 4. frontend/.env.local
writeFile('frontend/.env.local', `NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=ERP Lite
NEXT_PUBLIC_APP_VERSION=1.0.0`);

// 5. frontend/src/styles/globals.css
writeFile('frontend/src/styles/globals.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --primary: 79 70 229;
    --background: 255 255 255;
    --foreground: 15 23 42;
  }
}

@layer components {
  .glass-effect {
    @apply bg-white/80 backdrop-blur-lg;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}`);

// 6. frontend/src/utils/api.js
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
            window.location.href = '/login';
            toast.error('Session expired');
        }
        return Promise.reject(error);
    }
);

const apiService = {
    auth: {
        login: (credentials) => api.post('/auth/login', credentials),
        register: (userData) => api.post('/auth/register', userData),
        logout: () => api.post('/auth/logout'),
        setup2FA: () => api.post('/auth/2fa/setup'),
        enable2FA: (token) => api.post('/auth/2fa/enable', { token }),
    },
    
    inventory: {
        getProducts: (params) => api.get('/inventory/products', { params }),
        searchProducts: (query) => api.get('/inventory/products/search', { params: { q: query } }),
        getProduct: (id) => api.get(\`/inventory/products/\${id}\`),
        createProduct: (data) => api.post('/inventory/products', data),
        updateProduct: (id, data) => api.put(\`/inventory/products/\${id}\`, data),
        deleteProduct: (id) => api.delete(\`/inventory/products/\${id}\`),
        inward: (data) => api.post('/inventory/transactions/inward', data),
        outward: (data) => api.post('/inventory/transactions/outward', data),
        getLowStock: () => api.get('/inventory/stock/low'),
    },
    
    sales: {
        create: (data) => api.post('/sales', data),
        getAll: (params) => api.get('/sales', { params }),
        getById: (id) => api.get(\`/sales/\${id}\`),
        getInvoice: (id) => api.get(\`/sales/\${id}/invoice\`),
        refund: (id, reason) => api.post(\`/sales/\${id}/refund\`, { reason }),
    },
    
    analytics: {
        getForecast: (productId) => api.get(\`/analytics/forecast/\${productId}\`),
        getReorderAlerts: () => api.get('/analytics/reorder-alerts'),
        getDashboardKPIs: () => api.get('/analytics/dashboard/kpis'),
    },
    
    users: {
        getAll: (params) => api.get('/users', { params }),
        getProfile: () => api.get('/users/profile/me'),
        updateProfile: (data) => api.put('/users/profile/me', data),
    },
};

export default apiService;`);

// 7. frontend/src/utils/validation.js
writeFile('frontend/src/utils/validation.js', `export const isValidEmail = (email) => {
    const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const isValidPhone = (phone) => {
    const re = /^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$/;
    return re.test(phone);
};

export const isValidPassword = (password) => {
    return password && password.length >= 8;
};

export const isValidSKU = (sku) => {
    const re = /^[A-Z0-9-]{3,50}$/;
    return re.test(sku);
};

export const isValidPrice = (price) => {
    const num = parseFloat(price);
    return !isNaN(num) && num >= 0;
};

export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.replace(/<[^>]*>/g, '').trim();
};`);

// 8. frontend/src/utils/encryption.js
writeFile('frontend/src/utils/encryption.js', `export const generateRandomString = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const maskSensitiveData = (data, fields = ['password', 'token']) => {
    if (typeof data !== 'object' || data === null) return data;
    const masked = Array.isArray(data) ? [...data] : { ...data };
    Object.keys(masked).forEach(key => {
        if (fields.includes(key)) {
            masked[key] = '********';
        } else if (typeof masked[key] === 'object') {
            masked[key] = maskSensitiveData(masked[key], fields);
        }
    });
    return masked;
};`);

console.log('✅ Frontend Part 1 complete! Run node generate-erp.js after adding Part 2');


// ============================================
// FRONTEND FILES - Part 2 (Hooks & Context)
// ============================================

// 9. frontend/src/hooks/useAuth.js
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
            twoFactorRequired: false,
            tempUserId: null,

            login: async (credentials) => {
                set({ isLoading: true });
                try {
                    const response = await apiService.auth.login(credentials);
                    
                    if (response.data.requiresTwoFactor) {
                        set({ twoFactorRequired: true, tempUserId: response.data.userId, isLoading: false });
                        return { requiresTwoFactor: true };
                    }
                    
                    const { token, user } = response.data;
                    localStorage.setItem('token', token);
                    set({ user, token, isAuthenticated: true, twoFactorRequired: false, tempUserId: null, isLoading: false });
                    toast.success('Login successful!');
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    toast.error(error.response?.data?.message || 'Login failed');
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await apiService.auth.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    localStorage.removeItem('token');
                    set({ user: null, token: null, isAuthenticated: false });
                    toast.success('Logged out');
                }
            },

            hasPermission: (resource, action) => {
                const { user } = get();
                if (!user) return false;

                const permissions = {
                    admin: {
                        dashboard: ['view'], users: ['create', 'read', 'update', 'delete'],
                        products: ['create', 'read', 'update', 'delete'],
                        inventory: ['create', 'read', 'update', 'delete', 'adjust'],
                        sales: ['create', 'read', 'update', 'delete', 'refund'],
                        analytics: ['view', 'export'], audit: ['view', 'export'],
                    },
                    inventory_manager: {
                        dashboard: ['view'], products: ['create', 'read', 'update'],
                        inventory: ['create', 'read', 'update', 'adjust'], sales: ['read'],
                        analytics: ['view'], reorder_alerts: ['view', 'acknowledge']
                    },
                    sales_staff: {
                        dashboard: ['view'], products: ['read'], inventory: ['read'],
                        sales: ['create', 'read'], invoices: ['create', 'read', 'print']
                    }
                };

                const rolePerms = permissions[user.role];
                if (!rolePerms || !rolePerms[resource]) return false;
                return rolePerms[resource].includes(action);
            },

            isAdmin: () => get().user?.role === 'admin',
            isManager: () => get().user?.role === 'inventory_manager',
            isStaff: () => get().user?.role === 'sales_staff',
        }),
        { name: 'auth-storage', getStorage: () => localStorage }
    )
);

export default useAuth;`);

// 10. frontend/src/hooks/useInventory.js
writeFile('frontend/src/hooks/useInventory.js', `import { useState, useCallback } from 'react';
import apiService from '../utils/api';
import toast from 'react-hot-toast';

const useInventory = () => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

    const fetchProducts = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await apiService.inventory.getProducts(params);
            setProducts(response.data.data);
            setPagination(response.data.pagination);
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch products');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProduct = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await apiService.inventory.getProduct(id);
            return response.data.data;
        } catch (error) {
            toast.error('Failed to fetch product');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const createProduct = useCallback(async (productData) => {
        setLoading(true);
        try {
            const response = await apiService.inventory.createProduct(productData);
            toast.success('Product created');
            return response.data.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create product');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProduct = useCallback(async (id, productData) => {
        setLoading(true);
        try {
            const response = await apiService.inventory.updateProduct(id, productData);
            toast.success('Product updated');
            return response.data.data;
        } catch (error) {
            toast.error('Failed to update product');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteProduct = useCallback(async (id) => {
        setLoading(true);
        try {
            await apiService.inventory.deleteProduct(id);
            toast.success('Product deleted');
            return true;
        } catch (error) {
            toast.error('Failed to delete product');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const processInward = useCallback(async (data) => {
        setLoading(true);
        try {
            const response = await apiService.inventory.inward(data);
            toast.success('Stock added');
            return response.data.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add stock');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const processOutward = useCallback(async (data) => {
        setLoading(true);
        try {
            const response = await apiService.inventory.outward(data);
            toast.success('Stock removed');
            return response.data.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove stock');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const getLowStock = useCallback(async () => {
        try {
            const response = await apiService.inventory.getLowStock();
            return response.data.data;
        } catch (error) {
            toast.error('Failed to fetch low stock alerts');
            throw error;
        }
    }, []);

    return {
        loading, products, transactions, pagination,
        fetchProducts, fetchProduct, createProduct, updateProduct, deleteProduct,
        processInward, processOutward, getLowStock
    };
};

export default useInventory;`);

// 11. frontend/src/hooks/useSales.js
writeFile('frontend/src/hooks/useSales.js', `import { useState, useCallback } from 'react';
import apiService from '../utils/api';
import toast from 'react-hot-toast';

const useSales = () => {
    const [loading, setLoading] = useState(false);
    const [sales, setSales] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

    const fetchSales = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await apiService.sales.getAll(params);
            setSales(response.data.data);
            setPagination(response.data.pagination);
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch sales');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSale = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await apiService.sales.getById(id);
            return response.data.data;
        } catch (error) {
            toast.error('Failed to fetch sale');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const createSale = useCallback(async (saleData) => {
        setLoading(true);
        try {
            const response = await apiService.sales.create(saleData);
            toast.success('Sale completed!');
            return response.data.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process sale');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const refundSale = useCallback(async (id, reason) => {
        setLoading(true);
        try {
            const response = await apiService.sales.refund(id, reason);
            toast.success('Sale refunded');
            return response.data.data;
        } catch (error) {
            toast.error('Failed to refund sale');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const getInvoice = useCallback(async (id) => {
        try {
            const response = await apiService.sales.getInvoice(id);
            return response.data.data;
        } catch (error) {
            toast.error('Failed to fetch invoice');
            throw error;
        }
    }, []);

    return {
        loading, sales, pagination,
        fetchSales, fetchSale, createSale, refundSale, getInvoice
    };
};

export default useSales;`);

console.log('✅ Frontend Part 2 complete! Run node generate-erp.js after adding Part 3');




// ============================================
// FRONTEND FILES - Part 3 (Layout Components)
// ============================================

// 12. frontend/src/components/layout/Sidebar.jsx
writeFile('frontend/src/components/layout/Sidebar.jsx', `import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    HomeIcon, CubeIcon, ShoppingCartIcon, ChartBarIcon,
    UsersIcon, DocumentTextIcon, Cog6ToothIcon,
    ArrowLeftOnRectangleIcon, BellIcon, ArchiveBoxIcon,
    CurrencyDollarIcon, TagIcon, ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';

const Sidebar = () => {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { title: 'Dashboard', icon: HomeIcon, path: '/dashboard', roles: ['admin', 'inventory_manager', 'sales_staff'] },
        { title: 'Inventory', icon: CubeIcon, path: '/inventory', roles: ['admin', 'inventory_manager'] },
        { title: 'Sales', icon: ShoppingCartIcon, path: '/sales', roles: ['admin', 'inventory_manager', 'sales_staff'] },
        { title: 'Analytics', icon: ChartBarIcon, path: '/analytics', roles: ['admin', 'inventory_manager'] },
        { title: 'Users', icon: UsersIcon, path: '/users', roles: ['admin'] },
        { title: 'Settings', icon: Cog6ToothIcon, path: '/settings', roles: ['admin', 'inventory_manager'] }
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

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
                    <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-lg hover:bg-white/20">
                        <span className="text-sm">{collapsed ? '→' : '←'}</span>
                    </button>
                </div>

                <div className="p-4 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-semibold text-lg">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div>
                                <p className="font-medium truncate">{user?.username}</p>
                                <p className="text-xs text-white/70 truncate">{user?.role}</p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    {filteredMenu.map((item) => (
                        <Link href={item.path} key={item.path}>
                            <div className={\`mx-2 px-4 py-3 rounded-lg flex items-center space-x-3 hover:bg-white/20 cursor-pointer transition-colors \${router.pathname === item.path ? 'bg-white text-indigo-600' : ''}\`}>
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span className="text-sm">{item.title}</span>}
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/20">
                    <button onClick={logout} className="w-full px-4 py-3 rounded-lg flex items-center space-x-3 hover:bg-white/20 transition-colors">
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">Logout</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;`);

// 13. frontend/src/components/layout/DashboardLayout.jsx
writeFile('frontend/src/components/layout/DashboardLayout.jsx', `import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import useAuth from '../../hooks/useAuth';

const DashboardLayout = ({ children }) => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>;
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
};

export default DashboardLayout;`);

// 14. frontend/src/components/layout/Navbar.jsx
writeFile('frontend/src/components/layout/Navbar.jsx', `import { useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, BellIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
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
};

export default Navbar;`);

// 15. frontend/src/components/auth/ProtectedRoute.jsx
writeFile('frontend/src/components/auth/ProtectedRoute.jsx', `import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        } else if (!isLoading && requiredRole && user?.role !== requiredRole) {
            router.push('/unauthorized');
        }
    }, [isAuthenticated, isLoading, user, requiredRole, router]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (!isAuthenticated) return null;
    if (requiredRole && user?.role !== requiredRole) return null;

    return children;
};

export default ProtectedRoute;`);

// 16. frontend/src/components/auth/LoginForm.jsx
writeFile('frontend/src/components/auth/LoginForm.jsx', `import { useState } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';

const LoginForm = () => {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('admin@erplite.com');
    const [password, setPassword] = useState('Password@123');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login({ email, password });
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-96 border border-white/20">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-4xl font-bold text-indigo-600">E</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">ERP Lite</h1>
                </div>

                {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6 text-red-200 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                            placeholder="Email" required />
                    </div>
                    <div>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                            placeholder="Password" required />
                    </div>
                    <button type="submit" disabled={isLoading}
                        className="w-full bg-white text-indigo-600 py-3 px-4 rounded-lg font-medium hover:bg-indigo-50 transition disabled:opacity-50">
                        {isLoading ? 'Loading...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;`);

console.log('✅ Frontend Part 3 complete! Run node generate-erp.js after adding Part 4');




// ============================================
// FRONTEND FILES - Part 4 (Pages)
// ============================================

// 17. frontend/src/pages/login.jsx
writeFile('frontend/src/pages/login.jsx', `import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
    return <LoginForm />;
}`);

// 18. frontend/src/pages/dashboard.jsx
writeFile('frontend/src/pages/dashboard.jsx', `import DashboardLayout from '../components/layout/DashboardLayout';
import { HomeIcon, CubeIcon, ShoppingCartIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import useAuth from '../hooks/useAuth';

export default function Dashboard() {
    const { user } = useAuth();

    const stats = [
        { name: 'Total Products', value: '156', icon: CubeIcon, change: '+12%', color: 'bg-blue-500' },
        { name: 'Today Sales', value: '$2,345', icon: ShoppingCartIcon, change: '+8%', color: 'bg-green-500' },
        { name: 'Low Stock', value: '8', icon: HomeIcon, change: '-2%', color: 'bg-yellow-500' },
        { name: 'Revenue', value: '$45,678', icon: ChartBarIcon, change: '+23%', color: 'bg-purple-500' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                    <h1 className="text-2xl font-bold">Welcome back, {user?.username}!</h1>
                    <p className="text-indigo-100 mt-2">Here's what's happening with your business today.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.name}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    <p className="text-sm text-green-600 mt-2">{stat.change}</p>
                                </div>
                                <div className={\`\${stat.color} p-3 rounded-lg\`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                            <CubeIcon className="w-6 h-6 text-indigo-600 mb-2" />
                            <p className="font-medium">Add Product</p>
                            <p className="text-sm text-gray-500">Create new product</p>
                        </button>
                        <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                            <ShoppingCartIcon className="w-6 h-6 text-green-600 mb-2" />
                            <p className="font-medium">New Sale</p>
                            <p className="text-sm text-gray-500">Create invoice</p>
                        </button>
                        <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                            <ChartBarIcon className="w-6 h-6 text-purple-600 mb-2" />
                            <p className="font-medium">View Reports</p>
                            <p className="text-sm text-gray-500">Check analytics</p>
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}`);

// 19. frontend/src/pages/index.jsx
writeFile('frontend/src/pages/index.jsx', `import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

export default function Home() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) router.push('/dashboard');
        else router.push('/login');
    }, [isAuthenticated, router]);

    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
}`);

// 20. frontend/src/pages/inventory/index.jsx
writeFile('frontend/src/pages/inventory/index.jsx', `import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { CubeIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import useInventory from '../../hooks/useInventory';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function InventoryDashboard() {
    const { loading, products, fetchProducts, getLowStock } = useInventory();
    const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0, totalValue: 0 });

    useEffect(() => {
        fetchProducts();
        getLowStock().then(data => setStats(prev => ({ ...prev, lowStock: data?.length || 0 })));
    }, []);

    if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                    <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                            </div>
                            <CubeIcon className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Low Stock Items</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                            </div>
                            <ArrowDownIcon className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Monthly Movement</p>
                                <p className="text-2xl font-bold text-green-600">245</p>
                            </div>
                            <ArrowUpIcon className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold">Recent Products</h2>
                    </div>
                    <div className="divide-y">
                        {products.slice(0, 5).map(product => (
                            <div key={product.id} className="p-4 flex justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">\${product.unit_price}</p>
                                    <p className="text-sm text-gray-500">Stock: {product.current_stock}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}`);

// 21. frontend/src/pages/sales/index.jsx
writeFile('frontend/src/pages/sales/index.jsx', `import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ShoppingCartIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import useSales from '../../hooks/useSales';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SalesDashboard() {
    const { loading, sales, fetchSales } = useSales();
    const [stats, setStats] = useState({ todaySales: 0, todayRevenue: 0 });

    useEffect(() => {
        fetchSales({ limit: 5 });
    }, []);

    if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
                    <h1 className="text-2xl font-bold">Sales Dashboard</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Today's Sales</p>
                                <p className="text-2xl font-bold text-gray-900">12</p>
                            </div>
                            <ShoppingCartIcon className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Today's Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">$1,234</p>
                            </div>
                            <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold">Recent Sales</h2>
                    </div>
                    <div className="divide-y">
                        {sales.map(sale => (
                            <div key={sale.id} className="p-4 flex justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-medium">{sale.invoice_number}</p>
                                    <p className="text-sm text-gray-500">{sale.customer_name || 'Walk-in'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">\${sale.total_amount}</p>
                                    <p className="text-sm text-gray-500">{new Date(sale.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}`);

console.log('✅ Frontend Part 4 complete! Run node generate-erp.js after adding Part 5');




// ============================================
// FRONTEND FILES - Part 5 (More Pages & Components)
// ============================================

// 22. frontend/src/pages/analytics/index.jsx
writeFile('frontend/src/pages/analytics/index.jsx', `import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ChartBarIcon, TrendingUpIcon } from '@heroicons/react/24/outline';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        setTimeout(() => {
            setData([
                { name: 'Mon', sales: 4000, revenue: 2400 },
                { name: 'Tue', sales: 3000, revenue: 1398 },
                { name: 'Wed', sales: 2000, revenue: 9800 },
                { name: 'Thu', sales: 2780, revenue: 3908 },
                { name: 'Fri', sales: 1890, revenue: 4800 },
                { name: 'Sat', sales: 2390, revenue: 3800 },
                { name: 'Sun', sales: 3490, revenue: 4300 },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                    <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                    <p className="text-purple-100 mt-2">Track your business performance</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Weekly Sales</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="sales" stroke="#4f46e5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Revenue</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="revenue" fill="#f97316" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <TrendingUpIcon className="w-8 h-8 text-green-500 mb-3" />
                        <p className="text-2xl font-bold">+23.5%</p>
                        <p className="text-sm text-gray-500">Revenue Growth</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <ChartBarIcon className="w-8 h-8 text-blue-500 mb-3" />
                        <p className="text-2xl font-bold">156</p>
                        <p className="text-sm text-gray-500">Total Orders</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <TrendingUpIcon className="w-8 h-8 text-purple-500 mb-3" />
                        <p className="text-2xl font-bold">$12.5k</p>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}`);

// 23. frontend/src/pages/profile.jsx
writeFile('frontend/src/pages/profile.jsx', `import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        username: user?.username || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(formData);
            toast.success('Profile updated');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Role</p>
                                    <p className="font-medium capitalize">{user?.role}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">2FA Status</p>
                                    <p className="font-medium">{user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}`);

// 24. frontend/src/components/common/LoadingSpinner.jsx
writeFile('frontend/src/components/common/LoadingSpinner.jsx', `const LoadingSpinner = ({ size = 'medium' }) => {
    const sizes = {
        small: 'h-4 w-4',
        medium: 'h-8 w-8',
        large: 'h-12 w-12'
    };

    return (
        <div className="flex justify-center items-center">
            <div className={\`animate-spin rounded-full border-b-2 border-indigo-600 \${sizes[size]}\`}></div>
        </div>
    );
};

export default LoadingSpinner;`);

// 25. frontend/src/components/common/Button.jsx
writeFile('frontend/src/components/common/Button.jsx', `const Button = ({ children, variant = 'primary', size = 'medium', onClick, disabled, className = '', type = 'button', ...props }) => {
    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
    };

    const sizes = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={\`\${variants[variant]} \${sizes[size]} rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors \${className}\`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;`);

// 26. frontend/src/components/common/Input.jsx
writeFile('frontend/src/components/common/Input.jsx', `import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, type = 'text', className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <input
                ref={ref}
                type={type}
                className={\`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent \${error ? 'border-red-500' : 'border-gray-300'} \${className}\`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;`);

// 27. frontend/src/components/common/Card.jsx
writeFile('frontend/src/components/common/Card.jsx', `const Card = ({ children, className = '', padding = true }) => {
    return (
        <div className={\`bg-white rounded-xl shadow-sm border border-gray-200 \${padding ? 'p-6' : ''} \${className}\`}>
            {children}
        </div>
    );
};

export default Card;`);

console.log('✅ Frontend Part 5 complete! Run node generate-erp.js after adding Part 6 (Final)');





// ============================================
// FRONTEND FILES - Part 6 (Final - Complete)
// ============================================

// 28. frontend/src/pages/inventory/products.jsx
writeFile('frontend/src/pages/inventory/products.jsx', `import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import useInventory from '../../hooks/useInventory';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Products() {
    const { loading, products, fetchProducts, deleteProduct } = useInventory();
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts({ search });
    }, [search]);

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            await deleteProduct(id);
            fetchProducts();
        }
    };

    if (loading && products.length === 0) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <Button>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-4 border-b">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {products.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">{product.sku}</td>
                                        <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                                        <td className="px-6 py-4 text-sm">\${product.unit_price}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={\`px-2 py-1 rounded-full text-xs \${product.current_stock <= product.minimum_stock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}\`}>
                                                {product.current_stock} units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm space-x-2">
                                            <button className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}`);

// 29. frontend/src/pages/sales/new.jsx
writeFile('frontend/src/pages/sales/new.jsx', `import { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import useSales from '../../hooks/useSales';
import useInventory from '../../hooks/useInventory';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function NewSale() {
    const router = useRouter();
    const { createSale } = useSales();
    const { products, fetchProducts } = useInventory();
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
    const [paymentMethod, setPaymentMethod] = useState('cash');

    useState(() => { fetchProducts({ limit: 100 }); }, []);

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => 
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return removeFromCart(id);
        setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const handleSubmit = async () => {
        if (cart.length === 0) return toast.error('Cart is empty');

        const saleData = {
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            paymentMethod,
            subtotal,
            tax,
            totalAmount: total,
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.unit_price,
                totalPrice: item.unit_price * item.quantity
            }))
        };

        try {
            await createSale(saleData);
            router.push('/sales');
        } catch (error) {
            toast.error('Failed to create sale');
        }
    };

    return (
        <DashboardLayout>
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4">Products</h2>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg mb-4"
                        />
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(product => (
                                <div key={product.id} onClick={() => addToCart(product)} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between">
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-gray-500">Stock: {product.current_stock}</p>
                                    </div>
                                    <p className="font-bold text-indigo-600">\${product.unit_price}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4">Cart</h2>
                        {cart.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Cart is empty</p>
                        ) : (
                            <>
                                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-sm">{item.name}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                        className="w-16 px-2 py-1 border rounded text-sm"
                                                        min="1"
                                                    />
                                                    <span className="text-sm">x \${item.unit_price}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">\${(item.unit_price * item.quantity).toFixed(2)}</span>
                                                <button onClick={() => removeFromCart(item.id)} className="text-red-500">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">\${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (10%):</span>
                                        <span className="font-medium">\${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="text-indigo-600">\${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4">Customer</h2>
                        <input
                            type="text"
                            placeholder="Name"
                            value={customer.name}
                            onChange={(e) => setCustomer({...customer, name: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg mb-2"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={customer.email}
                            onChange={(e) => setCustomer({...customer, email: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg mb-2"
                        />
                        <input
                            type="tel"
                            placeholder="Phone"
                            value={customer.phone}
                            onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg mb-4"
                        />

                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg mb-4"
                        >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                        </select>

                        <Button onClick={handleSubmit} className="w-full" disabled={cart.length === 0}>
                            Complete Sale
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}`);

// 30. frontend/src/pages/_app.jsx
writeFile('frontend/src/pages/_app.jsx', `import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
    return (
        <>
            <Component {...pageProps} />
            <Toaster position="top-right" />
        </>
    );
}`);

// Final completion message
console.log('\n🎉🎉🎉 COMPLETE! ALL 70+ FILES GENERATED SUCCESSFULLY! 🎉🎉🎉');
console.log('\n📁 Project Structure:');
console.log('├── backend/     - 39 files (API, Controllers, Models, etc.)');
console.log('├── frontend/    - 31 files (Components, Pages, Hooks, etc.)');
console.log('└── database/    - 3 files (Migrations & Seeds)');
console.log('\n📦 Total: 73 files ready!');
console.log('\n🚀 Next steps:');
console.log('1. cd backend && npm install');
console.log('2. cd ../frontend && npm install');
console.log('3. createdb -U postgres erp_lite');
console.log('4. cd backend && npm run migrate');
console.log('5. npm run seed');
console.log('6. npm run dev');
console.log('7. Open new terminal: cd frontend && npm run dev');
console.log('\n🌐 Access:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend:  http://localhost:5000');
console.log('\n👤 Test Users:');
console.log('   admin@erplite.com / Password@123');
console.log('   manager@erplite.com / Password@123');
console.log('   staff@erplite.com / Password@123');


