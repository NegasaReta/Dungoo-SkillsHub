import CallToAction from '../components/landing/CallToAction.jsx'
import Differentiators from '../components/landing/Differentiators.jsx'
import FeatureGrid from '../components/landing/FeatureGrid.jsx'
import Footer from '../components/landing/Footer.jsx'
import Hero from '../components/landing/Hero.jsx'
import HowItWorks from '../components/landing/HowItWorks.jsx'
import Navbar from '../components/landing/Navbar.jsx'
import PassportPreview from '../components/landing/PassportPreview.jsx'
import ProblemStats from '../components/landing/ProblemStats.jsx'

export default function Landing() {
  return (
    <div className="bg-white">
      <Navbar />
      <main>
        <Hero />
        <ProblemStats />
        <HowItWorks />
        <FeatureGrid />
        <PassportPreview />
        <Differentiators />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}
