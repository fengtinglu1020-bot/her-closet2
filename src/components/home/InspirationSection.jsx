import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const INSPIRATIONS = [
  {
    title: '三亚海边出片日记',
    subtitle: '买家晒单 · 法式碎花裙',
    image:
      'https://media.base44.com/images/public/69e9a85f2f4419a5ac4fc769/05d384165_generated_d7ed6259.png',
    slug: 'sanya-diary',
  },
  {
    title: '日落海滩拍照灵感',
    subtitle: '买家晒单 · 白色吊带裙',
    image:
      'https://media.base44.com/images/public/69e9a85f2f4419a5ac4fc769/31b9194dc_generated_2da471ec.png',
    slug: 'sunset-diary',
  },
  {
    title: '巴厘岛度假穿搭记录',
    subtitle: '买家晒单 · 碧蓝套装',
    image:
      'https://media.base44.com/images/public/69e9a85f2f4419a5ac4fc769/b375de800_generated_fc505c93.png',
    slug: 'bali-diary',
  },
];

export default function InspirationSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase">
              出片灵感
            </h2>
            <p className="mt-2 text-sm text-muted-foreground font-serif italic">
              看看大家买到衣服之后，是怎么穿去旅行、怎么拍出片的
            </p>
          </div>

          <Link to="/inspiration/sanya-diary">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              查看更多
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {INSPIRATIONS.map((item, i) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <Link
                to={`/inspiration/${item.slug}`}
                className="group relative block aspect-[4/5] rounded-2xl overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <div className="inline-flex items-center rounded-full bg-white/15 backdrop-blur-sm px-2.5 py-1 text-[10px] sm:text-xs text-white/90 mb-3">
                    买家出片
                  </div>

                  <h3 className="text-white font-serif font-semibold text-sm sm:text-base mb-1">
                    {item.title}
                  </h3>

                  <p className="text-white/75 text-xs sm:text-sm">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
