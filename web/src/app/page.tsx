import { SearchHero } from '@/components/search/SearchHero';
import { FeaturedDeals } from '@/components/ui/FeaturedDeals';
import { Destinations } from '@/components/home/Destinations';
import { WhyUs } from '@/components/ui/WhyUs';
import { CTASection } from '@/components/home/CTASection';
import { Newsletter } from '@/components/home/Newsletter';
import { RecentlyViewed } from '@/components/ui/RecentlyViewed';

export default function HomePage() {
  return (
    <>
      <SearchHero />
      <FeaturedDeals />
      <RecentlyViewed className="section py-8" />
      <Destinations />
      <WhyUs />
      <CTASection />
      <Newsletter />
    </>
  );
}
