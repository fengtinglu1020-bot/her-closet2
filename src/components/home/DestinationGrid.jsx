import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const FALLBACK = [
  {
    location: '坎昆',
    detail: 'Cancun, Mexico',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    location: '马德里',
    detail: 'Madrid, Spain',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    location: '纽约',
    detail: 'New York, USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
  },
];

function parseLocation(raw) {
  const parts = raw.split(/[,，·\-\/]/);
  return {
    main: parts[0].trim(),
    detail: parts.slice(1).join(', ').trim(),
  };
}

export default function DestinationGrid() {
  const [destinations, setDestinations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('items')
        .select('location, photo_urls, outfit_urls')
        .not('location', 'is', null)
        .neq('location', '');

      if (!data || data.length === 0) { setDestinations(FALLBACK); return; }

      const map = {};
      data.forEach(item => {
        const loc = item.location.trim();
        if (!loc) return;
        if (!map[loc]) map[loc] = { count: 0, image: null };
        map[loc].count++;
        if (!map[loc].image) {
          map[loc].image = item.photo_urls?.[0] || item.outfit_urls?.[0] || null;
        }
      });

      const top = Object.entries(map)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3)
        .map(([loc, val]) => {
          const { main, detail } = parseLocation(loc);
          return { location: main, detail, raw: loc, image: val.image, count: val.count };
        });

      if (top.length < 3) {
        const fill = FALLBACK.slice(top.length);
        setDestinations([...top, ...fill]);
      } else {
        setDestinations(top);
      }
    }
    load();
  }, []);

  return (
    <section id="scene-section" className="py-16 sm:py-20 scroll-mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase">
            出片目的地
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-serif italic">
            大家最近都在这些地方出片
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {destinations.map((item, i) => (
            <motion.div
              key={item.location + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-serif font-semibold text-xl leading-tight">
                    {item.location}
                  </h3>
                  {item.detail && (
                    <p className="text-white/60 text-xs mt-1">{item.detail}</p>
                  )}
                  {item.count && (
                    <p className="text-white/50 text-xs mt-0.5">{item.count} 件穿搭</p>
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
