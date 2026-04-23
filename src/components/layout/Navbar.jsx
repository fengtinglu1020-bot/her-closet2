import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onPostItem }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: '风格' },
    { label: '场景' },
    { label: '季节' },
    { label: 'AI 搭配', icon: <Sparkles className="w-3 h-3" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">

          {/* Logo — left */}
          <Link to="/" className="flex-shrink-0">
            <span className="font-display text-xl font-black tracking-tight uppercase text-foreground">
              HerCloset
            </span>
          </Link>

          {/* Center nav — pill style like Measured */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1 bg-secondary/80 rounded-full px-2 py-1.5 border border-border/50">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-full transition-all"
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <Button
              onClick={onPostItem}
              className="h-9 px-5 rounded-full bg-foreground text-background hover:bg-foreground/90 text-sm font-medium"
            >
              发布闲置
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left rounded-xl hover:bg-secondary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
              <div className="pt-2">
                <Button
                  onClick={() => { onPostItem(); setMobileOpen(false); }}
                  className="w-full rounded-full bg-foreground text-background"
                >
                  发布闲置
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
