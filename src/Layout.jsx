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
          .dark .auto-theme-nav svg {
            color: var(--text-primary) !important;
          }
          .dark .auto-theme h1,
          .dark .auto-theme h2,
          .dark .auto-theme h3,
          .dark .auto-theme p,
          .dark .auto-theme span,
          .dark .auto-theme a,
          .dark .auto-theme button {
            color: inherit;
          }
          .dark .auto-theme svg {
            color: inherit;
          }
          .dark .auto-theme .text-black {
            color: var(--text-primary) !important;
          }
          .dark .auto-theme .text-gray-500 {
            color: var(--text-secondary) !important;
          }
          .dark .auto-theme .text-gray-400 {
            color: #888 !important;
          }
          .dark .auto-theme .text-gray-600 {
            color: var(--text-secondary) !important;
          }
          .dark .auto-theme .text-gray-700 {
            color: #ccc !important;
          }
          .dark .auto-theme .bg-gray-100 {
            background-color: var(--bg-tertiary) !important;
          }
          .dark .auto-theme .bg-gray-50 {
            background-color: var(--bg-secondary) !important;
          }
          .dark .auto-theme .border-gray-200 {
            border-color: var(--border-color) !important;
          }
          .dark .auto-theme .border-gray-100 {
            border-color: var(--border-color) !important;
          }
          .dark .auto-theme .border-gray-50 {
            border-color: var(--border-color) !important;
          }
          .dark .auto-theme .hover\\:bg-gray-50:hover {
            background-color: var(--bg-tertiary) !important;
          }
          .dark .auto-theme .ring-gray-200 {
            --tw-ring-color: var(--border-color) !important;
          }
          .dark .auto-theme .ring-gray-300 {
            --tw-ring-color: var(--border-color) !important;
          }
          .dark .auto-theme .bg-gray-200 {
            background-color: var(--bg-tertiary) !important;
          }
          .dark .auto-theme .bg-gray-300 {
            background-color: #444 !important;
          }
          .dark .auto-theme .bg-red-50 {
            background-color: rgba(239, 68, 68, 0.1) !important;
          }
      `}</style>
      {children}
    </div>
  );
}