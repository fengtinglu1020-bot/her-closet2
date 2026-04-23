import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Shirt,
  Image as ImageIcon,
  Heart,
  ChevronRight,
} from 'lucide-react';

function getLocalCount(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]').length;
  } catch (error) {
    console.error(`读取 ${key} 失败:`, error);
    return 0;
  }
}

export default function Profile() {
  const stats = useMemo(() => {
    return {
      orders: getLocalCount('orders'),
      items: getLocalCount('items'),
      reviews: getLocalCount('reviews'),
      favorites: getLocalCount('favorites'),
    };
  }, []);

  const menuItems = [
    {
      title: 'Track Order',
      subtitle: '查看订单状态、物流和晒单入口',
      icon: <Package className="w-5 h-5" />,
      count: stats.orders,
      to: '/orders',
    },
    {
      title: 'My Closet',
      subtitle: '管理你发布过的闲置商品',
      icon: <Shirt className="w-5 h-5" />,
      count: stats.items,
      to: '/my-closet',
    },
    {
      title: 'My Reviews',
      subtitle: '查看你分享过的出片和晒单',
      icon: <ImageIcon className="w-5 h-5" />,
      count: stats.reviews,
      to: '/my-reviews',
    },
    {
      title: 'Favorites',
      subtitle: '收藏你喜欢的商品和灵感',
      icon: <Heart className="w-5 h-5" />,
      count: stats.favorites,
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
              T
            </div>

            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Personal Profile</p>
              <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight uppercase mt-1">
                Tinglu&apos;s Closet
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
            <p className="mt-2 text-2xl font-black">{stats.orders}</p>
          </div>
          <div className="rounded-2xl border border-border/50 p-5 bg-background">
            <p className="text-xs text-muted-foreground">Closet</p>
            <p className="mt-2 text-2xl font-black">{stats.items}</p>
          </div>
          <div className="rounded-2xl border border-border/50 p-5 bg-background">
            <p className="text-xs text-muted-foreground">Reviews</p>
            <p className="mt-2 text-2xl font-black">{stats.reviews}</p>
          </div>
          <div className="rounded-2xl border border-border/50 p-5 bg-background">
            <p className="text-xs text-muted-foreground">Favorites</p>
            <p className="mt-2 text-2xl font-black">{stats.favorites}</p>
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
                <span className="text-sm">{item.count}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
