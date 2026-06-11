import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function MessageThread() {
  const { conversationId } = useParams();
  const { user, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [item, setItem] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const [otherUserId, itemId] = decodeURIComponent(conversationId || '').split('__');

  useEffect(() => {
    if (!isLoadingAuth && !user) navigate('/login');
  }, [isLoadingAuth, user, navigate]);

  // Load item name + cover for the header
  useEffect(() => {
    if (!itemId) return;
    supabase
      .from('items')
      .select('id, name, photo_urls')
      .eq('id', itemId)
      .single()
      .then(({ data }) => setItem(data));
  }, [itemId]);

  const markAsRead = async () => {
    if (!user?.id || !otherUserId || !itemId) return;
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('receiver_id', user.id)
      .eq('sender_id', otherUserId)
      .eq('item_id', itemId)
      .is('read_at', null);
  };

  const loadMessages = async () => {
    if (!user?.id || !otherUserId || !itemId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at')
      .eq('item_id', itemId)
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),` +
        `and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true });

    if (!error) setMessages(data || []);
    setLoading(false);
    await markAsRead();
  };

  useEffect(() => {
    loadMessages();
  }, [user?.id, otherUserId, itemId]);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text || sending) return;
    try {
      setSending(true);
      const { error } = await supabase.from('messages').insert({
        sender_id:   user.id,
        receiver_id: otherUserId,
        item_id:     itemId,
        content:     text,
      });
      if (error) throw error;
      setContent('');
      await loadMessages();
    } catch (err) {
      console.error('发送失败:', err);
    } finally {
      setSending(false);
    }
  };

  if (isLoadingAuth || !user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          {item && (
            <Link
              to={`/item/${item.id}`}
              className="flex items-center gap-2 ml-2 hover:opacity-80 transition-opacity"
            >
              {item.photo_urls?.[0] && (
                <img
                  src={item.photo_urls[0]}
                  alt={item.name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              )}
              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {item.name}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`animate-pulse flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="h-9 bg-secondary rounded-2xl w-48" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground pt-20">
            还没有消息，发送第一条吧
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'bg-foreground text-background rounded-br-sm'
                    : 'bg-secondary text-foreground rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-xl border-t border-border/50">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex gap-3">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="发送消息…"
            className="flex-1 h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
          <Button
            type="submit"
            disabled={!content.trim() || sending}
            className="h-11 px-5 rounded-xl bg-foreground text-background hover:bg-foreground/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
