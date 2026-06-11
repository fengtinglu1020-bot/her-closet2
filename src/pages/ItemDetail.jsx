import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Tag, Star, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeToggling, setLikeToggling] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [ordering, setOrdering] = useState(false);

  // Load existing favorite state once both item and user are available
  useEffect(() => {
    if (!user?.id || !item?.id) return;
    supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', item.id)
      .maybeSingle()
      .then(({ data }) => setLiked(!!data));
  }, [user?.id, item?.id]);

  const handleLike = async () => {
    if (!user) {
      toast.error('请先登录后收藏');
      navigate('/login');
      return;
    }
    if (likeToggling) return;

    const next = !liked;
    setLiked(next); // optimistic update
    setLikeToggling(true);

    try {
      if (next) {
        await supabase.from('favorites').insert({ user_id: user.id, item_id: item.id });
      } else {
        await supabase.from('favorites').delete()
          .eq('user_id', user.id)
          .eq('item_id', item.id);
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
      setLiked(!next); // revert on error
    } finally {
      setLikeToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这件商品吗？此操作无法撤销。')) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast.success('商品已删除');
      navigate('/my-closet');
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  const handleBuy = async () => {
    if (!user) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }
    if (ordering) return;

    try {
      setOrdering(true);

      // Duplicate check: block if buyer already has a pending or accepted order for this item
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('item_id', item.id)
        .in('status', ['pending', 'accepted'])
        .maybeSingle();

      if (existing) {
        toast.error('你已经发送过购买请求了');
        return;
      }

      const { error } = await supabase.from('orders').insert({
        buyer_id:  user.id,
        seller_id: item.seller_id,
        item_id:   item.id,
      });

      if (error) throw error;
      toast.success('购买请求已发送，等待卖家确认');
    } catch (err) {
      console.error('下单失败:', err);
      toast.error('下单失败，请重试');
    } finally {
      setOrdering(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadItem = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!cancelled) setItem(data);
      } catch (error) {
        console.error('读取商品详情失败:', error);
        if (!cancelled) setItem(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadItem();
    return () => { cancelled = true; };
  }, [id]);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">商品不存在</p>
          <Link to="/" className="text-accent underline mt-2 inline-block">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [...(item.photo_urls || []), ...(item.outfit_urls || [])];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            返回
          </Link>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleLike} disabled={likeToggling}>
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-400 text-red-400' : 'text-muted-foreground'}`} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: item.name,
                    text: `${item.name} - ¥${item.price}`,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('链接已复制');
                }
              }}
            >
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {allImages.length > 0 ? (
              <>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-secondary">
                  <img
                    src={allImages[activeImage]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {allImages.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                          activeImage === i ? 'border-accent' : 'border-transparent'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[3/4] rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                暂无图片
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">{item.name}</h1>
              <p className="text-3xl font-serif font-bold text-accent mt-3">¥{item.price}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">尺码</span>
                <p className="font-medium mt-1">{item.size || '未填写'}</p>
              </div>

              {item.wear_count != null && (
                <div>
                  <span className="text-muted-foreground">穿着次数</span>
                  <p className="font-medium mt-1">{item.wear_count} 次</p>
                </div>
              )}

              {item.wash_count != null && (
                <div>
                  <span className="text-muted-foreground">洗涤次数</span>
                  <p className="font-medium mt-1">{item.wash_count} 次</p>
                </div>
              )}

              {item.location && (
                <div>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    出片地点
                  </span>
                  <p className="font-medium mt-1">{item.location}</p>
                </div>
              )}
            </div>

            {(item.style_tags?.length > 0 || item.scene_tags?.length > 0 || item.season_tags?.length > 0) && (
              <>
                <Separator />
                <div className="space-y-3">
                  {item.style_tags?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                      {item.style_tags.map((t) => (
                        <Badge key={t} variant="outline" className="rounded-full text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {item.scene_tags?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {item.scene_tags.map((t) => (
                        <Badge key={t} variant="outline" className="rounded-full text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {item.season_tags?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Star className="w-3.5 h-3.5 text-muted-foreground" />
                      {item.season_tags.map((t) => (
                        <Badge key={t} variant="outline" className="rounded-full text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            <div className="flex gap-3">
              {user?.id !== item.seller_id && (
                <Button
                  className="flex-1 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium"
                  onClick={handleBuy}
                  disabled={ordering}
                >
                  {ordering ? '发送中…' : '立即购买'}
                </Button>
              )}
              {item.seller_id && user?.id !== item.seller_id && (
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-xl"
                  onClick={() => {
                    if (!user) {
                      toast.error('请先登录后联系卖家');
                      navigate('/login');
                      return;
                    }
                    navigate(`/messages/${item.seller_id}__${item.id}`);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  联系卖家
                </Button>
              )}
              {user?.id === item.seller_id && (
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-xl text-red-500 border-red-200 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
