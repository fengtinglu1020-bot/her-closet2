import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HERO_BG = "https://media.base44.com/images/public/69e9a85f2f4419a5ac4fc769/69cf3af57_generated_cd4ba7e2.png";

export default function HeroSection({ onBrowse, onPostItem }) {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt="Fashion editorial background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[75vh] items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="py-16 lg:py-24"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">旅行穿搭 · 二手流转</span>
            </div>

            <h1 className="font-display text-[72px] sm:text-[100px] lg:text-[120px] font-black leading-none tracking-tight text-foreground uppercase">
              HER
              <br />
              <span className="text-accent">CLOSET</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed font-serif italic">
              穿过一次的漂亮裙子，值得去找到下一个喜欢它的人
            </p>

            <div className="flex items-center gap-4 mt-10">
              <Button
                onClick={onBrowse}
                className="h-12 px-8 rounded-full bg-foreground text-background hover:bg-foreground/90 text-sm font-medium tracking-wide"
              >
                逛一逛
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                onClick={onPostItem}
                variant="outline"
                className="h-12 px-8 rounded-full border-foreground/20 hover:bg-foreground/5 text-sm font-medium tracking-wide"
              >
                发布闲置
              </Button>
            </div>
          </motion.div>

          {/* Right: Destination Preview Cards - visible on lg */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
