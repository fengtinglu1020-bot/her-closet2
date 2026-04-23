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
      <HeroSection onBrowse={scrollToRecommended} onPostItem={() => setPostDialogOpen(true)} />
      <DestinationGrid />
      <AIStylerSection />
      <div id="recommended">
        <RecommendedSection />
      </div>
      <InspirationSection />
      <CTABanner onPostItem={() => setPostDialogOpen(true)} />
      <Footer />
      <PostItemDialog open={postDialogOpen} onOpenChange={setPostDialogOpen} />
    </div>
  );
}
