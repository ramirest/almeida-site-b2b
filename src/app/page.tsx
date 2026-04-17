import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import WhyUsSection from '@/components/WhyUsSection';
import ProductsSection from '@/components/ProductsSection';
import B2BPortalInfoSection from '@/components/B2BPortalInfoSection';
import ChatWidget from '@/components/ChatWidget';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ProductsSection />
        <ServicesSection />
        <B2BPortalInfoSection />
        <WhyUsSection />
      </main>
      <ChatWidget />
      <Footer />
    </>
  );
}
