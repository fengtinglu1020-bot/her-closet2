import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import ItemCard from '@/components/home/ItemCard';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const initialTerm = searchParams.get('q') || '';
  const [term, setTerm] = useState(initialTerm);
  const [results, setResults] = useState([]);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialTerm);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Run search whenever ?q= param or user changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setTerm(q);
    if (q.trim()) {
      runSearch(q.trim());
    } else {
      setResults([]);
      setSearched(false);
    }
  }, [searchParams.get('q'), user?.id]);

  const runSearch = async (q) => {
    try {
      setLoading(true);
      setSearched(true);

      let query = supabase
        .from('items')
        .select('*')
        .or(
          `name.ilike.%${q}%,` +
          `location.ilike.%${q}%,` +
          `style_tags.cs.{${q}},` +
          `scene_tags.cs.{${q}},` +
          `season_tags.cs.{${q}}`
        )
        .order('created_at', { ascending: false });

      if (user?.id) query = query.neq('seller_id', user.id);

      const { data, error } = await query;

      if (error) {
        console.error('搜索失败:', error);
        toast.error(`搜索出错：${error.message}`);
        setResults([]);
        return;
      }

      setResults(data || []);

      // Load favorited IDs for result set
      if (user?.id && data?.length) {
        const { data: favs, error: favError } = await supabase
          .from('favorites')
          .select('item_id')
          .eq('user_id', user.id);
        if (favError) console.error('收藏状态加载失败:', favError);
        setFavoritedIds(new Set((favs || []).map(f => f.item_id)));
      } else {
        setFavoritedIds(new Set());
      }
    } catch (err) {
      console.error('搜索失败:', err);
      toast.error('搜索失败，请重试');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    setSearchParams({ q });
  };

  const handleClear = () => {
    setTerm('');
    setResults([]);
    setSearched(false);
    setSearchParams({});
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="搜索名称、风格、场景、季节、地点…"
                className="w-full h-10 pl-9 pr-9 rounded-full bg-secondary border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
              {term && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="flex-shrink-0 h-10 px-5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              搜索
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Not yet searched */}
        {!searched && !loading && (
          <div className="text-center py-24 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">输入关键词搜索闲置单品</p>
            <p className="text-xs mt-1 opacity-60">支持名称、风格标签、场景、季节、地点</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] rounded-2xl bg-secondary" />
                <div className="mt-3 h-4 rounded bg-secondary w-3/4" />
                <div className="mt-2 h-4 rounded bg-secondary w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && searched && results.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              找到 <span className="font-medium text-foreground">{results.length}</span> 件结果
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {results.map((item, i) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={i}
                  isFavorited={favoritedIds.has(item.id)}
                  onToggleFavorite={(itemId, next) => {
                    setFavoritedIds(prev => {
                      const updated = new Set(prev);
                      next ? updated.add(itemId) : updated.delete(itemId);
                      return updated;
                    });
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* No results */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg">暂无相关结果</p>
            <p className="text-sm mt-1">换个关键词试试？</p>
          </div>
        )}
      </div>
    </div>
  );
}
