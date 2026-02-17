import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Newspaper, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import { generateNews } from '@/components/news/NewsGenerator';
import BottomNav from '@/components/navigation/BottomNav';
import NewsArticleCard from '@/components/news/NewsArticleCard';
import ShareNewsSheet from '@/components/news/ShareNewsSheet';

export default function NewsFeed() {
  const queryClient = useQueryClient();
  const [shareArticle, setShareArticle] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['news-articles', user?.email],
    queryFn: () => base44.entities.NewsArticle.filter({ user_email: user.email }, '-created_date', 20),
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-10 glass border-b border-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Newspaper className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold">Nachrichten</h1>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
            Neu
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-3 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Keine Nachrichten</p>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="mt-4 bg-emerald-600 hover:bg-emerald-500"
            >
              Erste Nachricht generieren
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            {articles.map((article) => (
              <NewsArticleCard
                key={article.id}
                article={article}
                onMarkRead={(id) => markReadMutation.mutate(id)}
                onShare={(a) => setShareArticle(a)}
              />
            ))}
          </AnimatePresence>
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