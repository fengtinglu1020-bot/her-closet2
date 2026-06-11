import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItemCard from '@/components/home/ItemCard';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function MyCloset() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadMyItems = async () => {
      if (!user?.id) {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!cancelled) setItems(data || []);
      } catch (err) {
        console.error('读取我的闲置失败:', err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMyItems();
    return () => { cancelled = true; };
  }, [user?.id]);

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
            My Closet
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
            管理你发布过的闲置商品。
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
            <Shirt className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg text-muted-foreground">你还没有发布任何闲置</p>
            <Link to="/">
              <Button className="mt-5 h-11 px-6 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium">
                去发布闲置
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
