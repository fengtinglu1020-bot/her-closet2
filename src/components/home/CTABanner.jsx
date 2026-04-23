import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CTA_BG = "https://media.base44.com/images/public/69e9a85f2f4419a5ac4fc769/2196f58f3_generated_623416d8.png";

export default function CTABanner({ onPostItem }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <img
            src={CTA_BG}
            alt="Travel fashion accessories"
            className="w-full h-48 sm:h-56 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
          <div className="absolute inset-0 flex items-center justify-between px-8 sm:px-12">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-black text-background tracking-tight uppercase">
                Give your outfit a second life
              </h3>
              <p className="text-background/70 text-sm mt-1.5 font-serif italic">
                一条裙子的旅行，不只属于你
              </p>
            </div>
            <Button
              onClick={onPostItem}
              className="h-11 px-6 sm:px-8 rounded-full bg-background text-foreground hover:bg-background/90 font-medium text-sm whitespace-nowrap"
            >
              发布闲置
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
