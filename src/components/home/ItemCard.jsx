import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function ItemCard({ item, index = 0, isFavorited = false, onToggleFavorite }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(isFavorited);
  const [toggling, setToggling] = useState(false);

  // Sync with parent-supplied isFavorited (e.g. after data reload)
  useEffect(() => {
    setLiked(isFavorited);
  }, [isFavorited]);

  const handleFavorite = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('请先登录后收藏');
      navigate('/login');
      return;
    }

    if (toggling) return;

    const next = !liked;
    setLiked(next); // optimistic update
    setToggling(true);

    try {
      if (next) {
        await supabase.from('favorites').insert({ user_id: user.id, item_id: item.id });
      } else {
        await supabase.from('favorites').delete()
          .eq('user_id', user.id)
          .eq('item_id', item.id);
      }
      onToggleFavorite?.(item.id, next);
    } catch (err) {
      console.error('Favorite toggle failed:', err);
      setLiked(!next); // revert on error
    } finally {
      setToggling(false);
    }
  };

  const mainImage = item.photo_urls?.[0] || item.outfit_urls?.[0];
  const hasOutfit = item.outfit_urls?.length > 0;
  const hasPhoto = item.photo_urls?.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link to={`/item/${item.id}`} className="group block">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary">
          {mainImage ? (
            <img
              src={mainImage}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              暂无图片
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            disabled={toggling}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${liked ? 'fill-red-400 text-red-400' : 'text-foreground/60'}`}
            />
          </button>

          {/* Tags */}
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {hasPhoto && (
              <Badge className="bg-white/90 text-foreground text-[10px] px-2 py-0.5 rounded-full border-0 backdrop-blur-sm">
                直拍
              </Badge>
            )}
            {hasOutfit && (
              <Badge className="bg-accent/90 text-white text-[10px] px-2 py-0.5 rounded-full border-0 backdrop-blur-sm">
                出片
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-3 px-1">
          <h3 className="text-sm font-sans font-medium text-foreground truncate">
            {item.name}
          </h3>
          <p className="text-base font-display font-bold text-accent mt-1 tracking-wide">
            ¥{item.price}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.location}{item.location && item.wear_count != null && ' · '}
            {item.wear_count != null && `穿过${item.wear_count}次`}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
