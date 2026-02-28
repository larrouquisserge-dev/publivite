"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStore } from '@/hooks/useStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard, FileText, PlusCircle, Image, Users, CalendarClock,
  History, BarChart3, CreditCard, Settings, ChevronLeft, ChevronRight,
  Coins, LogOut, Moon, Sun,
} from 'lucide-react';

const menuItems = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mes annonces', href: '/ads', icon: FileText },
  { label: 'Créer une annonce', href: '/ads/new', icon: PlusCircle },
  { label: 'Galerie d\'images', href: '/images', icon: Image },
  { type: 'separator' as const },
  { label: 'Comptes Leboncoin', href: '/accounts', icon: Users },
  { label: 'Tâches planifiées', href: '/tasks', icon: CalendarClock },
  { label: 'Historique', href: '/history', icon: History },
  { label: 'Statistiques', href: '/stats', icon: BarChart3 },
  { type: 'separator' as const },
  { label: 'Acheter des crédits', href: '/credits', icon: CreditCard },
  { label: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, credits, theme, setTheme } = useStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-900',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
          {sidebarOpen && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-sm">
                LB
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">LBC Manager</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              if ('type' in item && item.type === 'separator') {
                return <div key={index} className="my-3 h-px bg-gray-200 dark:bg-gray-700" />;
              }
              if (!('href' in item)) return null;
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-orange-500')} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 dark:border-gray-700">
          {/* Credits */}
          {sidebarOpen && (
            <Link
              href="/credits"
              className="mb-3 flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm dark:bg-orange-900/20"
            >
              <Coins className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-700 dark:text-orange-300">{credits} crédits</span>
            </Link>
          )}

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
              !sidebarOpen && 'justify-center px-2'
            )}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {sidebarOpen && <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
