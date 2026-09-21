import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Shirt,
  MessageSquare,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

export default function Profile() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await Promise.all([
        supabase.from('items').delete().eq('seller_id', user.id),
        supabase.from('favorites').delete().eq('user_id', user.id),
        supabase.from('messages').delete().eq('sender_id', user.id),
        supabase.from('messages').delete().eq('receiver_id', user.id),
        supabase.from('orders').delete().or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`),
      ]);
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('注销失败，请重试');
    } finally {
      setDeleting(false);
    }
  };
  const [closetCount, setClosetCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Guest';

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      if (!user?.id) {
        if (!cancelled) {
          setClosetCount(0); setFavoritesCount(0);
          setMessagesCount(0); setOrdersCount(0);
        }
        return;
      }
      const [{ count: cCount }, { count: fCount }, { count: mCount }, { count: oCount }] = await Promise.all([
        supabase.from('items').select('id', { count: 'exact', head: true }).eq('seller_id', user.id),
        supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('messages').select('id', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .is('read_at', null),
        supabase.from('orders').select('id', { count: 'exact', head: true })
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`),
      ]);
      if (!cancelled) {
        setClosetCount(cCount || 0);
        setFavoritesCount(fCount || 0);
        setMessagesCount(mCount || 0);
        setOrdersCount(oCount || 0);
      }
    };

    loadCounts();
    return () => { cancelled = true; };
  }, [user?.id, location.pathname]);

  const menuItems = [
    {
      title: 'Messages',
      subtitle: '查看与买家或卖家的私信',
      icon: <MessageSquare className="w-5 h-5" />,
      count: messagesCount,
      unread: messagesCount,
      to: '/messages',
    },
    {
      title: 'Track Order',
      subtitle: '查看订单状态、物流和晒单入口',
      icon: <Package className="w-5 h-5" />,
      count: ordersCount,
      to: '/orders',
    },
    {
      title: 'My Closet',
      subtitle: '管理你发布过的闲置商品',
      icon: <Shirt className="w-5 h-5" />,
      count: closetCount,
      to: '/my-closet',
    },
    {
      title: 'Favorites',
      subtitle: '收藏你喜欢的商品和灵感',
      icon: <Heart className="w-5 h-5" />,
      count: favoritesCount,
      to: '/favorites',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <div className="rounded-3xl border border-border/50 bg-secondary/30 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-black">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Personal Profile</p>
              <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight uppercase mt-1">
                {displayName}&apos;S CLOSET
              </h1>
              <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                在这里查看你的订单、发布记录和晒单内容。后面我们还可以继续加编辑资料、头像、收货地址这些功能。
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-border/50 p-5 bg-background">
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="mt-2 text-2xl font-black">{ordersCount}</p>
          </div>
          <div className="rounded-2xl border border-border/50 p-5 bg-background">
            <p className="text-xs text-muted-foreground">Closet</p>
            <p className="mt-2 text-2xl font-black">{closetCount}</p>
          </div>
          <div className="rounded-2xl border border-border/50 p-5 bg-background">
            <p className="text-xs text-muted-foreground">Messages</p>
            <p className="mt-2 text-2xl font-black">{messagesCount}</p>
          </div>
          <div className="rounded-2xl border border-border/50 p-5 bg-background">
            <p className="text-xs text-muted-foreground">Favorites</p>
            <p className="mt-2 text-2xl font-black">{favoritesCount}</p>
          </div>
        </div>

        <div className="space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="group flex items-center justify-between rounded-2xl border border-border/50 bg-background p-5 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
                  {item.icon}
                </div>

                <div>
                  <h2 className="text-base font-semibold">{item.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                {item.unread > 0 ? (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center leading-none">
                    {item.unread}
                  </span>
                ) : (
                  <span className="text-sm">{item.count}</span>
                )}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}

        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="text-xs text-muted-foreground/50 hover:text-red-400 transition-colors underline underline-offset-2"
          >
            注销账号
          </button>
        </div>

        {deleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteDialogOpen(false)} />
            <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-sm p-7 text-center">
              <p className="text-3xl mb-3">♡</p>
              <h2 className="font-display text-xl font-black uppercase tracking-tight mb-3">确认注销账号？</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                你的所有数据将被永久删除，包括商品、消息和收藏记录，且无法恢复。
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                不管怎样，希望你生活愉快 ❤️
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
                >
                  再想想
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? '注销中…' : '确认注销'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
