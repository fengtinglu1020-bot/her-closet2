import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/home/HeroSection';
import DestinationGrid from '@/components/home/DestinationGrid';
import AIStylerSection from '@/components/home/AIStylerSection';
import RecommendedSection from '@/components/home/RecommendedSection';
import InspirationSection from '@/components/home/InspirationSection';
import CTABanner from '@/components/home/CTABanner';
import Footer from '@/components/layout/Footer';
import PostItemDialog from '@/components/dialogs/PostItemDialog';

export default function Home() {
  const [postDialogOpen, setPostDialogOpen] = useState(false);

  const scrollToRecommended = () => {
    document.getElementById('recommended')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onPostItem={() => setPostDialogOpen(true)} />

      <HeroSection
        onBrowse={scrollToRecommended}
        onPostItem={() => setPostDialogOpen(true)}
      />

      {/* 场景（你现在 DestinationGrid 可以当“场景”） */}
      <div id="scene-section" className="scroll-mt-24">
        <DestinationGrid />
      </div>

      {/* AI 搭配 */}
      <div id="ai-section" className="scroll-mt-24">
        <AIStylerSection />
      </div>

      {/* 推荐（你原本就有） */}
      <div id="recommended" className="scroll-mt-24">
        <RecommendedSection />
      </div>

      {/* 这里暂时拿 Inspiration 当风格 */}
      <div id="style-section" className="scroll-mt-24">
        <InspirationSection />
      </div>

      {/* 这里先临时当“季节”（后面可以单独做模块） */}
      <div id="season-section" className="scroll-mt-24">
        <CTABanner onPostItem={() => setPostDialogOpen(true)} />
      </div>

      <Footer />

      <PostItemDialog
        open={postDialogOpen}
        onOpenChange={setPostDialogOpen}
      />
    </div>
  );
}
