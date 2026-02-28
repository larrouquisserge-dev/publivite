import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number | null;
  category: string;
  subCategory?: string;
  type: 'particulier' | 'pro';
  tags: string[];
  images: string[];
  attributes: Record<string, string | string[]>;
  status: 'draft' | 'published' | 'archived';
  shipping: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeboncoinAccount {
  id: string;
  email: string;
  password: string;
  phone: string;
  hidePhone: boolean;
  isActive: boolean;
  lastVerifiedAt: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  adId: string;
  accountId: string;
  type: 'publish' | 'republish';
  scheduledAt: string;
  cities: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  creditsUsed: number;
  errorMessage: string | null;
  executedAt: string | null;
  createdAt: string;
}

export interface Publication {
  id: string;
  adId: string;
  accountId: string;
  taskId: string | null;
  city: string;
  status: 'success' | 'failed';
  leboncoinUrl: string | null;
  errorMessage: string | null;
  publishedAt: string;
}

export interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // User
  user: {
    id: string;
    email: string;
    name: string;
    credits: number;
    defaultCity: string;
  } | null;
  setUser: (user: AppState['user']) => void;

  // Ads
  ads: Ad[];
  addAd: (ad: Ad) => void;
  updateAd: (id: string, updates: Partial<Ad>) => void;
  deleteAd: (id: string) => void;

  // Accounts
  accounts: LeboncoinAccount[];
  addAccount: (account: LeboncoinAccount) => void;
  updateAccount: (id: string, updates: Partial<LeboncoinAccount>) => void;
  deleteAccount: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Publications
  publications: Publication[];
  addPublication: (pub: Publication) => void;

  // Credits
  credits: number;
  addCredits: (amount: number) => void;
  useCredits: (amount: number) => boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // User
      user: {
        id: 'demo-user',
        email: 'demo@lbc-manager.fr',
        name: 'Utilisateur Demo',
        credits: 50,
        defaultCity: 'Paris',
      },
      setUser: (user) => set({ user }),

      // Ads
      ads: [],
      addAd: (ad) => set((state) => ({ ads: [ad, ...state.ads] })),
      updateAd: (id, updates) =>
        set((state) => ({
          ads: state.ads.map((ad) => (ad.id === id ? { ...ad, ...updates, updatedAt: new Date().toISOString() } : ad)),
        })),
      deleteAd: (id) => set((state) => ({ ads: state.ads.filter((ad) => ad.id !== id) })),

      // Accounts
      accounts: [],
      addAccount: (account) => set((state) => ({ accounts: [account, ...state.accounts] })),
      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc)),
        })),
      deleteAccount: (id) => set((state) => ({ accounts: state.accounts.filter((acc) => acc.id !== id) })),

      // Tasks
      tasks: [],
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      // Publications
      publications: [],
      addPublication: (pub) => set((state) => ({ publications: [pub, ...state.publications] })),

      // Credits
      credits: 50,
      addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
      useCredits: (amount) => {
        const state = get();
        if (state.credits >= amount) {
          set({ credits: state.credits - amount });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'lbc-manager-storage',
    }
  )
);
