import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import PricingSection from "../components/landing/PricingSection"
import PageTransition from "../components/PageTransition"

const Pricing = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-sm text-slate-300">
        <Navbar />
        <main className="px-4 pb-32 md:px-16 lg:px-24 xl:px-32">
          <PricingSection />
        </main>
        <Footer />
      </div>
    </PageTransition>
  )
}

export default Pricing
