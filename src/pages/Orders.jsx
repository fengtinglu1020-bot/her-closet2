import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, Share2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem('orders') || '[]');
  } catch (error) {
    console.error('读取 orders 失败:', error);
    return [];
  }
}

export default function Orders() {
  const [orders, setOrders] = useState(getOrders());

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [orders]);

  const handleShare = async (order) => {
    const text = `我在 HerCloset 买了 ${order.itemName || '一件衣服'}，快来看～`;
    const url = window.location.origin;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'HerCloset',
          text,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('链接已复制');
      }
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  const handleReview = (order) => {
    alert(`下一步我们会把晒单弹窗接在这里：订单 ${order.id}`);
  };

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
            Track Order
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            查看你的订单状态，也可以从这里直接分享和晒单。
          </p>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="rounded-3xl border border-border/50 bg-secondary/20 p-10 text-center">
            <Package className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">你还没有订单</p>
            <p className="text-sm text-muted-foreground mt-2">
              去逛逛喜欢的商品，买完之后这里就会出现记录。
            </p>
            <Link to="/" className="inline-block mt-5">
              <Button className="rounded-full">去首页看看</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-border/50 bg-background p-5 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row gap-5 sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary flex-shrink-0">
                      {order.itemImage ? (
                        <img
                          src={order.itemImage}
                          alt={order.itemName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          暂无图片
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Order #{order.id}</p>
                      <h2 className="text-lg font-semibold mt-1 truncate">
                        {order.itemName || '未命名商品'}
                      </h2>
                      <p className="text-accent font-bold mt-2">¥{order.price ?? '--'}</p>

                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Truck className="w-4 h-4" />
                          {order.status || 'completed'}
                        </span>
                        <span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => handleShare(order)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      分享
                    </Button>

                    <Button
                      type="button"
                      className="rounded-full"
                      onClick={() => handleReview(order)}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      晒单
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
