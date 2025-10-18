import HeroSection from '../../components/home/HeroSection';
import WhoWeAreSection from '../../components/home/WhoWeAreSection';
import ProductsSliderSection from '../../components/home/ProductsSliderSection';
import ServicesSection from '../../components/home/ServicesSection';
import PetGallery from '../../components/home/PetGallerySection';
import GoldenTagPromo from '../../components/home/GoldenTagSection';
import HowTagWorks from '../../components/home/HowTagWorksSection';
import FundingCTA from '../../components/home/FundingSection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <WhoWeAreSection />
      <ProductsSliderSection />
      <ServicesSection />
      <PetGallery />
      <GoldenTagPromo />
      <HowTagWorks />
      <FundingCTA />
    </main>
  );
}