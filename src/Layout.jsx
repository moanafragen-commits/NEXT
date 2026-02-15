import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Layout({ children }) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const isDark = user?.dark_mode || false;

  return (
    <div className={isDark ? 'dark' : ''}>
      <style>{`
        .dark {
          --bg-primary: #111111;
          --bg-secondary: #1a1a1a;
          --bg-tertiary: #262626;
          --text-primary: #ffffff;
          --text-secondary: #a0a0a0;
          --border-color: rgba(255,255,255,0.1);
        }
        
        .dark .auto-theme {
          background-color: var(--bg-primary) !important;
          color: var(--text-primary) !important;
        }
        .dark .auto-theme-header {
          background-color: var(--bg-secondary) !important;
          border-color: var(--border-color) !important;
        }
        .dark .auto-theme-card {
          background-color: var(--bg-secondary) !important;
          border-color: var(--border-color) !important;
          color: var(--text-primary) !important;
        }
        .dark .auto-theme-input {
          background-color: var(--bg-tertiary) !important;
          border-color: var(--border-color) !important;
          color: var(--text-primary) !important;
        }
        .dark .auto-theme-text-secondary {
          color: var(--text-secondary) !important;
        }
        .dark .auto-theme-border {
          border-color: var(--border-color) !important;
        }
        .dark .auto-theme-nav {
          background-color: var(--bg-primary) !important;
          border-color: var(--border-color) !important;
        }
        .dark .auto-theme-nav a, .dark .auto-theme-nav button {
          color: var(--text-primary) !important;
        }
      `}</style>
      {children}
    </div>
  );
}