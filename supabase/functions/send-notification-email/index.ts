import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://her-closet.vercel.app';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Service role client — required to read auth.users email addresses
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function getUserEmail(userId: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data?.user?.email) return null;
  return data.user.email;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'HerCloset <noreply@hercloset.app>',
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

function btn(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#111;color:#fff;padding:12px 28px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.3px;">${label}</a>`;
}

function layout(body: string) {
  return `<!DOCTYPE html>
<html lang="zh">
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;padding:40px 36px;border:1px solid #eee;">
        <tr><td>
          <p style="margin:0 0 32px;font-size:18px;font-weight:800;letter-spacing:-0.5px;color:#111;">HerCloset ✦</p>
          ${body}
          <hr style="border:none;border-top:1px solid #f0f0f0;margin:32px 0;" />
          <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
            此邮件由 HerCloset 自动发出，请勿直接回复。<br/>
            你收到此邮件是因为你在 HerCloset 有相关动态。
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  let payload: Record<string, string>;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: CORS });
  }

  const { type } = payload;

  try {
    // ── new_message ────────────────────────────────────────────────────────────
    if (type === 'new_message') {
      const { messageId } = payload;
      if (!messageId) throw new Error('Missing messageId');

      const { data: msg, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, item_id, content, items(name)')
        .eq('id', messageId)
        .single();
      if (error || !msg) throw new Error('Message not found');

      const [recipientEmail, senderEmail] = await Promise.all([
        getUserEmail(msg.receiver_id),
        getUserEmail(msg.sender_id),
      ]);
      if (!recipientEmail) throw new Error('No recipient email');

      const convId = encodeURIComponent(`${msg.sender_id}__${msg.item_id}`);
      const itemName = (msg.items as any)?.name ?? '商品';
      const senderDisplay = senderEmail?.split('@')[0] ?? '买家';

      await sendEmail(
        recipientEmail,
        `✦ 你有一条关于「${itemName}」的新消息`,
        layout(`
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;">你有新消息 💬</p>
          <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
            <strong>${senderDisplay}</strong> 对你发布的 <strong>${itemName}</strong> 发来了一条消息：
          </p>
          <div style="background:#f7f7f7;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
            <p style="margin:0;font-size:15px;color:#333;line-height:1.7;font-style:italic;">"${msg.content}"</p>
          </div>
          <p style="margin:0 0 28px;font-size:14px;color:#888;">快去回复，别让买家等太久～</p>
          <p style="margin:0;">${btn('查看消息 →', `${SITE_URL}/messages/${convId}`)}</p>
        `)
      );
    }

    // ── new_order ──────────────────────────────────────────────────────────────
    else if (type === 'new_order') {
      const { orderId } = payload;
      if (!orderId) throw new Error('Missing orderId');

      const { data: order, error } = await supabase
        .from('orders')
        .select('seller_id, buyer_id, items(name)')
        .eq('id', orderId)
        .single();
      if (error || !order) throw new Error('Order not found');

      const [sellerEmail, buyerEmail] = await Promise.all([
        getUserEmail(order.seller_id),
        getUserEmail(order.buyer_id),
      ]);
      if (!sellerEmail) throw new Error('No seller email');

      const itemName = (order.items as any)?.name ?? '商品';
      const buyerDisplay = buyerEmail?.split('@')[0] ?? '买家';

      await sendEmail(
        sellerEmail,
        `✦ 有人想要你的「${itemName}」！`,
        layout(`
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;">你的闲置有人想买啦 🎉</p>
          <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
            买家 <strong>${buyerDisplay}</strong> 对你发布的 <strong>${itemName}</strong> 发出了购买请求，正在等待你的回应。
          </p>
          <p style="margin:0 0 28px;font-size:14px;color:#888;">
            尽快接受或拒绝，帮助买家做决定～
          </p>
          <p style="margin:0;">${btn('查看购买请求 →', `${SITE_URL}/orders`)}</p>
        `)
      );
    }

    // ── order_accepted ─────────────────────────────────────────────────────────
    else if (type === 'order_accepted') {
      const { orderId } = payload;
      if (!orderId) throw new Error('Missing orderId');

      const { data: order, error } = await supabase
        .from('orders')
        .select('buyer_id, seller_id, items(name)')
        .eq('id', orderId)
        .single();
      if (error || !order) throw new Error('Order not found');

      const [buyerEmail, sellerEmail] = await Promise.all([
        getUserEmail(order.buyer_id),
        getUserEmail(order.seller_id),
      ]);
      if (!buyerEmail) throw new Error('No buyer email');

      const itemName = (order.items as any)?.name ?? '商品';
      const sellerDisplay = sellerEmail?.split('@')[0] ?? '卖家';

      await sendEmail(
        buyerEmail,
        `✦ 好消息！卖家接受了你对「${itemName}」的请求`,
        layout(`
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;">购买请求已通过 ✓</p>
          <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
            卖家 <strong>${sellerDisplay}</strong> 接受了你对 <strong>${itemName}</strong> 的购买请求。
            你们可以通过站内消息联系，约定交付方式。
          </p>
          <p style="margin:0 0 28px;font-size:14px;color:#888;">
            恭喜入手新单品 🛍️ 希望你穿得开心～
          </p>
          <p style="margin:0;">${btn('查看订单 →', `${SITE_URL}/orders`)}</p>
        `)
      );
    }

    // ── order_declined ─────────────────────────────────────────────────────────
    else if (type === 'order_declined') {
      const { orderId } = payload;
      if (!orderId) throw new Error('Missing orderId');

      const { data: order, error } = await supabase
        .from('orders')
        .select('buyer_id, items(name)')
        .eq('id', orderId)
        .single();
      if (error || !order) throw new Error('Order not found');

      const buyerEmail = await getUserEmail(order.buyer_id);
      if (!buyerEmail) throw new Error('No buyer email');

      const itemName = (order.items as any)?.name ?? '商品';

      await sendEmail(
        buyerEmail,
        `关于「${itemName}」的购买请求`,
        layout(`
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;">这次没能成功 🌸</p>
          <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
            卖家这次未能接受你对 <strong>${itemName}</strong> 的购买请求，可能是时机不合适。
          </p>
          <p style="margin:0 0 28px;font-size:14px;color:#888;">
            别灰心，HerCloset 上还有很多等你的好货 ✦
          </p>
          <p style="margin:0;">${btn('继续逛逛 →', `${SITE_URL}/`)}</p>
        `)
      );
    }

    // ── order_completed ────────────────────────────────────────────────────────
    else if (type === 'order_completed') {
      const { orderId } = payload;
      if (!orderId) throw new Error('Missing orderId');

      const { data: order, error } = await supabase
        .from('orders')
        .select('buyer_id, items(name)')
        .eq('id', orderId)
        .single();
      if (error || !order) throw new Error('Order not found');

      const buyerEmail = await getUserEmail(order.buyer_id);
      if (!buyerEmail) throw new Error('No buyer email');

      const itemName = (order.items as any)?.name ?? '商品';

      await sendEmail(
        buyerEmail,
        `✦ 你的「${itemName}」交易已完成`,
        layout(`
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;">交易完成 🎀</p>
          <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
            你与卖家关于 <strong>${itemName}</strong> 的交易已顺利完成，感谢你使用 HerCloset！
          </p>
          <p style="margin:0 0 28px;font-size:14px;color:#888;">
            如果你有闲置的宝贝，也来 HerCloset 发布吧，让好物流转起来 ✦
          </p>
          <p style="margin:0;">${btn('查看订单 →', `${SITE_URL}/orders`)}</p>
        `)
      );
    }

    // ── unknown type ───────────────────────────────────────────────────────────
    else {
      return new Response(JSON.stringify({ error: `Unknown type: ${type}` }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(`[send-notification-email] type=${type}`, err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
