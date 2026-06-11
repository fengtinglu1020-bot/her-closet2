import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const STATUS_LABEL = {
  pending:   '等待确认',
  accepted:  '已接受',
  declined:  '已拒绝',
  completed: '已完成',
  cancelled: '已取消',
};

const STATUS_CLASS = {
  pending:   'bg-amber-100 text-amber-700',
  accepted:  'bg-green-100 text-green-700',
  declined:  'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-secondary text-muted-foreground',
};

export default function Orders() {
  const { user, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('buying');
  const [updating, setUpdating] = useState(null); // order id being updated

  useEffect(() => {
    if (!isLoadingAuth && !user) navigate('/login');
  }, [isLoadingAuth, user, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, created_at, buyer_id, seller_id, items(id, name, price, photo_urls)')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!cancelled) setOrders(data || []);
      } catch (err) {
        console.error('读取订单失败:', err);
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  const updateStatus = async (orderId, status) => {
    if (updating) return;
    try {
      setUpdating(orderId);
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status } : o))
      );

      const labels = { accepted: '已接受', declined: '已拒绝', cancelled: '已取消', completed: '已完成' };
      toast.success(labels[status] || '已更新');
    } catch (err) {
      console.error('更新订单失败:', err);
      toast.error('操作失败，请重试');
    } finally {
      setUpdating(null);
    }
  };

  if (isLoadingAuth || !user) return null;

  const buying = orders.filter(o => o.buyer_id === user.id);
  const selling = orders.filter(o => o.seller_id === user.id);
  const displayed = tab === 'buying' ? buying : selling;

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
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase mt-1">
            Orders
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            查看你发出和收到的购买请求。
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('buying')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === 'buying'
                ? 'bg-foreground text-background'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            我买的 {buying.length > 0 && `(${buying.length})`}
          </button>
          <button
            onClick={() => setTab('selling')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === 'selling'
                ? 'bg-foreground text-background'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            我卖的 {selling.length > 0 && `(${selling.length})`}
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-border/50 p-5 flex gap-4">
                <div className="w-24 h-24 rounded-2xl bg-secondary flex-shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-secondary rounded w-1/3" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                  <div className="h-4 bg-secondary rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-3xl border border-border/50 bg-secondary/20 p-10 text-center">
            <Package className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              {tab === 'buying' ? '你还没有发出过购买请求' : '还没有人向你购买'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {tab === 'buying' ? '去首页浏览喜欢的商品吧' : '发布闲置，等待买家联系你'}
            </p>
            <Link to="/" className="inline-block mt-5">
              <Button className="rounded-full">去首页看看</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((order) => {
              const cover = order.items?.photo_urls?.[0];
              const isBuyer = order.buyer_id === user.id;
              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-border/50 bg-background p-5 sm:p-6"
                >
                  <div className="flex gap-4">
                    <Link to={`/item/${order.items?.id}`} className="flex-shrink-0">
                      {cover ? (
                        <img
                          src={cover}
                          alt={order.items?.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-secondary" />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <Link
                            to={`/item/${order.items?.id}`}
                            className="text-base font-semibold mt-0.5 truncate block hover:underline"
                          >
                            {order.items?.name || '商品已删除'}
                          </Link>
                          <p className="text-accent font-bold mt-1">
                            ¥{order.items?.price ?? '--'}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_CLASS[order.status]}`}>
                          {STATUS_LABEL[order.status]}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(order.created_at).toLocaleString('zh-CN')}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {/* Seller: accept / decline pending orders */}
                        {!isBuyer && order.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="rounded-full h-8 px-4 text-xs bg-foreground text-background hover:bg-foreground/90"
                              disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, 'accepted')}
                            >
                              接受
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full h-8 px-4 text-xs text-red-500 border-red-200 hover:bg-red-50"
                              disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, 'declined')}
                            >
                              拒绝
                            </Button>
                          </>
                        )}
                        {/* Seller: mark accepted order as completed */}
                        {!isBuyer && order.status === 'accepted' && (
                          <Button
                            size="sm"
                            className="rounded-full h-8 px-4 text-xs bg-foreground text-background hover:bg-foreground/90"
                            disabled={updating === order.id}
                            onClick={() => updateStatus(order.id, 'completed')}
                          >
                            标记完成
                          </Button>
                        )}
                        {/* Buyer: cancel pending order */}
                        {isBuyer && order.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full h-8 px-4 text-xs text-muted-foreground"
                            disabled={updating === order.id}
                            onClick={() => updateStatus(order.id, 'cancelled')}
                          >
                            取消请求
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
