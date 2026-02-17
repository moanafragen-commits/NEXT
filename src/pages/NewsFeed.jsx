import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Newspaper, RefreshCw, Loader2, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import { generateNews } from '@/components/news/NewsGenerator';
import BottomNav from '@/components/navigation/BottomNav';
import NewsArticleCard from '@/components/news/NewsArticleCard';
import ShareNewsSheet from '@/components/news/ShareNewsSheet';

const CATEGORY_FILTERS = [
  { key: 'all', label: 'Alle', emoji: '📰' },
  { key: 'breaking', label: 'Breaking', emoji: '🔴' },
  { key: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { key: 'sport', label: 'Sport', emoji: '⚽' },
  { key: 'klatsch', label: 'Klatsch', emoji: '💬' },
  { key: 'musik', label: 'Musik', emoji: '🎵' },
  { key: 'gaming', label: 'Gaming', emoji: '🎮' },
  { key: 'politik', label: 'Politik', emoji: '🏛️' },
  { key: 'wissenschaft', label: 'Wissenschaft', emoji: '🔬' },
];

export default function NewsFeed() {
  const queryClient = useQueryClient();
  const [shareArticle, setShareArticle] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['news-articles', user?.email],
    queryFn: () => base44.entities.NewsArticle.filter({ user_email: user.email }, '-created_date', 30),
    enabled: !!user
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const generateMutation = useMutation({
    mutationFn: () => generateNews(user.email, characters),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news-articles'] })
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.NewsArticle.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news-articles'] })
  });

  const filteredArticles = activeFilter === 'all' 
    ? articles 
    : articles.filter(a => a.category === activeFilter);

  const unreadCount = articles.filter(a => !a.is_read).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white auto-theme">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/[0.06] auto-theme-header">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Feed')}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">Nachrichten</h1>
                <BadgeCheck className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              {unreadCount > 0 && (
                <p className="text-[11px] text-blue-400">{unreadCount} ungelesene Artikel</p>
              )}
            </div>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 rounded-full"
          >
            {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
            Neu
          </Button>
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
          {CATEGORY_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === f.key 
                  ? 'bg-white text-black' 
                  : 'bg-white/[0.06] text-gray-400 hover:bg-white/[0.1]'
              }`}
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
              {f.key !== 'all' && (
                <span className="text-[10px] opacity-60">
                  {articles.filter(a => a.category === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">{activeFilter === 'all' ? 'Keine Nachrichten' : `Keine ${CATEGORY_FILTERS.find(f => f.key === activeFilter)?.label || ''}-Artikel`}</p>
            {activeFilter === 'all' && (
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="mt-4 bg-emerald-600 hover:bg-emerald-500 rounded-full"
              >
                Nachrichten generieren
              </Button>
            )}
          </div>
        ) : (
          <div>
            {filteredArticles.map((article) => (
              <NewsArticleCard
                key={article.id}
                article={article}
                characters={characters}
                onMarkRead={(id) => markReadMutation.mutate(id)}
                onShare={(a) => setShareArticle(a)}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav user={user} />

      {shareArticle && (
        <ShareNewsSheet
          open={!!shareArticle}
          onClose={() => setShareArticle(null)}
          article={shareArticle}
        />
      )}
    </div>
  );
}