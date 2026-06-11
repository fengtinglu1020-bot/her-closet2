import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import ItemCard from '@/components/home/ItemCard';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function Favorites() {
  const { user, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Redirect to /login once auth has resolved and user is not logged in
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      navigate('/login');
    }
  }, [isLoadingAuth, user, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const loadFavorites = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('favorites')
          .select('item_id, items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const resolved = (data || [])
          .map(row => row.items)
          .filter(Boolean);

        if (!cancelled) {
          setItems(resolved);
          setFavoritedIds(new Set(resolved.map(i => i.id)));
        }
      } catch (err) {
        console.error('读取收藏失败:', err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFavorites();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Unfavoriting from this page removes the card from the list immediately
  const handleToggleFavorite = (itemId, next) => {
    if (!next) {
      setItems(prev => prev.filter(i => i.id !== itemId));
      setFavoritedIds(prev => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }
  };

  // Hold render until auth is resolved to prevent flash before redirect
  if (isLoadingAuth || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回 Profile
        </Link>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Personal Center</p>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight uppercase mt-1">
            Favorites
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
            你收藏的所有单品。
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] rounded-2xl bg-secondary" />
                <div className="mt-3 h-4 rounded bg-secondary w-3/4" />
                <div className="mt-2 h-4 rounded bg-secondary w-1/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg text-muted-foreground">你还没有收藏任何单品</p>
            <Link
              to="/"
              className="mt-5 inline-block text-sm text-muted-foreground underline hover:text-foreground"
            >
              去逛逛
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item, i) => (
              <ItemCard
                key={item.id}
                item={item}
                index={i}
                isFavorited={favoritedIds.has(item.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
