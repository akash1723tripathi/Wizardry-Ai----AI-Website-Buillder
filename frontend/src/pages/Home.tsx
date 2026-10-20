import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HeroSection from '../components/landing/HeroSection'
import TrustedBrand from '../components/landing/TrustedBrand'
import FeaturesSection from '../components/landing/FeaturesSection'
import BuildProcess from '../components/landing/BuildProcess'
import PricingSection from '../components/landing/PricingSection'
import Testimonials from '../components/landing/Testimonials'
import CallToAction from '../components/landing/CallToAction'
import LenisScroll from '../components/landing/LenisScroll'

const Home = () => {
      return (
            <div className="bg-white text-gray-800 text-sm antialiased min-h-screen">
                  <LenisScroll />
                  <Navbar />
                  <main className="px-4 py-4 md:px-16 lg:px-24 xl:px-32">
                        <HeroSection />
                        <TrustedBrand />
                        <FeaturesSection />
                        <BuildProcess />
                        <PricingSection />
                        <Testimonials />
                        <CallToAction />
                  </main>
                  <Footer />
            </div>
      )
}

export default Home