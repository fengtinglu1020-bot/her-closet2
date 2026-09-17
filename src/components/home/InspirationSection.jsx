import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const FALLBACK = [
  {
    location: '坎昆',
    detail: '海边度假风',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
  {
    location: '马德里',
    detail: '欧式街头风',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  },
  {
    location: '纽约',
    detail: '都市复古风',
    image: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=800&q=80',
  },
];

function parseLocation(raw) {
  const parts = raw.split(/[,，·\-\/]/);
  return { main: parts[0].trim(), detail: parts.slice(1).join(', ').trim() };
}

export default function InspirationSection() {
  const [cards, setCards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('items')
        .select('location, photo_urls, outfit_urls, name')
        .not('location', 'is', null)
        .neq('location', '');

      if (!data || data.length === 0) { setCards(FALLBACK); return; }

      // Group by location, keep best image per location
      const map = {};
      data.forEach(item => {
        const loc = item.location.trim();
        if (!loc) return;
        if (!map[loc]) map[loc] = { count: 0, images: [] };
        map[loc].count++;
        const img = item.outfit_urls?.[0] || item.photo_urls?.[0];
        if (img) map[loc].images.push(img);
      });

      const top = Object.entries(map)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3)
        .map(([loc, val]) => {
          const { main, detail } = parseLocation(loc);
          return {
            location: main,
            detail: detail || `${val.count} 件穿搭`,
            raw: loc,
            image: val.images[0] || null,
            count: val.count,
          };
        });

      if (top.length < 3) {
        setCards([...top, ...FALLBACK.slice(top.length)]);
      } else {
        setCards(top);
      }
    }
    load();
  }, []);

  return (
    <section id="style-section" className="py-16 sm:py-20 scroll-mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase">
            旅行穿搭灵感
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-serif italic">
            来自真实用户的出行穿搭
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {cards.map((item, i) => (
            <motion.div
              key={item.location + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <button
                onClick={() => navigate(`/search?q=${encodeURIComponent(item.raw || item.location)}`)}
                className="group relative block w-full aspect-[4/5] rounded-2xl overflow-hidden text-left"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.location}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <div className="inline-flex items-center rounded-full bg-white/15 backdrop-blur-sm px-2.5 py-1 text-[10px] sm:text-xs text-white/90 mb-3 tracking-wide">
                    HER CLOSET 编辑精选
                  </div>
                  <h3 className="text-white font-serif font-semibold text-lg leading-tight">
                    {item.location}
                  </h3>
                  {item.detail && (
                    <p className="text-white/65 text-xs mt-1">{item.detail}</p>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
