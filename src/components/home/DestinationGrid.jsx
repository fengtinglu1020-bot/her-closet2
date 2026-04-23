import React from 'react';
import { motion } from 'framer-motion';

const DESTINATIONS = [
  {
    name: '三亚 · 海边',
    image: 'https://media.base44.com/images/public/69e9a85f2f4419a5ac4fc769/951a7752e_generated_682aef49.png',
    className: 'col-span-1 row-span-1',
  },
  {
    name: '大理 · 日落',
    image: 'https://media.base44.com/images/public/69e9a85f2f4419a5ac4fc769/1b77dcc77_generated_966ad0cd.png',
    className: 'col-span-1 row-span-1',
  },
  {
    name: '巴厘岛 · 度假',
    image: 'https://media.base44.com/images/public/69e9a85f2f4419a5ac4fc769/dd2a403ca_generated_b6e7a7b0.png',
    className: 'col-span-1 row-span-1',
  },
  {
    name: '厦门 · 文艺',
    image: 'https://media.base44.com/images/public/69e9a85f2f4419a5ac4fc769/f33035aec_generated_37f642d6.png',
    className: 'col-span-1 row-span-1',
  },
];

export default function DestinationGrid() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase">
              热门目的地
            </h2>
            <p className="mt-2 text-sm text-muted-foreground font-serif italic">
              发现最适合出片的旅行穿搭灵感
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {DESTINATIONS.map((dest, i) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`${dest.className} group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer`}
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <h3 className="text-white font-medium text-sm sm:text-base tracking-wide">
                  {dest.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
