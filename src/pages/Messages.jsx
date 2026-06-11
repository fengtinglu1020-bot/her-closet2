import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function Messages() {
  const { user, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth && !user) navigate('/login');
  }, [isLoadingAuth, user, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        // Fetch all messages involving user (as sender or receiver),
        // newest first, with item details joined
        const { data, error } = await supabase
          .from('messages')
          .select('id, content, created_at, item_id, sender_id, receiver_id, read_at, items(id, name, photo_urls)')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by (other_user_id + item_id), keep only the latest message per pair
        const seen = new Map();
        for (const msg of (data || [])) {
          const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          const key = `${otherId}__${msg.item_id}`;
          if (!seen.has(key)) {
            seen.set(key, { ...msg, other_user_id: otherId, convId: key, hasUnread: false });
          }
        }

        // Mark conversations that have at least one unread message received by current user
        for (const msg of (data || [])) {
          if (msg.receiver_id === user.id && msg.read_at === null) {
            const otherId = msg.sender_id;
            const key = `${otherId}__${msg.item_id}`;
            if (seen.has(key)) {
              seen.get(key).hasUnread = true;
            }
          }
        }

        if (!cancelled) setConversations([...seen.values()]);
      } catch (err) {
        console.error('读取会话失败:', err);
        if (!cancelled) setConversations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user?.id]);

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
            Messages
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
            与买家或卖家关于商品的私信。
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border/50 p-5 flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-secondary flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-secondary rounded w-1/3" />
                  <div className="h-3 bg-secondary rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg text-muted-foreground">暂无私信</p>
            <Link
              to="/"
              className="mt-5 inline-block text-sm text-muted-foreground underline hover:text-foreground"
            >
              去逛逛
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => {
              const cover = conv.items?.photo_urls?.[0];
              return (
                <Link
                  key={conv.convId}
                  to={`/messages/${encodeURIComponent(conv.convId)}`}
                  className="flex items-center gap-4 rounded-2xl border border-border/50 bg-background p-5 hover:bg-secondary/30 transition-colors"
                >
                  {cover ? (
                    <img src={cover} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-secondary flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {conv.items?.name || '未知商品'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {conv.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {conv.hasUnread && (
                      <span className="w-2 h-2 rounded-full bg-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(conv.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
