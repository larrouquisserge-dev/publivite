"use client";

import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, theme } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <Header />
      <main
        className={cn(
          'pt-16 transition-all duration-300 min-h-screen',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
