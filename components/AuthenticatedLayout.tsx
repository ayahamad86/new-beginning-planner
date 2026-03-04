'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Heart,
  LogOut,
  Menu,
  TrendingUp,
  X,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
  { href: '/income', label: 'Income', icon: <DollarSign size={20} /> },
  { href: '/bills', label: 'Bills', icon: <CreditCard size={20} /> },
  { href: '/emergency', label: 'Emergency Fund', icon: <TrendingUp size={20} /> },
  { href: '/reflection', label: 'Reflection', icon: <Heart size={20} /> },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(storedUser));
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:bg-white md:border-r md:border-gray-200 md:flex md:flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">New Beginning</h2>
          <p className="text-xs text-gray-500 mt-1">Budget Planner</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              {link.icon}
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="px-4">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold text-gray-900">New Beginning</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="px-4 py-2 space-y-1 bg-gray-50 border-t border-gray-200">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon}
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-sm font-medium mt-4"
            >
              <LogOut size={16} />
              Logout
            </button>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
