import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/home/HeroSection';
import DestinationGrid from '@/components/home/DestinationGrid';
import AIStylerSection from '@/components/home/AIStylerSection';
import RecommendedSection from '@/components/home/RecommendedSection';
import InspirationSection from '@/components/home/InspirationSection';
import CTABanner from '@/components/home/CTABanner';
import Footer from '@/components/layout/Footer';
import PostItemDialog from '@/components/dialogs/PostItemDialog';
import SafetyGuideDialog from '@/components/dialogs/SafetyGuideDialog';

export default function Home() {
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('hc_safety_seen');
    if (!seen) setSafetyOpen(true);
  }, []);

  const closeSafety = () => {
    localStorage.setItem('hc_safety_seen', '1');
    setSafetyOpen(false);
  };

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

      <div id="recommended" className="scroll-mt-24">
        <RecommendedSection />
      </div>

      <AIStylerSection />

      <InspirationSection />

      <DestinationGrid />

      <CTABanner onPostItem={() => setPostDialogOpen(true)} />

      <Footer />

      <PostItemDialog
        open={postDialogOpen}
        onOpenChange={setPostDialogOpen}
      />

      <SafetyGuideDialog open={safetyOpen} onClose={closeSafety} />
    </div>
  );
}
