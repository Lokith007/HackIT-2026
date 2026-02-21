import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/landing/HeroSection';
import { SecurityBadges } from '@/components/SecurityBadges';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { LandingNav } from '@/components/landing/LandingNav';

const Scene3D = dynamic(() => import('@/components/Scene3D').then((m) => m.Scene3D), {
  ssr: false,
  loading: () => <div className="absolute inset-0 z-0 bg-navy-950" />,
});

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <LandingNav />
      <Scene3D />
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <HeroSection />
        <div className="mt-16 w-full max-w-2xl">
          <SecurityBadges />
        </div>
      </div>
      <FeaturesSection />
    </main>
  );
}
