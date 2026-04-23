import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Tag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ReviewDialog from '@/components/dialogs/ReviewDialog';
import { motion } from 'framer-motion';

export default function ItemDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = window.location.pathname.split('/item/')[1];
  const [liked, setLiked] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', itemId],
    queryFn: async () => {
      const items = await base44.entities.Item.filter({ id: itemId });
      return items[0];
    },
    enabled: !!itemId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', itemId],
    queryFn: () => base44.entities.Review.filter({ item_id: itemId }),
    enabled: !!itemId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-secondary border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">商品不存在</p>
          <Link to="/" className="text-accent underline mt-2 inline-block">返回首页</Link>
        </div>
      </div>
    );
  }

  const allImages = [...(item.photo_urls || []), ...(item.outfit_urls || [])];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            返回
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => setLiked(!liked)}>
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-400 text-red-400' : 'text-muted-foreground'}`} />
            </button>
            <button>
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
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

          {/* Details */}
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
                <p className="font-medium mt-1">{item.size}</p>
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
                    <MapPin className="w-3.5 h-3.5" />出片地点
                  </span>
                  <p className="font-medium mt-1">{item.location}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {(item.style_tags?.length > 0 || item.scene_tags?.length > 0 || item.season_tags?.length > 0) && (
              <>
                <Separator />
                <div className="space-y-3">
                  {item.style_tags?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                      {item.style_tags.map((t) => (
                        <Badge key={t} variant="outline" className="rounded-full text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                  {item.scene_tags?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {item.scene_tags.map((t) => (
                        <Badge key={t} variant="outline" className="rounded-full text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium">
                立即购买
              </Button>
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl"
                onClick={() => setReviewOpen(true)}
              >
                <Star className="w-4 h-4 mr-2" />
                写评价
              </Button>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="font-serif font-semibold text-lg">买家评价 ({reviews.length})</h3>
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${review.rating >= s ? 'fill-accent text-accent' : 'text-border'}`} />
                      ))}
                    </div>
                    {review.content && <p className="text-sm text-foreground">{review.content}</p>}
                    {(review.receipt_photo_urls?.length > 0 || review.outfit_photo_urls?.length > 0) && (
                      <div className="flex gap-2 mt-3 overflow-x-auto">
                        {[...(review.receipt_photo_urls || []), ...(review.outfit_photo_urls || [])].map((url, i) => (
                          <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <ReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        itemName={item.name}
        itemId={item.id}
      />
    </div>
  );
}
