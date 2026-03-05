import { SearchHero } from '@/components/search/SearchHero';
import { FeaturedDeals } from '@/components/ui/FeaturedDeals';
import { WhyUs } from '@/components/ui/WhyUs';

export default function HomePage() {
  return (
    <>
      <SearchHero />
      <FeaturedDeals />
      <WhyUs />
    </>
  );
}
