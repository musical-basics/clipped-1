import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { BentoGrid } from "@/components/landing/bento-grid"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Pricing } from "@/components/landing/pricing"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <Hero />
      <BentoGrid />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  )
}
